import path from 'node:path';

export default function (fromPath: string, fromLocation: string, toLocation: string): string {
  const absoluteImportPath = path.resolve(fromLocation, fromPath);
  const newRelativePath = path.relative(path.dirname(toLocation), absoluteImportPath);
  return newRelativePath.replace(/\\/g, '/');
}
