import type { App } from 'vue';
import type {
  AutoImportsConfig,
  AutoImportsConfigDefine,
  AutoImportsConfigFunctions,
  AutoImportsDefinesType,
  FilesSearcherReturnBus
} from './types';
// @ts-ignore
import buildMeta from './buildMeta';
import { defineNuxtPlugin, useRuntimeConfig } from '#imports';

type ConnectorDefineType = [FilesSearcherReturnBus, AutoImportsConfig<any, any>];
type ConnectorDefinesType = ConnectorDefineType[];
type ConnectorsType = { [name in AutoImportsDefinesType]: ConnectorDefinesType };

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig().public.autoImports;
  const vueApp = nuxtApp.vueApp;
  const connectors = {} as ConnectorsType;

  for (const connectorFiles of Object.entries(config.files)) {
    const defines: ConnectorDefinesType = [];

    for (const file of connectorFiles[1] as FilesSearcherReturnBus[]) {
      const loadedFile = (buildMeta as any)[file.id];
      loadedFile.data = typeof loadedFile.data === 'function' ? loadedFile.data() : loadedFile.data;
      defines.push([file, loadedFile]);
    }

    (connectors as any)[connectorFiles[0]] = defines;
  }

  Object.entries(connectors).forEach(([key, defines]) => {
    (config.connectors as any)[key] = defines.length ? defines[0][1].onDataBuilder(defines) : {};

    defines.forEach((define) => {
      callStackFunctions('onAppCreating', vueApp, define);
    });
  });
});

function callStackFunctions<T extends AutoImportsDefinesType>(funcName: keyof Omit<AutoImportsConfigFunctions<T, any>, 'onDataBuilder'>, appVue: App<Element>, define: AutoImportsConfigDefine<T, any>) {
  const func = define[1][funcName];
  if (func) func(appVue, define);
}
