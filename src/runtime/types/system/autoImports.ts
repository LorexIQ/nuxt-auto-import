import type { App } from 'vue';
import type { FilesSearcherReturnBus, FilesSearcherReturnSuccess } from '../system/filesSeracher';

export type AutoImportConfigFunctions = {
  dataBuilder: (defines: FilesSearcherReturnSuccess[]) => any;
  onAppCreating: (app: App<Element>, define: FilesSearcherReturnSuccess) => void;
};
export type AutoImportDefineConfig = AutoImportConfigFunctions & {
  type: string;
  data: any;
};

export type AutoImportDefinesReturn = { [name: string]: FilesSearcherReturnBus[] };

export type AutoImportReturn = {
  defines: AutoImportDefinesReturn;
  generateTypes: () => void;
};
