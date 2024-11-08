import path from 'node:path';
import fs from 'node:fs';
import { defineNuxtModule, addPlugin, createResolver, useLogger } from '@nuxt/kit';
import type { Nuxt } from '@nuxt/schema';
import defu from 'defu';
import type { FilesSearcherReturnBus, ModuleOptions } from './runtime/types';
import { autoImportConnectors } from './runtime';

function createBuildMeta(rootDir: string, files: { [name: string]: FilesSearcherReturnBus[] }) {
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

  const fileContent
    = `${definesImports}${definesImports.length ? '\n' : ''}
export default {${connectorVariables.length ? `\n  ${connectorVariables}\n` : ''}};
`;

  fs.writeFileSync(filePath, fileContent, 'utf-8');
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'auto-import',
    configKey: 'autoImport'
  },
  defaults: {},
  setup(options: Partial<ModuleOptions>, nuxt: Nuxt) {
    const resolver = createResolver(import.meta.url);
    nuxt.options.runtimeConfig.public.autoImports = defu(
      nuxt.options.runtimeConfig.public.autoImports,
      options
    );

    nuxt.hooks.hook('nitro:config', (config) => {
      const autoImport = autoImportConnectors(config);

      nuxt.options.runtimeConfig.public.autoImports = {
        root: config.rootDir!,
        files: autoImport.files,
        connectors: Object.entries(autoImport.files).reduce((accum, connector) => ({ ...accum, [connector[0]]: {} }), {})
      };

      nuxt.hook('app:templatesGenerated', () => {
        useLogger('AutoImports').info('Generation AutoImports types...');
        autoImport.generateTypes();
      });
      nuxt.hook('build:before', () => createBuildMeta(config.rootDir!, autoImport.files));
    });

    addPlugin(resolver.resolve('./runtime/plugin'));
  }
});
