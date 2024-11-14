[![nuxt-auto-import](./docs/poster.png)](./docs/poster.png)

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

# Nuxt Auto Import

A module for automatically connecting prepared files found in the project and processing their data.
Everything happens thanks to the connector files specified in the configuration.

> This module works with Nuxt 3 only

## Features

- Connect entire folders with files with flexible name settings
- Using native functions to create connector types
- Full integration with dev mode with define reactive files
- Global connector type files
- The ability to configure the function that is performed when mounting the application

## Usage

Install the module:

```sh
npm install nuxt-auto-import
```

## Configuration

```ts
export default defineNuxtConfig({
  modules: ["nuxt-auto-import"],
  autoImport: {
    // options
  }
})
```

### Options

| Name           | Type     | Required | Default                   | Description                                                     |
|----------------|----------|:--------:|---------------------------|-----------------------------------------------------------------|
| configStateKey | string   |  false   | 'autoImportModule:config' | [In case of conflict]: assigns a key for storing connector data |
| connectors     | string[] |   true   |                           | The path to the connector relative to any nuxt.config           |

### Creating connector

1. Create a .ts file anywhere in the application [it is recommended to create a connectors folder].
2. Use `export default defineConnector(config)`.
3. Specify the path for the connector in nuxt.config.
```ts
export default defineNuxtConfig({
  modules: ["nuxt-auto-import"],
  autoImport: {
    connectors: [
      './connectors/directives.ts'
    ]
  }
})
```

#### Connector configuration

You can use any imports and types in the connector file, they will be transferred to any define that concerns this connector.

```ts
type ModuleConnector = {
  /* The viewed paths from which define will be loaded
  *  It supports both reading individual files and folders with multiple nesting
  * */
  watchedPaths: string[];
  
  /* A function for generating generalized data */
  dataBuilder: (files: ModuleFSReturnSuccess[]) => any;
  
  /* A function for generating a generalized type */
  typeContent: (data: any) => string | WriterFunction;
  
  /* The trigger function that will be executed at the time of mounting the application
  *  Default: () => {}
  *  */
  onAppCreating?: (vueApp: App<Element>, define: ModuleFSReturnSuccess) => void;
  
  /* A function for generating a generalized type
  *  Default: {{file name}}
  * */
  name?: string;
  
  /* Enables reading of subfolders
  *  Default: false
  * */
  deep?: boolean;
  
  /* Adds the prefix of the folder name to the file name, with the deep option
  *  Default: true
  * */
  pathPrefix?: boolean;
  
  /* Specifies the name of the type that contains the controller for typing defines
  *  Default: 'Define'
  * */
  defineConfigTypeName?: string;
  
  /* Specifies whether to read index files in the directories being viewed by assigning them a folder name
  *  Default: false
  * */
  withRootIndexPrefix?: boolean;
};
```

##### Example

```ts
// connectors/directives.ts
import type { Directive } from 'vue';

type Define = Directive<HTMLElement>;

export default defineConnector<Define>({
  watchedPaths: [
    './directives'
  ],
  dataBuilder(files): any {
    /* All directives will be written to the object by their name
    *  and will be used in the client
    * */
    const resultObject: { [name: string]: any } = {};
    files.forEach((file) => {
      resultObject[file.name!.camelCase] = file.config!.data;
    });
    return resultObject;
  },
  typeContent(data): string {
    /* All the names of the directives will be written to the type */
    const resultObjectKeys = Object.keys(data);
    return resultObjectKeys.length ? `\n  | '${resultObjectKeys.join('\'\n  | \'')}'` : ' {}';
  },
  onAppCreating(app, define) {
    /* When mounting the application, the directives will be registered */
    app.directive(define.name.camelCase, define.config.data);
  },
  
  name: 'directives',
  deep: false,
  pathPrefix: false,
  defineConfigTypeName: 'Define',
  withRootIndexPrefix: false
});
```

Created by the composable define connector:

P.s. Just an illustrative example of the final work of the connector, you do not need to create or edit this file.

```ts
import type { ModuleDefineConfig } from "../types";
import type { Directive } from "vue";

type Define = Directive<HTMLElement>;

export function defineDirectives(config: Define): ModuleDefineConfig {
  return {
    type: 'defineDirectives',
    data: config,
    dataBuilder(files) {
      const resultObject = {};
      files.forEach((file) => {
        resultObject[file.name.camelCase] = file.config.data;
      });
      return resultObject;
    },
    onAppCreating(app, define) {
      app.directive(define.name.camelCase, define.config.data);
    }
  };
}
```

Usage:

Define the function will be created in the format `define{{connector.name }}`.

```ts
// directives/outside.ts
export default defineDirectives({
  mounted(el, binding) {
    const mods = binding.modifiers;

    const handler = (e: any) => {
      if (!el.contains(e.target) && el !== e.target) {
        binding.value(e);
      }
    };
    (el as any).__ClickOutsideHandler__ = handler;

    setTimeout(() => document.addEventListener('click', handler), mods.delay ? 50 : 0);
  },
  beforeUnmount(el) {
    document.removeEventListener('click', (el as any).__ClickOutsideHandler__);
  },
  getSSRProps() {
    return {};
  }
});
```

`defineDirectives` has become a global function, which makes it easier to use, and the function also has a type set in `Define`, to facilitate configuration.

After launching the application, it became available to use `v-outside` more without any manipulation.

After initializing the connectors (`npm run dev` or `nuxi prepare`), global `AutoImport{{connector.name}}` format types will become available.

## Development

- Run `npm run dev:prepare` to generate type stubs.
- Use `npm run dev` to start playground in development mode.

## License

[MIT License](./LICENSE)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nuxt-auto-import/latest.svg
[npm-version-href]: https://npmjs.com/package/nuxt-auto-import
[npm-downloads-src]: https://img.shields.io/npm/dt/nuxt-auto-import.svg
[npm-downloads-href]: https://npmjs.com/package/nuxt-auto-import
[license-src]: https://img.shields.io/npm/l/nuxt-auto-import.svg
[license-href]: https://npmjs.com/package/nuxt-auto-import
[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
