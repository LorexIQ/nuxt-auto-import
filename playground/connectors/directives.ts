import type { Directive } from 'vue';

type Define = Directive<HTMLElement>;

export default defineConnector<Define>({
  watchedPaths: [
    './directives'
  ],
  dataBuilder(files): any {
    const resultObject: { [name: string]: any } = {};
    files.forEach((file) => {
      resultObject[file.name!.camelCase] = file.config!.data;
    });
    return resultObject;
  },
  typeContent(data): string {
    const resultObjectKeys = Object.keys(data);
    return resultObjectKeys.length ? `\n  | '${resultObjectKeys.join('\'\n  | \'')}'` : ' {}';
  },
  onAppCreating(app, define) {
    console.log('MOUNTED Directive', define);
  }
});
