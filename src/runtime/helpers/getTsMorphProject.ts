import { IndentationText, Project } from 'ts-morph';

export default function () {
  return new Project({
    tsConfigFilePath: './tsconfig.json',
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces
    }
  });
}
