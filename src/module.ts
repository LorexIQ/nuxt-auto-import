import path from 'node:path';
import fs from 'node:fs';
import { defineNuxtModule, createResolver, useLogger, addImportsDir } from '@nuxt/kit';
import type { Nuxt } from '@nuxt/schema';
import defu from 'defu';
import type { AutoImportDefinesReturn, ModuleOptions } from './runtime/types';
import { AutoImport } from './runtime/autoImport';

function createBuildMeta(rootDir: string, files: AutoImportDefinesReturn) {
  const filePath = path.join(__dirname, 'runtime', 'buildMeta.ts');
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
  setup(options: Partial<ModuleOptions>, nuxt: Nuxt) {
    // @ts-ignore
    nuxt.options.runtimeConfig.public.autoImport = defu(nuxt.options.runtimeConfig.public.autoImport, options);
    const resolver = createResolver(import.meta.url);

    nuxt.hooks.hook('nitro:config', (nitroConfig) => {
      const autoImport = new AutoImport(nitroConfig, nuxt.options.runtimeConfig.public.autoImport as any);

      nuxt.hook('prepare:types', () => {
        useLogger('AutoImports').info('Generation AutoImports types...');
        autoImport.typeGenerator();
      });
      nuxt.hook('app:templatesGenerated', () => {
      });
      nuxt.hook('build:before', () => createBuildMeta(nitroConfig.rootDir!, autoImport.getDefines()));
    });

    // addPlugin(resolver.resolve('./runtime/plugin'));
    addImportsDir(resolver.resolve('./runtime/composables'));
    addImportsDir(resolver.resolve('./runtime/defines'));
  }
});
