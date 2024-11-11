import fs from 'node:fs';
import path from 'node:path';
import type { Resolver } from '@nuxt/kit';
import { IndentationText, Project } from 'ts-morph';
import type { Nuxt } from '@nuxt/schema';
import type {
  AutoImportConnector,
  AutoImportConnectorFuncReturn,
  AutoImportConnectorReturn,
  AutoImportConnectorTypeGenerator,
  AutoImportDefinesReturn,
  ModuleOptions,
  ModuleOptionsExtend
} from './types';
import defineConnector from './composables/defineConnector';
import loadTsModule from './helpers/loadTsModule';

export class AutoImport {
  private readonly rootDir: string;
  private readonly project = new Project({
    tsConfigFilePath: './tsconfig.json',
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces
    }
  });

  private readonly config: ModuleOptionsExtend;
  private readonly typeGeneratorListFunc: AutoImportConnectorTypeGenerator[] = [];
  private readonly connectors: AutoImportConnectorFuncReturn[] = [];
  private readonly defines: AutoImportDefinesReturn = {};

  constructor(
    private readonly nuxtConfig: Nuxt,
    private readonly resolver: Resolver
  ) {
    this.rootDir = this.nuxtConfig.options.rootDir;
    this.config = this._initConfig((nuxtConfig.options as any).autoImport);
  }

  private _initConfig(config: ModuleOptions): ModuleOptionsExtend {
    return {
      rootDir: this.rootDir,
      defines: {},
      data: {},
      connectors: config.connectors
        .filter(p => p.endsWith('.ts') && !p.endsWith('.d.ts'))
        .map(p => path.resolve(this.rootDir, p))
    };
  }

  private async createDefiner(name: string, config: Required<AutoImportConnector>, content: string) {
    const typeMatch = content.match(new RegExp(`type\\s+${config.defineConfigTypeName}\\s*=\\s*(\\{[\\s\\S]*?\\});`));
    const definesDir = this.resolver.resolve('runtime', 'defines');
    const defineName = `define${name[0].toUpperCase()}${name.slice(1)}`;
    const definePath = this.resolver.resolve('runtime', 'defines', `${name}.ts`);
    let defineType = '';

    if (!fs.existsSync(definesDir)) fs.mkdirSync(definesDir);
    if (typeMatch?.length) defineType = typeMatch[0];

    const sourceFile = this.project.createSourceFile(definePath, '', {
      overwrite: true
    });

    sourceFile.addStatements('import type { AutoImportDefineConfig } from \'../types\';');
    sourceFile.addStatements(defineType);
    sourceFile.addFunction({
      name: defineName,
      isExported: true,
      parameters: [{ name: 'config', type: 'Define' }],
      returnType: 'AutoImportDefineConfig',
      statements: [
        'return {',
        `  type: '${defineName}',`,
        '  data: config,',
        `  ${config.dataBuilder.toString()},`,
        `  ${config.onAppCreating.toString()}`,
        '};'
      ]
    });

    sourceFile.saveSync();

    (global as any)[defineName] = (await loadTsModule(definePath)).defineIcons;
  }

  async readConnectors() {
    const importedNames: string[] = [];
    const defines: AutoImportDefinesReturn = {};

    for (const connectorPath of this.config.connectors) {
      if (!fs.existsSync(connectorPath)) continue;

      let connectorName = path.basename(connectorPath).split('.').slice(0, -1).join('.');
      const connectorContent = fs.readFileSync(connectorPath, 'utf-8');

      (global as any).defineConnector = defineConnector;
      const connectorFile = (await loadTsModule(connectorPath))?.default as AutoImportConnectorReturn;

      if (!connectorFile) continue;

      connectorName = connectorFile.config.name || connectorName;
      await this.createDefiner(connectorName, connectorFile.config, connectorContent);
      const executedFile = await connectorFile.exe(this.nuxtConfig, connectorName);

      if (executedFile.type !== 'AutoImportConnector' || importedNames.includes(connectorName)) continue;

      importedNames.push(connectorName);
      this.connectors.push(executedFile);
      this.typeGeneratorListFunc.push(executedFile.typeGenerator);

      defines[connectorName] = executedFile.files;
    }

    Object.assign(this.defines, defines);
    Object.assign(this.config.defines, defines);
  }

  getConnector() {
    return this.connectors;
  }

  getDefines() {
    return this.defines;
  }

  getConfig() {
    return this.config;
  }

  typeGenerator() {
    const typesDir = path.join(this.rootDir, 'types');
    const autoImportsTypesDir = path.join(typesDir, 'autoImports');

    if (!fs.existsSync(autoImportsTypesDir)) {
      if (!fs.existsSync(typesDir)) fs.mkdirSync(typesDir);
      fs.mkdirSync(autoImportsTypesDir);
    }

    this.typeGeneratorListFunc.forEach(file => file(autoImportsTypesDir));

    const filesTypes = fs
      .readdirSync(autoImportsTypesDir)
      .filter(file => file !== 'index.ts' && !fs.lstatSync(path.join(autoImportsTypesDir, file)).isDirectory())
      .map(file => file.slice(0, -3));
    fs.writeFileSync(path.join(autoImportsTypesDir, 'index.ts'), `${filesTypes.map(file => `export * from './${file}';`).join('\n')}\n`);
  }
}
