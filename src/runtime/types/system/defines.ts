import type { App } from 'vue';
import type { ModuleFSReturnSuccess } from './filesSeracher';

export type ModuleDefineConfigFunctions<T = any> = {
  dataBuilder: (defines: ModuleFSReturnSuccess<T>[]) => any;
  onAppCreating: (app: App<Element>, define: ModuleFSReturnSuccess<T>) => void;
};
export type ModuleDefineConfig<T = any> = ModuleDefineConfigFunctions & {
  type: string;
  data: T;
};

export type ModuleDefinesReturn = { [name: string]: ModuleFSReturnSuccess[] };
