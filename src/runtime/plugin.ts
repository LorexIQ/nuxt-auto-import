import type { App } from 'vue';
import type {
  ModuleDefineConfigFunctions,
  ModuleFSReturnSuccess,
  ModuleOptionsExtend
} from './types';
// @ts-ignore
import buildMeta from './buildMeta';
import { defineNuxtPlugin, useRuntimeConfig } from '#imports';

type ConnectorDefinesType = ModuleFSReturnSuccess[];
type ConnectorsType = { [name: string]: ConnectorDefinesType };

export default defineNuxtPlugin(async (nuxtApp) => {
  const runtimeConfig = useRuntimeConfig().public.autoImport as ModuleOptionsExtend;
  const config = useState(runtimeConfig.configStateKey, () => runtimeConfig);
  const vueApp = nuxtApp.vueApp;
  const connectorsData = {} as ConnectorsType;

  for (const connectorFiles of Object.entries(config.value.defines)) {
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
    config.value.data[key] = defines.length ? defines[0].config.dataBuilder(defines) : {};

    defines.forEach((define) => {
      callStackFunctions('onAppCreating', vueApp, define);
    });
  });
});

function callStackFunctions<T>(
  funcName: keyof Omit<ModuleDefineConfigFunctions<T>, 'dataBuilder'>,
  appVue: App<Element>,
  define: ModuleFSReturnSuccess<T>
) {
  const func = define.config[funcName];
  if (func) func(appVue, define);
}
