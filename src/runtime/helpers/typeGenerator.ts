import path from 'node:path';
import fs from 'node:fs';
import type { WriterFunction } from 'ts-morph';
import tsMorphProject from './tsMorphProject';

export default function (typesDir: string, typeName: string, content: string | WriterFunction, tryRead = false) {
  if (typeName.length === 0) return;
  if (typeName.length === 1) typeName = typeName.toUpperCase();

  const filePath = path.join(typesDir, `${typeName}.d.ts`);
  const isWriter = typeof content === 'function';

  if (tryRead && fs.existsSync(filePath)) return filePath;

  const file = tsMorphProject.createSourceFile(filePath, '', { overwrite: true });

  file.addStatements((writer) => {
    writer.write('declare global').block(() => {
      writer.write(`type AutoImport${typeName[0].toUpperCase()}${typeName.slice(1)} =${isWriter ? ' ' : content[0] === '\n' ? '' : ' '}`);
      isWriter ? content(writer) : writer.write(content);
      writer.write(';');
    });
  });
  file.addExportDeclaration({});
  file.saveSync();

  return filePath;
}
