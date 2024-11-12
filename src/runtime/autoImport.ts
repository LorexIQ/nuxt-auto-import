import fs from 'node:fs';
import path from 'node:path';
import type { Resolver } from '@nuxt/kit';
import type { Nuxt } from '@nuxt/schema';
import type {
  ModuleConnector,
  ModuleConnectorReturn,
  ModuleConnectorsReturn,
  ModuleConnectorTypeGenerator,
  ModuleDefinesReturn,
  ModuleOptions,
  ModuleOptionsExtend
} from './types';
import defineConnector from './composables/defineConnector';
import loadTsModule from './helpers/loadTsModule';
import getTsMorphProject from './helpers/getTsMorphProject';

export class Module {
  private readonly rootDir: string;
  private readonly project = getTsMorphProject();

  private readonly config: ModuleOptionsExtend;
  private readonly typeGeneratorListFunc: ModuleConnectorTypeGenerator[] = [];
  private readonly connectors: ModuleConnectorsReturn = {};
  private readonly defines: ModuleDefinesReturn = {};

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

  private async createDefiner(name: string, config: Required<ModuleConnector>, content: string) {
    const definesDir = this.resolver.resolve('runtime', 'defines');
    const defineName = `define${name[0].toUpperCase()}${name.slice(1)}`;
    const definePath = this.resolver.resolve('runtime', 'defines', `${name}.ts`);

    if (!fs.existsSync(definesDir)) fs.mkdirSync(definesDir);

    const test = this.project.createSourceFile(`test123${name}.ts`, content);
    const sourceFile = this.project.createSourceFile(definePath, '', {
      overwrite: true
    });

    sourceFile.addImportDeclaration({
      moduleSpecifier: '../types',
      isTypeOnly: true,
      namedImports: ['ModuleDefineConfig']
    });
    sourceFile.addImportDeclarations(test.getImportDeclarations().map(imp => imp.getStructure()));
    sourceFile.addTypeAliases(test.getTypeAliases().map(tp => tp.getStructure()));
    sourceFile.addFunction({
      name: defineName,
      isExported: true,
      parameters: [{ name: 'config', type: 'Define' }],
      returnType: 'ModuleDefineConfig',
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

    (global as any)[defineName] = (await loadTsModule(definePath))[defineName];
  }

  async readConnectors() {
    for (const connectorPath of this.config.connectors) {
      if (!fs.existsSync(connectorPath)) continue;

      let connectorName = path.basename(connectorPath).split('.').slice(0, -1).join('.');
      const connectorContent = fs.readFileSync(connectorPath, 'utf-8');

      (global as any).defineConnector = defineConnector;
      const connectorFile = (await loadTsModule(connectorPath))?.default as ModuleConnectorReturn;

      if (!connectorFile) continue;

      connectorName = connectorFile.config.name || connectorName;
      await this.createDefiner(connectorName, connectorFile.config, connectorContent);
      this.connectors[connectorName] = connectorFile;
    }

    await this.updateDefines();
  }

  async updateDefines() {
    Object.keys(this.defines).forEach(key => delete this.defines[key]);
    Object.keys(this.config.defines).forEach(key => delete this.config.defines[key]);
    this.typeGeneratorListFunc.splice(0);

    for (const [connectorName, file] of Object.entries(this.connectors)) {
      const executedFile = await file.exe(this.nuxtConfig, connectorName);

      if (executedFile.type !== 'ModuleConnector') continue;

      this.typeGeneratorListFunc.push(executedFile.typeGenerator);
      this.defines[connectorName] = executedFile.files;
    }

    Object.assign(this.config.defines, this.defines);
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
    const typesDir = this.resolver.resolve('runtime', 'types', 'connectors');

    if (!fs.existsSync(typesDir)) fs.mkdirSync(typesDir);

    return this.typeGeneratorListFunc
      .map(file => file(typesDir) as string)
      .filter(Boolean);
  }
}
