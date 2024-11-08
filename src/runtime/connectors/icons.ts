import filesSearcher from '../helpers/filesSearcher';
import typeGenerator from '../helpers/typeGenerator';
import type { ConnectorIconsReturn, FilesSearcherReturnBus } from '../types';

export default function (nitroConfig: any): ConnectorIconsReturn<any> {
  const files = filesSearcher(nitroConfig, {
    defineType: 'defineIcons',
    dirname: 'app/icons.ts',
    returnOnlySuccess: true
  });

  const resultObject = {};

  files.forEach(file => Object.assign(resultObject, file.config?.data));

  const resultObjectKeys = Object.keys(resultObject);

  return {
    data: resultObject,
    files: files.map(file => ({ id: file.id, path: file.path, fileName: file.fileName, name: file.name }) as FilesSearcherReturnBus),
    typeGenerator: ctxPath => typeGenerator(
      ctxPath,
      'icons',
      resultObjectKeys.length ? `\n  | '${resultObjectKeys.join('\'\n  | \'')}'` : ' {}'
    )
  };
}
