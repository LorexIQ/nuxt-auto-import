import type { ModuleOptionsExtend } from '../types';
import { useRuntimeConfig, useNuxtApp } from '#imports';

export default function () {
  const runtimeConfig = useRuntimeConfig().public.autoImport as ModuleOptionsExtend;
  const configKey = runtimeConfig.configStateKey;
  return useNuxtApp()[`$${configKey}`] as ModuleOptionsExtend;
}
