import path from 'node:path';
import fs from 'node:fs';
import { defineNuxtModule, createResolver, useLogger, addImportsDir, addPlugin } from '@nuxt/kit';
import type { Nuxt } from '@nuxt/schema';
import defu from 'defu';
import type { ModuleDefinesReturn, ModuleOptions } from './runtime/types';
import { Module } from './runtime/autoImport';

function createBuildMeta(rootDir: string, files: ModuleDefinesReturn) {
  const filePath = path.join(__dirname, 'runtime', 'buildMeta.js');
  const definesImports = Object
    .values(files)
    .flat()
    .map((define) => {
      const defineRootPath = define.path
        .slice(rootDir!.length)
        .replaceAll('\\', '/')
        .split('.')
        .slice(0, -1)
        .join('.');
      return `import ${define.id} from '@${defineRootPath}';`;
    })
    .join('\n');
  const connectorVariables = Object
    .values(files)
    .flat()
    .map((define) => {
      return `${define.id}`;
    })
    .join(',\n  ');

  const fileContent = `${definesImports}${definesImports.length ? '\n' : ''}export default {${connectorVariables.length ? `\n  ${connectorVariables}\n` : ''}};\n`;

  fs.writeFileSync(filePath, fileContent, 'utf-8');
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'auto-import',
    configKey: 'autoImport'
  },
  defaults: {
    connectors: []
  },
  async setup(options: Partial<ModuleOptions>, nuxt: Nuxt) {
    // @ts-ignore
    nuxt.options.runtimeConfig.public.autoImport = defu(nuxt.options.runtimeConfig.public.autoImport, options);

    let updateTypesDelay: NodeJS.Timeout | undefined;
    let lastTypesPaths: string[] = [];
    const resolver = createResolver(import.meta.url);
    const autoImport = new Module(nuxt, resolver);
    await autoImport.readConnectors();

    nuxt.options.runtimeConfig.public.autoImport = autoImport.getConfig();
    const watchedPaths = Object.values(autoImport.getDefines())
      .flat()
      .map(define => path.resolve(define.path));

    nuxt.hook('builder:watch', (event, p) => {
      clearTimeout(updateTypesDelay);
      updateTypesDelay = setTimeout(async () => {
        if (watchedPaths.includes(path.join(nuxt.options.rootDir, p))) {
          await autoImport.updateDefines();
          lastTypesPaths = autoImport.typeGenerator();
        }
      }, 500);
    });
    nuxt.hook('prepare:types', (options) => {
      for (const typePath of lastTypesPaths) {
        options.references.push({ path: typePath });
      }
    });
    nuxt.hook('app:templatesGenerated', () => {
      useLogger('Modules').info('Generation Modules types...');
      lastTypesPaths = autoImport.typeGenerator();
    });
    nuxt.hook('build:before', () => createBuildMeta(nuxt.options.rootDir, autoImport.getDefines()));

    addImportsDir(resolver.resolve('./runtime/defines'));
    addImportsDir(resolver.resolve('./runtime/composables'));
    addPlugin(resolver.resolve('./runtime/plugin'));
  }
});
