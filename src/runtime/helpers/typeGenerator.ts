import path from 'node:path';
import type { WriterFunction } from 'ts-morph';
import getTsMorphProject from './getTsMorphProject';

export default function (typesDir: string, typeName: string, content: string | WriterFunction) {
  if (typeName.length === 0) return;
  if (typeName.length === 1) typeName = typeName.toUpperCase();

  const filePath = path.join(typesDir, `${typeName}.d.ts`);
  const isWriter = typeof content === 'function';
  const project = getTsMorphProject();
  const file = project.createSourceFile(filePath, '', { overwrite: true });

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
