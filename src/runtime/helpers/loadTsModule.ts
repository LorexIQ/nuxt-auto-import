import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import esbuild from 'esbuild';

export default async function (modulePath: string) {
  const fullPath = path.resolve(modulePath);
  const tempJsFilePath = fullPath.replace(/\.ts$/, `.${Date.now()}.temp.js`);

  try {
    const tsCode = fs.readFileSync(fullPath, 'utf8');
    const { code } = await esbuild.transform(tsCode, { loader: 'ts' });

    fs.writeFileSync(tempJsFilePath, code, 'utf8');
    const module = await import(pathToFileURL(tempJsFilePath).href);
    fs.unlinkSync(tempJsFilePath);

    return module;
  } catch {
    if (fs.existsSync(tempJsFilePath)) fs.unlinkSync(tempJsFilePath);
    return undefined;
  }
}
