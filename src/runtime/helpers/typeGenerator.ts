import * as fs from 'node:fs';
import path from 'node:path';

export default function (ctxPath: string, typeName: string, content: string) {
  if (typeName.length === 0) return;
  if (typeName.length === 1) typeName = typeName.toUpperCase();

  fs.writeFileSync(path.join(ctxPath, `${typeName}.ts`), `export type AutoImports${typeName[0].toUpperCase()}${typeName.slice(1)} =${content};\n`);
}
