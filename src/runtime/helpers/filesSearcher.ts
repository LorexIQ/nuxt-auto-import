import { join } from 'node:path';
import fs from 'node:fs';
import { glob } from 'glob';
import type {
  AutoImportDefineConfig,
  FilesSearcherConfig,
  FilesSearcherReturn
} from '../types';

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
    .join('_')
    .split('_')
    .filter(Boolean)
    .map(part => part.toLowerCase());
}

function toFirstUpper(text: string): string {
  if (!text.length) return text;
  else if (text.length === 1) return text.toUpperCase();
  else return `${text[0].toUpperCase()}${text.slice(1)}`;
}

function pathToFilesSearcherReturn(config: Required<FilesSearcherConfig>, rootPath: string, filePath: string, cache: string[]): FilesSearcherReturn {
  const rootDirName = textToSplitParts(rootPath.split('\\').at(-1)!);
  const fileName = filePath.slice(rootPath.length + 1);
  const prefix = fileName.split('\\').slice(0, -1).map(part => textToSplitParts(part));
  const name = textToSplitParts(fileName.split('\\').at(-1)!.slice(0, -3));
  const fileLoaded = require(filePath).default as AutoImportDefineConfig;

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

export default function (nitroConfig: any, config: FilesSearcherConfig): FilesSearcherReturn[] {
  const _config: Required<FilesSearcherConfig> = {
    deep: true,
    withRootIndexPrefix: false,
    pathPrefix: true,
    returnOnlySuccess: false,

    ...config
  };

  const nuxtExtends = (nitroConfig.appConfigFiles.map((path: string) => path!.replace('/app.config', '')) ?? []) as string[];
  const watchedPaths = nuxtExtends.reduce<string[]>((accum, path) => {
    const pattern = join(path, _config.dirname).replace(/\\/g, '/');
    const paths = glob.globSync(pattern);
    return [...accum, ...paths];
  }, []);

  return watchedPaths
    .map<FilesSearcherReturn[]>((path) => {
      if (!fs.existsSync(path)) return [{ path, error: 'dir_is_not_found' }];

      const namesCache: string[] = [];

      if (checkIsFile(path)) {
        const fileDir = path.split('\\').slice(0, -1)!.join('\\');
        return [pathToFilesSearcherReturn(_config, fileDir, path, namesCache)];
      } else {
        return dirsReader(path, _config.deep).map(filePath => pathToFilesSearcherReturn(_config, path, filePath, namesCache));
      }
    })
    .flat()
    .filter(searcherReturn => _config.returnOnlySuccess ? !searcherReturn.error : true);
}
