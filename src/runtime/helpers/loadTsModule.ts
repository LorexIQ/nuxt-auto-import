import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import esbuild from 'esbuild';

export default async function (modulePath: string) {
  const fullPath = path.resolve(modulePath);
  const tsCode = fs.readFileSync(fullPath, 'utf8');

  try {
    const { code } = await esbuild.transform(tsCode, { loader: 'ts' });

    const tempJsFilePath = fullPath.replace(/\.ts$/, `.${Date.now()}.temp.js`);
    fs.writeFileSync(tempJsFilePath, code, 'utf8');

    const module = await import(pathToFileURL(tempJsFilePath).href);

    fs.unlinkSync(tempJsFilePath);

    return module;
  } catch {
    return undefined;
  }
}
