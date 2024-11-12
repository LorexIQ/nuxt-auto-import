import type { ModuleDefinesReturn } from './system';

export * from './system';

export type ModuleOptions = {
  connectors: string[];
};

export type ModuleOptionsExtend = ModuleOptions & {
  rootDir: string;
  defines: ModuleDefinesReturn;
  data: { [name: string]: any };
};
