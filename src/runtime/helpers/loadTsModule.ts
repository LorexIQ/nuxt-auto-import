import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import esbuild from 'esbuild';
import { resolveAlias } from '@nuxt/kit';
import type { SourceFile } from 'ts-morph';
import tsMorphProject from './tsMorphProject';

function clearTemp(tempPath: string, file?: SourceFile) {
  if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  file && tsMorphProject.removeSourceFile(file);
}

function getImportPath(ctxPath: string, p: string) {
  const asAliasResolve = resolveAlias(p);
  const asPathResolve = path.resolve(ctxPath, p);
  const isAliasPath = asAliasResolve !== p;
  const isRelativePath = p.startsWith('.') || p.startsWith('/');
  const importPath = isRelativePath ? asPathResolve : asAliasResolve;

  if (isAliasPath || isRelativePath) {
    if (fs.existsSync(importPath + '.ts')) return importPath + '.ts';
    else if (fs.existsSync(importPath + '\\index.ts')) return importPath + '\\index.ts';
    else return undefined;
  } else {
    return undefined;
  }
}

export default async function loadTsModule(modulePath: string) {
  const fullPath = path.resolve(modulePath);
  const parsedPath = path.parse(fullPath);
  const tempTsFilePath = fullPath.replace(/\.ts$/, `.${Date.now()}.temp.ts`);
  const tempJsFilePath = fullPath.replace(/\.ts$/, `.${Date.now()}.temp.js`);
  let sourceFile: SourceFile | undefined = undefined;

  try {
    const tsCode = fs.readFileSync(fullPath, 'utf8');
    sourceFile = tsMorphProject.createSourceFile(tempTsFilePath, tsCode, { overwrite: true });

    await Promise.all(sourceFile.getImportDeclarations().map(async (imp) => {
      const importPath = getImportPath(parsedPath.dir, imp.getStructure().moduleSpecifier);
      if (importPath) imp.remove();
    }));
    const { code } = await esbuild.transform(sourceFile.getFullText(), { loader: 'ts' });

    fs.writeFileSync(tempJsFilePath, code, 'utf8');
    const module = await import(pathToFileURL(tempJsFilePath).href);
    clearTemp(tempJsFilePath, sourceFile);

    return module;
  } catch {
    clearTemp(tempJsFilePath, sourceFile);
    return undefined;
  }
}
