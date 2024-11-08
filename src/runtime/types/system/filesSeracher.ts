import type { AutoImportDefineConfig } from '../../types';
import type { XOR } from './utils';

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
export type FilesSearcherReturnSuccess<T = any> = FilesSearcherReturnBus & {
  config: AutoImportDefineConfig<T>;
};
export type FilesSearcherReturnError = {
  path: string;
  error: FilesSearcherErrors;
};

export type FilesSearcherConfig = {
  defineType: string;
  dirname: string;
  deep?: boolean;
  withRootIndexPrefix?: boolean;
  pathPrefix?: boolean;
  returnOnlySuccess?: boolean;
};
export type FilesSearcherReturn = XOR<FilesSearcherReturnSuccess, FilesSearcherReturnError>;
