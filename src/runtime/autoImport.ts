import fs from 'node:fs';
import path, { join } from 'node:path';
import { createResolver } from '@nuxt/kit';
import { IndentationText, Project } from 'ts-morph';
import type {
  AutoImportConnector,
  AutoImportConnectorFuncReturn,
  AutoImportConnectorReturn, AutoImportConnectorTypeGenerator, AutoImportDefinesReturn,
  ModuleOptions,
  ModuleOptionsExtend
} from './types';
import defineConnector from './composables/defineConnector';

export class AutoImport {
  private resolver = createResolver(import.meta.url);
  private project = new Project({
    tsConfigFilePath: './tsconfig.json',
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces
    }
  });

  private config: ModuleOptionsExtend;
  private typeGeneratorListFunc: AutoImportConnectorTypeGenerator[] = [];
  private connectors: AutoImportConnectorFuncReturn[] = [];
  private defines: AutoImportDefinesReturn = {};

  constructor(private nitroConfig: any, config: ModuleOptions) {
    this.config = this._initConfig(config);
    this.readConnectors();
  }

  private _initConfig(config: ModuleOptions): ModuleOptionsExtend {
    return {
      rootDir: this.nitroConfig.rootDir!,
      defines: {},
      data: {},
      connectors: config.connectors
        .filter(p => p.endsWith('.ts') && !p.endsWith('.d.ts'))
        .map(p => path.resolve(this.nitroConfig.rootDir!, p))
    };
  }

  private createDefiner(name: string, config: Required<AutoImportConnector>, content: string) {
    const typeMatch = content.match(new RegExp(`type\\s+${config.defineConfigTypeName}\\s*=\\s*(\\{[\\s\\S]*?\\});`));
    const definesDir = this.resolver.resolve('./defines');
    const defineName = `define${name[0].toUpperCase()}${name.slice(1)}`;
    const definePath = this.resolver.resolve(`./defines/${name}.ts`);
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

    (global as any)[defineName] = require(definePath).defineIcons;
  }

  private readConnectors() {
    const importedNames: string[] = [];

    Object.assign(this.defines, this.config.connectors.reduce<AutoImportDefinesReturn>((accum, connectorPath) => {
      if (!fs.existsSync(connectorPath)) return accum;

      let connectorName = path.basename(connectorPath).split('.').slice(0, -1).join('.');
      const connectorContent = fs.readFileSync(connectorPath, 'utf-8');

      (global as any).defineConnector = defineConnector;
      const connectorFile = require(connectorPath)?.default as AutoImportConnectorReturn;

      if (!connectorFile) return accum;

      connectorName = connectorFile.config.name || connectorName;
      this.createDefiner(connectorName, connectorFile.config, connectorContent);
      const executedFile = connectorFile.exe(this.nitroConfig, connectorName);
      console.log(executedFile);

      if (executedFile.type !== 'AutoImportConnector' || importedNames.includes(connectorName)) return accum;

      importedNames.push(connectorName);
      this.connectors.push(executedFile);
      this.typeGeneratorListFunc.push(executedFile.typeGenerator);

      return {
        [connectorName]: executedFile.files,
        ...accum
      };
    }, {}));

    console.log(this.defines);
  }

  getConnector() {
    return this.connectors;
  }

  getDefines() {
    return this.defines;
  }

  typeGenerator() {
    const typesDir = join(this.nitroConfig.rootDir, 'types');
    const autoImportsTypesDir = join(typesDir, 'autoImports');

    if (!fs.existsSync(autoImportsTypesDir)) {
      if (!fs.existsSync(typesDir)) fs.mkdirSync(typesDir);
      fs.mkdirSync(autoImportsTypesDir);
    }

    this.typeGeneratorListFunc.forEach(file => file(autoImportsTypesDir));

    const filesTypes = fs
      .readdirSync(autoImportsTypesDir)
      .filter(file => file !== 'index.ts' && !fs.lstatSync(join(autoImportsTypesDir, file)).isDirectory())
      .map(file => file.slice(0, -3));
    fs.writeFileSync(join(autoImportsTypesDir, 'index.ts'), `${filesTypes.map(file => `export * from './${file}';`).join('\n')}\n`);
  }
}
