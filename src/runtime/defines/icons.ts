import type { DefineIconsConfig, DefineIconsReturn } from '../types';

export function defineIcons<T extends DefineIconsConfig>(icons: T): DefineIconsReturn<T> {
  return {
    type: 'defineIcons',
    data: icons,

    onDataBuilder(defines) {
      const resultObject = {};
      defines.forEach(([_, define]) => Object.assign(resultObject, define.data));
      return resultObject;
    }
  };
}
