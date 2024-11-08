import type { App } from 'vue';
import type {
  FilesSearcherReturnBus,
  FilesSearcherReturnSuccess
} from '../../types';

export type AutoImportConnector<> = {
  watchedPaths: string[];
  dataBuilder: (files: FilesSearcherReturnSuccess[]) => any;
  typeContent: (data: any) => string;

  onAppCreating?: (vueApp: App<Element>, define: FilesSearcherReturnSuccess) => void;

  name?: string;
  deep?: boolean;
  pathPrefix?: boolean;
  defineConfigTypeName?: string;
  withRootIndexPrefix?: boolean;
};

export type AutoImportConnectorTypeGenerator = (ctxPath: string) => void;

export type AutoImportConnectorFuncReturn = {
  type: 'AutoImportConnector';
  data: any;
  files: FilesSearcherReturnBus[];
  typeGenerator: AutoImportConnectorTypeGenerator;
};
export type AutoImportConnectorReturn = {
  config: Required<AutoImportConnector>;
  exe: (nitroConfig: any, fileName: string) => AutoImportConnectorFuncReturn;
};
