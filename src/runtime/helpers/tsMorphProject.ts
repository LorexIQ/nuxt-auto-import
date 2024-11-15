import { IndentationText, Project } from 'ts-morph';

const tsMorphProject = new Project({
  tsConfigFilePath: './tsconfig.json',
  manipulationSettings: {
    indentationText: IndentationText.TwoSpaces
  }
});

export default tsMorphProject;
