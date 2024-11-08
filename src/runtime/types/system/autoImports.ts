import type { App } from 'vue';
import type { FilesSearcherReturnBus, FilesSearcherReturnSuccess } from './filesSeracher';

export type AutoImportConfigFunctions<T = any> = {
  dataBuilder: (defines: FilesSearcherReturnSuccess<T>[]) => any;
  onAppCreating: (app: App<Element>, define: FilesSearcherReturnSuccess<T>) => void;
};
export type AutoImportDefineConfig<T = any> = AutoImportConfigFunctions & {
  type: string;
  data: T;
};

export type AutoImportDefinesReturn = { [name: string]: FilesSearcherReturnBus[] };

export type AutoImportReturn = {
  defines: AutoImportDefinesReturn;
  generateTypes: () => void;
};
