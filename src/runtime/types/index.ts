import type { AutoImportDefinesReturn } from './system';

export * from './system';

export type ModuleOptions = {
  connectors: string[];
};

export type ModuleOptionsExtend = ModuleOptions & {
  rootDir: string;
  defines: AutoImportDefinesReturn;
  data: { [name: string]: any };
};
