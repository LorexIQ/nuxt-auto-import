import type { Nuxt } from '@nuxt/schema';
import type {
  AutoImportConnector,
  AutoImportConnectorReturn, FilesSearcherReturn,
  FilesSearcherReturnSuccess
} from '../types';
import filesSearcher from '../helpers/filesSearcher';
import typeGenerator from '../helpers/typeGenerator';

export default function<T>(config: AutoImportConnector): AutoImportConnectorReturn {
  const _config: Required<AutoImportConnector> = {
    onAppCreating() {},

    name: '',
    deep: false,
    pathPrefix: true,
    defineConfigTypeName: 'Define',
    withRootIndexPrefix: false,

    ...config
  };

  return {
    config: _config,
    exe: async (nuxtConfig: Nuxt, fileName: string) => {
      const files: FilesSearcherReturn[] = [];

      for (const file of _config.watchedPaths) {
        files.push(...(await filesSearcher(nuxtConfig, {
          defineType: `define${fileName[0].toUpperCase()}${fileName.slice(1)}`,
          dirname: file,
          deep: _config.deep,
          returnOnlySuccess: true,
          pathPrefix: _config.pathPrefix,
          withRootIndexPrefix: _config.withRootIndexPrefix
        })));
      }

      const connectorData = _config.dataBuilder(files as FilesSearcherReturnSuccess<T>[]);

      return {
        type: 'AutoImportConnector',
        data: connectorData,
        files: files.map(file => ({ id: file.id, path: file.path, fileName: file.fileName, name: file.name }) as FilesSearcherReturnSuccess),
        typeGenerator: ctxPath => typeGenerator(
          ctxPath,
          fileName,
          _config.typeContent(connectorData)
        )
      };
    }
  };
}
