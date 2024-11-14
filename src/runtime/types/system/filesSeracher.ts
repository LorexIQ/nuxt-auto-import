import type { ModuleDefineConfig } from '../../types';
import type { XOR } from './utils';

type ModuleFSErrors =
  | 'file_is_not_found'
  | 'dir_is_not_found'
  | 'root_index_is_not_supported'
  | 'name_duplicate'
  | 'define_is_not_found';

export type ModuleFSConfig = {
  defineType: string;
  dirname: string;
  deep?: boolean;
  withRootIndexPrefix?: boolean;
  pathPrefix?: boolean;
  returnOnlySuccess?: boolean;
};
export type ModuleFSMetaReturn = {
  id: string;
  path: string;
  fileName: string;
  name: {
    snakeCase: string;
    camelCase: string;
  };
};

export type ModuleFSReturnSuccess<T = any> = ModuleFSMetaReturn & {
  config: ModuleDefineConfig<T>;
};
export type ModuleFSReturnError = {
  path: string;
  error: ModuleFSErrors;
};

export type ModuleFSReturn = XOR<ModuleFSReturnSuccess, ModuleFSReturnError>;
