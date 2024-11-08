import type { XOR } from '@B/types';
import type { AutoImportsDefineConfigByType, AutoImportsDefinesType } from './autoImports';

type FilesSearcherErrors =
  | 'dir_is_not_found'
  | 'root_index_is_not_supported'
  | 'name_duplicate'
  | 'define_is_not_found';
export type FilesSearcherReturnBus = {
  id: string;
  path: string;
  fileName: string;
  name: {
    snakeCase: string;
    camelCase: string;
  };
};
type FilesSearcherReturnSuccess<T extends AutoImportsDefinesType> = FilesSearcherReturnBus & {
  config: AutoImportsDefineConfigByType<T>;
};
type FilesSearcherReturnError = {
  path: string;
  error: FilesSearcherErrors;
};

export type FilesSearcherConfig<T extends AutoImportsDefinesType> = {
  defineType: T;
  dirname: string;
  deep?: boolean;
  withRootIndexPrefix?: boolean;
  pathPrefix?: boolean;
  returnOnlySuccess?: boolean;
};
export type FilesSearcherReturn<T extends AutoImportsDefinesType> = XOR<FilesSearcherReturnSuccess<T>, FilesSearcherReturnError>;
