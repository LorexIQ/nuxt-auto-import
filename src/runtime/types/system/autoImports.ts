import type { App } from 'vue';
import type { FilesSearcherReturnBus } from '../system/filesSeracher';
import type { DefineDirectiveReturn, DefineIconsReturn } from '../connectors';

export type AutoImportsConfigDefine<T extends AutoImportsDefinesType, Data> = [FilesSearcherReturnBus, AutoImportsConfig<T, Data>];
export type AutoImportsConfigFunctions<T extends AutoImportsDefinesType, Data> = {
  onDataBuilder: (defines: AutoImportsConfigDefine<T, Data>[]) => any;
  onAppCreating?: (app: App<Element>, define: AutoImportsConfigDefine<T, Data>) => void;
};
export type AutoImportsConfig<T extends AutoImportsDefinesType, Data> = AutoImportsConfigFunctions<T, Data> & {
  type: T;
  data: Data;
};

export type AutoImportsDefinesTypeMapping = {
  defineIcons: DefineIconsReturn<any>;
  defineDirective: DefineDirectiveReturn<any>;
};
export type AutoImportsDefinesType = keyof AutoImportsDefinesTypeMapping;
export type AutoImportsDefineConfigByType<T extends AutoImportsDefinesType> = AutoImportsDefinesTypeMapping[T];

export type AutoImportsReturn = {
  files: { [name: string]: FilesSearcherReturnBus[] };
  generateTypes: () => void;
};

export type ConnectorSystemReturn<T> = {
  data: T;
  files: FilesSearcherReturnBus[];
  typeGenerator: (ctxPath: string) => void;
};
