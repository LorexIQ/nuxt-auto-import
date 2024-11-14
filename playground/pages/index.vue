<script setup lang="ts">
const autoImport = useAutoImport();
const icons = autoImport.defines.icons;

// example use AutoImport type
const item = {} as AutoImportIcons;
console.log(item);

const clicksInside = ref(0);
const clicksOutside = ref(0);
</script>

<template>
  <div class="exp">
    <div class="exp__block">
      <h2 class="exp__block__title">
        Connector: icons
      </h2>
      <div class="exp__block__content">
        <div
          v-for="define of icons"
          :key="define.id"
          class="exp__block__content__file"
        >
          <div class="exp__block__content__file__name">
            {{ define.fileName }}
          </div>
          <div class="exp__block__content__file__content">
            <div
              v-for="(icon, key) of define.config.data"
              :key="key"
            >
              {{ key }}: {{ icon }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="exp__block">
      <h2 class="exp__block__title">
        Connector: directives
      </h2>
      <div class="exp__block__content">
        <div class="exp__block__content__file">
          <div class="exp__block__content__file__name">
            outside.ts
          </div>
          <div class="exp__block__content__file__content">
            <div>
              Click inside: {{ clicksInside }}
            </div>
            <div>
              Click outside: {{ clicksOutside }}
            </div>
            <button
              v-outside="() => clicksOutside++"
              @click="clicksInside++"
            >
              Click
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
* {
  font-family: Roboto, sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  user-select: none;
}
</style>

<style lang="scss" scoped>
.exp {
  &__block {
    &__title {
      padding: 10px;
      background: linear-gradient(0deg, rgba(250,250,250,1) 0%, rgba(240,240,240,1) 30%, rgba(240,240,240,1) 70%, rgba(250,250,250,1) 100%);
      color: #4d4d4d;
      box-shadow: 0 0 5px rgb(208, 203, 203);
      text-align: center;
    }
    &__content {
      display: flex;
      flex-direction: column;
      gap: 5px;
      width: max-content;
      margin: 0 auto;
      padding: 10px;

      &__file {
        border: 1px solid;
        border-radius: 3px;

        &__name {
          font-size: 14px;
          padding-left: 10px;
          background-color: #f8f8f8;
          border-bottom: 1px solid;
        }
        &__content {
          display: flex;
          flex-direction: column;
          font-size: 14px;
          padding: 2px 10px;
        }
      }
    }
  }
}
</style>
