import type {
  AutoImportConnector,
  AutoImportConnectorReturn,
  FilesSearcherReturnBus, FilesSearcherReturnSuccess
} from '../types';
import filesSearcher from '../helpers/filesSearcher';
import typeGenerator from '../helpers/typeGenerator';

export default function (config: AutoImportConnector): AutoImportConnectorReturn {
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
    exe: (nitroConfig: any, fileName: string) => {
      const files = _config.watchedPaths.map(dirname => filesSearcher(nitroConfig, {
        defineType: `define${fileName[0].toUpperCase()}${fileName.slice(1)}`,
        dirname: dirname,
        deep: _config.deep,
        returnOnlySuccess: true,
        pathPrefix: _config.pathPrefix,
        withRootIndexPrefix: _config.withRootIndexPrefix
      })).flat();

      const connectorData = _config.dataBuilder(files as FilesSearcherReturnSuccess[]);

      return {
        type: 'AutoImportConnector',
        data: connectorData,
        files: files.map(file => ({ id: file.id, path: file.path, fileName: file.fileName, name: file.name }) as FilesSearcherReturnBus),
        typeGenerator: ctxPath => typeGenerator(
          ctxPath,
          fileName,
          _config.typeContent(connectorData)
        )
      };
    }
  };
}
