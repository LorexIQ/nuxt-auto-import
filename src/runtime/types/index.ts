import type { ModuleDefinesReturn } from './system';

export * from './system';

export type ModuleOptions = {
  configStateKey?: string;
  connectors: string[];
};

export type ModuleOptionsExtend = Required<ModuleOptions> & {
  rootDir: string;
  defines: ModuleDefinesReturn;
  data: { [name: string]: any };
};
