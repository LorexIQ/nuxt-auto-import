import type { AutoImportsConfig, ConnectorSystemReturn } from '../system/index';

export type DefineIconsConfig = {
  [name: string]: string;
};

export type DefineIconsReturn<T extends DefineIconsConfig> = AutoImportsConfig<'defineIcons', T>;

export type ConnectorIconsReturn<T extends DefineIconsConfig> = ConnectorSystemReturn<T>;
