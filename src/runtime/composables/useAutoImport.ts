import type { ModuleOptionsExtend } from '../types';

export default function () {
  const runtimeConfig = useRuntimeConfig().public.autoImport as ModuleOptionsExtend;
  const configKey = runtimeConfig.configStateKey;
  return useState(configKey).value as ModuleOptionsExtend;
}
