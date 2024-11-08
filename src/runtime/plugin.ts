import type { App } from 'vue';
import type {
  AutoImportConfig,
  AutoImportConfigDefine,
  AutoImportConfigFunctions,
  AutoImportDefinesType,
  FilesSearcherReturnBus, ModuleOptionsExtend
} from './types';
// @ts-ignore
import buildMeta from './buildMeta';
import { defineNuxtPlugin, useRuntimeConfig } from '#imports';

type ConnectorDefineType = [FilesSearcherReturnBus, AutoImportConfig<any, any>];
type ConnectorDefinesType = ConnectorDefineType[];
type ConnectorsType = { [name: string]: ConnectorDefinesType };

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig().public.autoImports as ModuleOptionsExtend;
  const vueApp = nuxtApp.vueApp;
  const connectorsData = {} as ConnectorsType;

  for (const connectorFiles of Object.entries(config.defines)) {
    const defines: ConnectorDefinesType = [];

    for (const file of connectorFiles[1] as FilesSearcherReturnBus[]) {
      const loadedFile = (buildMeta as any)[file.id];
      loadedFile.data = typeof loadedFile.data === 'function' ? loadedFile.data() : loadedFile.data;
      defines.push([file, loadedFile]);
    }

    connectorsData[connectorFiles[0]] = defines;
  }

  Object.entries(connectorsData).forEach(([key, defines]) => {
    config.data[key] = defines.length ? defines[0][1].onDataBuilder(defines) : {};

    defines.forEach((define) => {
      callStackFunctions('onAppCreating', vueApp, define);
    });
  });
});

function callStackFunctions<T extends AutoImportDefinesType>(
  funcName: keyof Omit<AutoImportConfigFunctions<T, any>, 'onDataBuilder'>,
  appVue: App<Element>,
  define: AutoImportConfigDefine<T, any>
) {
  const func = define[1][funcName];
  if (func) func(appVue, define);
}
