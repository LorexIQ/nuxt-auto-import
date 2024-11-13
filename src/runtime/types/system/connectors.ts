import type { App } from 'vue';
import type { Nuxt } from '@nuxt/schema';
import type { WriterFunction } from 'ts-morph';
import type { ModuleFSReturnSuccess } from '../../types';

export type ModuleConnector = {
  watchedPaths: string[];
  dataBuilder: (files: ModuleFSReturnSuccess[]) => any;
  typeContent: (data: any) => string | WriterFunction;

  onAppCreating?: (vueApp: App<Element>, define: ModuleFSReturnSuccess) => void;

  name?: string;
  deep?: boolean;
  pathPrefix?: boolean;
  defineConfigTypeName?: string;
  withRootIndexPrefix?: boolean;
};
export type ModuleConnectorFuncReturn = {
  type: 'ModuleConnector';
  data: any;
  files: ModuleFSReturnSuccess[];
  typeGenerator: ModuleConnectorTypeGenerator;
};
export type ModuleConnectorReturn = {
  config: Required<ModuleConnector>;
  exe: (nuxtConfig: Nuxt, fileName: string) => Promise<ModuleConnectorFuncReturn>;
};

export type ModuleConnectorTypeGenerator = (ctxPath: string, tryRead?: boolean) => string | undefined;
export type ModuleConnectorsReturn = { [name: string]: ModuleConnectorReturn };
