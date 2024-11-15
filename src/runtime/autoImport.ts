import fs from 'node:fs';
import path from 'node:path';
import type { Resolver } from '@nuxt/kit';
import type { Nuxt } from '@nuxt/schema';
import { resolveAlias } from '@nuxt/kit';
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
import tsMorphProject from './helpers/tsMorphProject';
import pathRelativeMove from './helpers/pathRelativeMove';
import logger from './helpers/logger';

export class Module {
  private readonly rootDir: string;
  private readonly debugEnabled: boolean;

  private readonly config: ModuleOptionsExtend;
  private readonly typeGeneratorListFunc: ModuleConnectorTypeGenerator[] = [];
  private readonly connectors: ModuleConnectorsReturn = {};
  private readonly defines: ModuleDefinesReturn = {};

  constructor(
    private readonly nuxtConfig: Nuxt,
    private readonly resolver: Resolver
  ) {
    this.debugEnabled = process.env.AUTO_IMPORT_DEBUG === '1';
    this.rootDir = this.nuxtConfig.options.rootDir;
    this.config = this._initConfig(nuxtConfig.options.runtimeConfig.public.autoImport as ModuleOptions);
  }

  private _initConfig(config: ModuleOptions): ModuleOptionsExtend {
    return {
      rootDir: this.rootDir,
      defines: {},
      data: {},
      configStateKey: config.configStateKey!,
      connectors: config.connectors
        .filter(p => p.endsWith('.ts') && !p.endsWith('.d.ts'))
        .map(p => path.resolve(this.rootDir, p))
    };
  }

  private async createDefiner(name: string, config: Required<ModuleConnector>, connectorPath: string, content: string) {
    const definesDir = this.resolver.resolve('runtime', 'defines');
    const defineName = `define${name[0].toUpperCase()}${name.slice(1)}`;
    const definePath = this.resolver.resolve('runtime', 'defines', `${name}.ts`);

    if (!fs.existsSync(definesDir)) fs.mkdirSync(definesDir);

    const parsedConnector = tsMorphProject.createSourceFile(`${name}.temp.ts`, content, { overwrite: true });
    const sourceFile = tsMorphProject.createSourceFile(definePath, '', { overwrite: true });

    sourceFile.addImportDeclaration({
      moduleSpecifier: '../types',
      isTypeOnly: true,
      namedImports: ['ModuleDefineConfig']
    });
    sourceFile.addImportDeclarations(parsedConnector.getImportDeclarations().map((imp) => {
      const structure = imp.getStructure();
      const filePath = resolveAlias(structure.moduleSpecifier);
      structure.moduleSpecifier = filePath === structure.moduleSpecifier ? filePath : pathRelativeMove(filePath, connectorPath, definePath);
      return structure;
    }));
    sourceFile.addTypeAliases(parsedConnector.getTypeAliases().map(tp => tp.getStructure()));
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
      if (!fs.existsSync(connectorPath)) {
        logger.warn(`Connector file wasn't found: '${connectorPath}'.`);
        continue;
      }

      let connectorName = path.basename(connectorPath).split('.').slice(0, -1).join('.');
      const connectorContent = fs.readFileSync(connectorPath, 'utf-8');

      (global as any).defineConnector = defineConnector;
      const connectorFile = (await loadTsModule(connectorPath))?.default as ModuleConnectorReturn;

      if (!connectorFile) {
        logger.warn(`Error loading connector file: '${connectorPath}'.`);
        continue;
      }

      connectorName = connectorFile.config.name || connectorName;
      await this.createDefiner(connectorName, connectorFile.config, connectorPath, connectorContent);
      this.connectors[connectorName] = connectorFile;
    }

    await this.updateDefines();
  }

  async updateDefines() {
    Object.keys(this.defines).forEach(key => delete this.defines[key]);
    Object.keys(this.config.defines).forEach(key => delete this.config.defines[key]);
    this.typeGeneratorListFunc.splice(0);

    for (const [connectorName, file] of Object.entries(this.connectors)) {
      const executedFile = await file.exe(this, connectorName);

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

  getNuxtConfig() {
    return this.nuxtConfig;
  }

  isDebug() {
    return this.debugEnabled;
  }

  createConnectorsTypes(tryRead = false) {
    const typesDir = this.resolver.resolve('runtime', 'types', 'connectors');

    if (!fs.existsSync(typesDir)) fs.mkdirSync(typesDir);

    return this.typeGeneratorListFunc
      .map(file => file(typesDir, tryRead) as string)
      .filter(Boolean);
  }

  createBuildMeta() {
    const filePath = this.resolver.resolve('runtime', 'buildMeta.js');
    const definesImports = Object
      .values(this.defines)
      .flat()
      .map((define) => {
        const defineRootPath = define.path
          .slice(this.rootDir.length)
          .replaceAll('\\', '/')
          .split('.')
          .slice(0, -1)
          .join('.');
        return `import ${define.id} from '@${defineRootPath}';`;
      })
      .join('\n');
    const connectorVariables = Object
      .values(this.defines)
      .flat()
      .map((define) => {
        return `${define.id}`;
      })
      .join(',\n  ');

    const fileContent = `${definesImports}${definesImports.length ? '\n' : ''}export default {${connectorVariables.length ? `\n  ${connectorVariables}\n` : ''}};\n`;

    fs.writeFileSync(filePath, fileContent, 'utf-8');
  }
}

export type ModuleClass = Module;
