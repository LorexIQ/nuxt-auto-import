import type { Directive } from 'vue';
import type { AutoImportsConfig, ConnectorSystemReturn } from '../system/index';

export type DefineDirectiveConfig = Directive<HTMLElement> | (() => Directive<HTMLElement>);

export type DefineDirectiveReturn<T extends DefineDirectiveConfig> = AutoImportsConfig<'defineDirective', T>;

export type DefineDirectiveObjectDirectives<T extends DefineDirectiveConfig> = {
  [name: string]: T;
};

export type ConnectorDirectivesReturn<T extends DefineDirectiveConfig> = ConnectorSystemReturn<DefineDirectiveObjectDirectives<T>>;
