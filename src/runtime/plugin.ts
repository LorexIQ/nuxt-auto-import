import type { App } from 'vue';
import type {
  AutoImportConfigFunctions,
  FilesSearcherReturnSuccess,
  ModuleOptionsExtend
} from './types';
// @ts-ignore
import buildMeta from './buildMeta';
import { defineNuxtPlugin, useRuntimeConfig } from '#imports';

type ConnectorDefinesType = FilesSearcherReturnSuccess[];
type ConnectorsType = { [name: string]: ConnectorDefinesType };

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig().public.autoImport as ModuleOptionsExtend;
  const vueApp = nuxtApp.vueApp;
  const connectorsData = {} as ConnectorsType;

  for (const connectorFiles of Object.entries(config.defines)) {
    const defines: ConnectorDefinesType = [];

    for (const file of connectorFiles[1]) {
      const loadedFile = (buildMeta as any)[file.id];
      loadedFile.data = typeof loadedFile.data === 'function' ? loadedFile.data() : loadedFile.data;
      file.config = loadedFile;
      defines.push(file);
    }

    connectorsData[connectorFiles[0]] = defines;
  }

  Object.entries(connectorsData).forEach(([key, defines]) => {
    config.data[key] = defines.length ? defines[1].config.dataBuilder(defines) : {};

    defines.forEach((define) => {
      callStackFunctions('onAppCreating', vueApp, define);
    });
  });
});

function callStackFunctions<T>(
  funcName: keyof Omit<AutoImportConfigFunctions<T>, 'dataBuilder'>,
  appVue: App<Element>,
  define: FilesSearcherReturnSuccess<T>
) {
  const func = define.config[funcName];
  if (func) func(appVue, define);
}
