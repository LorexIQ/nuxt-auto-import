import type { DefineDirectiveConfig, DefineDirectiveReturn } from '../types';

export function defineDirective<T extends DefineDirectiveConfig>(config: T): DefineDirectiveReturn<T> {
  return {
    type: 'defineDirective',
    data: config,

    onDataBuilder() {
      return {};
    },
    onAppCreating(app, directive) {
      app.directive(directive[0].name.camelCase, directive[1].data);
    }
  };
}
