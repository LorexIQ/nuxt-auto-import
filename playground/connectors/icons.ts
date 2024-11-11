type Define = {
  [name: string]: string;
};

export default defineConnector<Define>({
  watchedPaths: [
    './assets/icons.ts',
    './assets/icons2.ts'
  ],
  dataBuilder(files): any {
    const resultObject = {};
    files.forEach(file => Object.assign(resultObject, file.config.data));
    return resultObject;
  },
  typeContent(data): string {
    const resultObjectKeys = Object.keys(data);
    return resultObjectKeys.length ? `\n  | '${resultObjectKeys.join('\'\n  | \'')}'` : ' {}';
  },
  onAppCreating(app) {
    console.log('MOUNTED', app);
  }
});
