import type { TestType } from '@/base/types';

type Define = TestType & {
  [name: string]: string;
};

export default defineConnector<Define>({
  watchedPaths: [
    './assets/icons.ts',
    './icons'
  ],
  dataBuilder(files) {
    const resultObject = {};
    files.forEach(file => Object.assign(resultObject, file.config.data));
    return resultObject;
  },
  typeContent(data) {
    const resultObjectKeys = Object.keys(data);
    return resultObjectKeys.length ? `\n  | '${resultObjectKeys.join('\'\n  | \'')}'` : ' {}';
  },
  onAppCreating(app) {
    console.log('MOUNTED', app);
  }
});
