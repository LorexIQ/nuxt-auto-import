import * as fs from 'node:fs';
import { join } from 'node:path';
import type { AutoImportsReturn, ConnectorSystemReturn } from './types/system';

const connectorDirPath = join(__dirname, 'connectors');
const importedNames: string[] = [];
const allTypeGenerations: ((ctxPath: string) => void)[] = [];

export function autoImportConnectors(nitroConfig: any): AutoImportsReturn {
  return {
    files: fs.readdirSync(connectorDirPath)
      .filter(connector => connector.endsWith('.ts'))
      .reduce((accum, connector) => {
        const path = join(connectorDirPath, connector);
        const connectorName = connector.split('.').slice(0, -1).join('.');
        const connectorFile = require(path)?.default as (nitroConfig: any) => ConnectorSystemReturn<any>;

        if (!connectorFile || typeof connectorFile !== 'function' || importedNames.includes(connectorName)) return accum;

        const executedFunction = connectorFile(nitroConfig);

        importedNames.push(connectorName);
        allTypeGenerations.push(executedFunction.typeGenerator);

        return {
          [connectorName]: executedFunction.files,
          ...accum
        };
      }, {} as AutoImportsReturn['files']),
    generateTypes: generateTypes.bind(undefined, nitroConfig.rootDir)
  };
}

function generateTypes(rootDir: string): void {
  const typesDir = join(rootDir, 'types');
  const autoImportsTypesDir = join(typesDir, 'autoImports');

  if (!fs.existsSync(autoImportsTypesDir)) {
    if (!fs.existsSync(typesDir)) fs.mkdirSync(typesDir);
    fs.mkdirSync(autoImportsTypesDir);
  }

  allTypeGenerations.forEach(file => file(autoImportsTypesDir));

  const filesTypes = fs
    .readdirSync(autoImportsTypesDir)
    .filter(file => file !== 'index.ts' && !fs.lstatSync(join(autoImportsTypesDir, file)).isDirectory())
    .map(file => file.slice(0, -3));
  fs.writeFileSync(join(autoImportsTypesDir, 'index.ts'), `${filesTypes.map(file => `export * from './${file}';`).join('\n')}\n`);
}
