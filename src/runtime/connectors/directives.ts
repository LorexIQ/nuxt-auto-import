import path from 'node:path';
import filesSearcher from '../helpers/filesSearcher';
import typeGenerator from '../helpers/typeGenerator';
import type {
  ConnectorDirectivesReturn,
  DefineDirectiveConfig,
  DefineDirectiveObjectDirectives,
  FilesSearcherReturnBus
} from '../types';

export default function<T extends DefineDirectiveConfig>(nitroConfig: any): ConnectorDirectivesReturn<T> {
  const files = [
    ...filesSearcher(nitroConfig, {
      defineType: 'defineDirective',
      dirname: 'directives',
      returnOnlySuccess: true,
      deep: false
    }),
    ...filesSearcher(nitroConfig, {
      defineType: 'defineDirective',
      dirname: path.join('moduleComponents', '*', 'directives'),
      returnOnlySuccess: true,
      deep: false
    })
  ];

  const resultObject: DefineDirectiveObjectDirectives<T> = {};

  files.forEach((file) => {
    resultObject[file.name!.camelCase] = file.config!.data;
  });

  const resultObjectKeys = Object.keys(resultObject);

  return {
    data: resultObject,
    files: files.map(file => ({ id: file.id, path: file.path, fileName: file.fileName, name: file.name }) as FilesSearcherReturnBus),
    typeGenerator: ctxPath => typeGenerator(
      ctxPath,
      'directives',
      resultObjectKeys.length ? `\n  | '${resultObjectKeys.join('\'\n  | \'')}'` : ' {}'
    )
  };
}
