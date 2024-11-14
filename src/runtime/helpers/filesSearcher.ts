import { join, sep } from 'node:path';
import fs from 'node:fs';
import { glob } from 'glob';
import type {
  ModuleDefineConfig,
  ModuleFSConfig,
  ModuleFSReturn
} from '../types';
import type { ModuleClass } from '../autoImport';
import loadTsModule from './loadTsModule';
import logger from './logger';

function checkIsFile(path: string) {
  return path.endsWith('.ts') && !path.endsWith('.d.ts');
}

function dirsReader(path: string, deep = false): string[] {
  const paths: string[] = [];

  paths.push(
    ...fs
      .readdirSync(path)
      .map(fileName => join(path, fileName))
      .filter((filePath) => {
        if (checkIsFile(filePath)) {
          return true;
        } else if (fs.lstatSync(filePath).isDirectory()) {
          if (deep) paths.push(...dirsReader(filePath, deep));
          return true;
        }

        return false;
      })
  );

  return paths.filter(path => checkIsFile(path));
}

function textToSplitParts(text: string) {
  return text
    .split(/(?=[A-Z])/)
    .filter(Boolean)
    .map(part => part.toLowerCase());
}

function toFirstUpper(text: string): string {
  if (!text.length) return text;
  else if (text.length === 1) return text.toUpperCase();
  else return `${text[0].toUpperCase()}${text.slice(1)}`;
}

async function pathToModuleFSReturn(config: Required<ModuleFSConfig>, rootPath: string, filePath: string, cache: string[]): Promise<ModuleFSReturn> {
  const rootDirName = textToSplitParts(rootPath.split(sep).at(-1)!);
  const fileName = filePath.slice(rootPath.length + 1);
  const prefix = fileName.split(sep).slice(0, -1).map(part => textToSplitParts(part));
  const name = textToSplitParts(fileName.split(sep).at(-1)!.slice(0, -3));
  const fileLoaded = (await loadTsModule(filePath))?.default as ModuleDefineConfig;

  if (!fileLoaded) return { path: filePath, error: 'file_is_not_found' };
  if (fileLoaded?.type !== config.defineType) return { path: filePath, error: 'define_is_not_found' };
  if (name.length === 1 && name[0] === 'index') {
    if (prefix.length) {
      name.splice(0);
    } else if (config.withRootIndexPrefix) {
      name.splice(0);
      Object.assign(name, rootDirName);
    } else {
      return { path: filePath, error: 'root_index_is_not_supported' };
    }
  }

  const snakeCaseName = (config.pathPrefix ? [...prefix, ...name].flat() : name).join('_');
  const camelCaseName = (config.pathPrefix ? [...prefix, ...name].flat() : name).map((part, i) => i ? toFirstUpper(part) : part).join('');

  if (cache.includes(snakeCaseName)) return { path: filePath, error: 'name_duplicate' };
  else cache.push(snakeCaseName);

  return {
    id: `AI${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    name: {
      snakeCase: snakeCaseName,
      camelCase: camelCaseName
    },
    config: fileLoaded,
    fileName,
    path: filePath
  };
}

export default async function (ctx: ModuleClass, config: ModuleFSConfig): Promise<ModuleFSReturn[]> {
  const _config: Required<ModuleFSConfig> = {
    deep: true,
    withRootIndexPrefix: false,
    pathPrefix: true,
    returnOnlySuccess: false,

    ...config
  };

  const nuxtExtends = ctx.getNuxtConfig().options._layers.map(config => config.cwd) ?? [];
  const watchedPaths = nuxtExtends.reduce<string[]>((accum, path) => {
    const pattern = join(path, _config.dirname).replace(/\\/g, '/');
    const paths = glob.globSync(pattern);
    return [...accum, ...paths];
  }, []);
  const files: ModuleFSReturn[] = [];

  for (const path of watchedPaths) {
    if (!fs.existsSync(path)) return [{ path, error: 'dir_is_not_found' }];

    const namesCache: string[] = [];

    if (fs.statSync(path).isFile()) {
      const fileDir = path.split(sep).slice(0, -1)!.join(sep);
      const loadedFile = await pathToModuleFSReturn(_config, fileDir, path, namesCache);
      if (ctx.isDebug() && loadedFile.error) logger.warn(`Error loading define file: '${loadedFile.path}'.`);
      files.push(loadedFile);
    } else {
      for (const childPath of dirsReader(path, _config.deep)) {
        const loadedFile = await pathToModuleFSReturn(_config, path, childPath, namesCache);
        if (ctx.isDebug() && loadedFile.error) logger.warn(`Error loading define file: '${loadedFile.path}'.`);
        files.push(loadedFile);
      }
    }
  }

  return files.filter(searcherReturn => _config.returnOnlySuccess ? !searcherReturn.error : true);
}
