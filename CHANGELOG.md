# Changelog


## v1.2.1

[compare changes](https://github.com/LorexIQ/nuxt-auto-import/compare/v1.2.0...v1.2.1)

### 🩹 Fixes

- Добавлено удаление зависимых импортов в cjs и ускорен ts-morph ([24925ba](https://github.com/LorexIQ/nuxt-auto-import/commit/24925ba))

### ❤️ Contributors

- LorexIQ <i@liq-mail.ru>

## v1.2.0

[compare changes](https://github.com/LorexIQ/nuxt-auto-import/compare/v1.1.2...v1.2.0)

### 🚀 Enhancements

- Добавлен debug режим. (см. документацию) ([59d94cc](https://github.com/LorexIQ/nuxt-auto-import/commit/59d94cc))

### 🩹 Fixes

- Исправлен builder путей ([f94f073](https://github.com/LorexIQ/nuxt-auto-import/commit/f94f073))
- Исправлена сборка из-за ошибок зависимости useLogger ([605babc](https://github.com/LorexIQ/nuxt-auto-import/commit/605babc))

### ❤️ Contributors

- LorexIQ <i@liq-mail.ru>

## v1.1.2

[compare changes](https://github.com/LorexIQ/nuxt-auto-import/compare/v1.1.1...v1.1.2)

### 🩹 Fixes

- Исправлена конфигурация публикации ([ff4ec11](https://github.com/LorexIQ/nuxt-auto-import/commit/ff4ec11))
- Исправлена ошибка зависимостей функции useAutoImport ([a93bd37](https://github.com/LorexIQ/nuxt-auto-import/commit/a93bd37))

### ❤️ Contributors

- LorexIQ <i@liq-mail.ru>

## v1.1.1

[compare changes](https://github.com/LorexIQ/nuxt-auto-import/compare/v1.1.0...v1.1.1)

### 🩹 Fixes

- Исправлен CHANGELOG.md ([707f41e](https://github.com/LorexIQ/nuxt-auto-import/commit/707f41e))
- Исправлен CHANGELOG.md" ([8d25070](https://github.com/LorexIQ/nuxt-auto-import/commit/8d25070))
- Изменён способ сохранения meta данных ([ac91ed3](https://github.com/LorexIQ/nuxt-auto-import/commit/ac91ed3))

### ❤️ Contributors

- LorexIQ <i@liq-mail.ru>

## v1.1.0


### 🚀 Enhancements

- Миграция проекта ([b72ed72](https://github.com/LorexIQ/nuxt-auto-import/commit/b72ed72))
- Добавлена настройка коннекторов, генерация инициализаторов для каждого из коннекторов и отлажена работа ([f833254](https://github.com/LorexIQ/nuxt-auto-import/commit/f833254))
- Добавлена возможность безопасного сохранения типа в коннекторе, путем передачи его в generic ([bd0b4fd](https://github.com/LorexIQ/nuxt-auto-import/commit/bd0b4fd))
- Настроена сборка проекта ([a9cc6c3](https://github.com/LorexIQ/nuxt-auto-import/commit/a9cc6c3))
- Реализовано автоматического обновление типов при обновлении файлов в режиме dev ([46e694a](https://github.com/LorexIQ/nuxt-auto-import/commit/46e694a))
- Добавлена интеграция типов AutoImport* в глобальное пространство, а так же "умное" перемещение путей импортов из коннектора в define ([b3946f8](https://github.com/LorexIQ/nuxt-auto-import/commit/b3946f8))
- Добавлена meta информация об проекте ([11c9d4f](https://github.com/LorexIQ/nuxt-auto-import/commit/11c9d4f))
- Добавлен контент в playground для базовой демонстрации ([ed2fc0a](https://github.com/LorexIQ/nuxt-auto-import/commit/ed2fc0a))
- Добавлен github ci cd ([786d3a8](https://github.com/LorexIQ/nuxt-auto-import/commit/786d3a8))

### 🩹 Fixes

- Сильно улучшена система портирования типов и импортов из коннектора в define ([b8f11d2](https://github.com/LorexIQ/nuxt-auto-import/commit/b8f11d2))
- Исправлен ci cd ([c04e302](https://github.com/LorexIQ/nuxt-auto-import/commit/c04e302))
- Удалён ci cd ([6b78781](https://github.com/LorexIQ/nuxt-auto-import/commit/6b78781))
- Исправлен release script ([5838a19](https://github.com/LorexIQ/nuxt-auto-import/commit/5838a19))

### 💅 Refactors

- Стили коннекторов мигрированы под капот и теперь доступны глобально ([2911059](https://github.com/LorexIQ/nuxt-auto-import/commit/2911059))

### 📖 Documentation

- Добавлена документация ([3211b02](https://github.com/LorexIQ/nuxt-auto-import/commit/3211b02))

### ❤️ Contributors

- LorexIQ <i@liq-mail.ru>
- Dmitry Murashko <i@liq-mail.ru>

