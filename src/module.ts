import path from 'node:path';
import defu from 'defu';
import { defineNuxtModule, createResolver, useLogger, addImportsDir, addPlugin } from '@nuxt/kit';
import type { Nuxt } from '@nuxt/schema';
import { name, version } from '../package.json';
import type { ModuleOptions } from './runtime/types';
import { Module } from './runtime/autoImport';

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'autoImport'
  },
  defaults: {
    connectors: []
  },
  async setup(options: Partial<ModuleOptions>, nuxt: Nuxt) {
    // @ts-ignore
    nuxt.options.runtimeConfig.public.autoImport = defu(nuxt.options.runtimeConfig.public.autoImport, options);

    let updateTypesDelay: NodeJS.Timeout | undefined;
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
          autoImport.createConnectorsTypes();
        }
      }, 500);
    });
    nuxt.hook('prepare:types', (options) => {
      options.tsConfig.include = [
        ...(options.tsConfig.include || []),
        ...autoImport.createConnectorsTypes(true).map(p => createResolver(p).resolve())
      ];
    });
    nuxt.hook('app:templatesGenerated', () => {
      useLogger('Modules').info('Generation Modules types...');
      autoImport.createConnectorsTypes();
    });
    nuxt.hook('build:before', () => autoImport.createBuildMeta());

    addImportsDir(resolver.resolve('./runtime/defines'));
    addImportsDir(resolver.resolve('./runtime/composables'));
    addPlugin(resolver.resolve('./runtime/plugin'));
  }
});
