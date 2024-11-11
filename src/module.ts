import path from 'node:path';
import fs from 'node:fs';
import { defineNuxtModule, createResolver, useLogger, addImportsDir, addPlugin } from '@nuxt/kit';
import type { Nuxt } from '@nuxt/schema';
import defu from 'defu';
import type { AutoImportDefinesReturn, ModuleOptions } from './runtime/types';
import { AutoImport } from './runtime/autoImport';

function createBuildMeta(rootDir: string, files: AutoImportDefinesReturn) {
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
    const resolver = createResolver(import.meta.url);
    const autoImport = new AutoImport(nuxt, resolver);
    await autoImport.readConnectors();

    nuxt.options.runtimeConfig.public.autoImport = autoImport.getConfig();
    console.log(nuxt.options.runtimeConfig.public.autoImport);

    // nuxt.hook('prepare:types', () => {
    //   useLogger('AutoImports').info('Generation AutoImports types...');
    //   autoImport.typeGenerator();
    // });
    nuxt.hook('app:templatesGenerated', () => {
      useLogger('AutoImports').info('Generation AutoImports types...');
      autoImport.typeGenerator();
    });
    nuxt.hook('build:before', () => createBuildMeta(nuxt.options.rootDir, autoImport.getDefines()));

    addImportsDir(resolver.resolve('./runtime/defines'));
    addImportsDir(resolver.resolve('./runtime/composables'));
    addPlugin(resolver.resolve('./runtime/plugin'));
  }
});
