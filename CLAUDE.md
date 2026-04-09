# Messenger Client

Angular 21 single-page application — текстовый мессенджер (тестовое задание Frontend Middle).
Полное ТЗ: [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)

## Commands

- `npm start` — dev server (http://localhost:4200)
- `npm run build` — production build
- `npm run watch` — dev build with watch mode
- `npm test` — run unit tests (Jest)
- `npm run test:watch` — тесты в watch-режиме
- `npm run test:coverage` — тесты с отчётом покрытия
- `npm run lint` — ESLint проверка (--max-warnings 0)
- `npm run lint:fix` — ESLint auto-fix
- `npm run format` — Prettier форматирование
- `npm run format:check` — проверка форматирования без изменений
- `npx ng generate component <name>` — generate component
- `npx ng generate service <name>` — generate service

## Architecture

- **Framework**: Angular 21 (standalone components, signals)
- **Styles**: SCSS, inline style language SCSS
- **Tests**: Jest + jest-preset-angular + jsdom
- **Linter**: ESLint 9 (flat config) + @angular-eslint + typescript-eslint + eslint-plugin-import
- **Formatter**: Prettier (100 chars, single quotes, angular HTML parser)
- **Package manager**: npm
- **No SSR** — client-only SPA

## Code Style Rules

Полный справочник с примерами: [CODE_STYLE.md](.claude/CODE_STYLE.md). Используй `/write-tests` и `/code-review` скиллы для подгрузки полных правил.

### Компоненты
- standalone: true и OnPush — дефолт в angular.json schematics (не указывать явно при генерации)
- External templateUrl/styleUrl
- host: {} для bindings, prefix app-, Emulated encapsulation (None только для overlay)
- inject() всегда, constructor injection запрещён
- createDestroyer() для cleanup подписок

### Signals
- input(), output(), model(), computed(), signal(), linkedSignal(), toSignal()
- RxJS только для таймеров, resize, сложных event streams, HTTP

### Lifecycle
- Предпочтительно без хуков. afterNextRender() для DOM, ngOnInit только для NgControl

### Templates
- Новый control flow: @if, @for (с track), @empty

### Сервисы
- providedIn: 'root', BehaviorSubject/signal для состояния
- Expose Observable (не Subject), ошибки через EMPTY/of(null)

### Директивы & Pipes
- standalone, attribute selector [appName], createDestroyer()
- Pipes: pure по умолчанию, OnDestroy для impure

### Маршрутизация
- loadComponent lazy loading, функциональные guards/interceptors, wildcard route

### SCSS
- CSS custom properties, :host, host-классы для размеров, max 3 уровня nesting, @use mixins

### Naming Conventions
- Интерфейсы: IUser, Type aliases: TAlertType, Enum: ETheme
- Типы компонента в *.types.ts рядом
- File suffixes: *.component.ts, *.service.ts, *.directive.ts, *.pipe.ts
- Path aliases: @app/*, @core/*, @shared/*, @state/*, @pages/*, @mock/*

### Тестирование
- Jest + jsdom, паттерн AAA (Arrange-Act-Assert) с пустыми строками-разделителями
- Структура: Model / View / Events / Integration
- jest.fn() моки, provideHttpClientTesting, fakeAsync+tick, data-testid селекторы
- Snapshots только для default state presentational-компонентов
- Именование: "should [action] when [condition]"

## Conventions

- Standalone components only (no NgModules)
- Strict TypeScript: strict, noImplicitOverride, noImplicitReturns, noFallthroughCasesInSwitch
- Strict Angular templates: strictTemplates, strictInjectionParameters, strictInputAccessModifiers
- ESLint: strict naming conventions (I/T/E prefixes), no-explicit-any, explicit-function-return-type, explicit-member-accessibility
- Prettier: 100 char width, single quotes, angular HTML parser

## Design

Утверждённый дизайн находится в `docs/design/`:

- [messenger-design.html](docs/design/messenger-design.html) — полный дизайн всех 4 страниц (Login, Messenger, Profile, Settings), dark/light тема, i18n ru/en
- [components.html](docs/design/components.html) — каталог всех UI-компонентов отдельно, с состояниями (:hover, :focus, :active, :error) и spec-таблицами (размеры, отступы, цвета, анимации)

При создании Angular-компонентов **обязательно сверяйся с `components.html`** — там точные значения CSS-переменных, размеров, радиусов, шрифтов, теней и переходов для каждого компонента.

Ключевые решения:
- Тёмная тема (primary) + светлая через CSS-переменные на `<html data-theme>`
- Material Icons Round
- Liquid glass — на login-карточке, навигации, date divider, profile stats
- Кастомный select (не нативный)
- Все кнопки имеют `:active` pressed-эффект

## Project Structure

```
├── public/                            # Статические ассеты (favicon, изображения)
├── docs/                              # Документация проекта
│   └── REQUIREMENTS.md
└── src/
    ├── main.ts                        # Точка входа, bootstrap приложения
    ├── index.html                     # Корневой HTML
    ├── styles.scss                    # Глобальные стили
    ├── styles/                        # SCSS-утилиты для переиспользования
    │   ├── _variables.scss
    │   └── _mixins.scss
    └── app/
        ├── app.component.ts           # Корневой компонент
        ├── app.config.ts              # Провайдеры приложения (router, http, interceptors)
        ├── app.routes.ts              # Определение маршрутов
        │
        ├── core/                      # Синглтоны: сервисы, guards, interceptors, модели
        │   ├── guards/
        │   │   └── auth.guard.ts
        │   ├── interceptors/
        │   │   └── auth.interceptor.ts
        │   ├── services/
        │   │   ├── auth.service.ts
        │   │   └── api.service.ts
        │   └── models/
        │       ├── user.model.ts
        │       ├── chat.model.ts
        │       └── message.model.ts
        │
        ├── state/                     # Управление состоянием (state management)
        │   ├── auth.state.ts
        │   ├── chats.state.ts
        │   └── messages.state.ts
        │
        ├── pages/                     # Routed-компоненты, по одному на маршрут
        │   ├── login/
        │   │   └── login.component.ts
        │   ├── home/
        │   │   └── home.component.ts
        │   └── user/
        │       └── user.component.ts
        │
        ├── shared/                    # Общие ресурсы, переиспользуемые по всему проекту
        │   ├── ui-kit/                # Переиспользуемые UI-компоненты
        │   │   ├── sidebar/
        │   │   ├── chat-list/
        │   │   ├── chat-window/
        │   │   └── message-bubble/
        │   ├── interfaces/            # Общие интерфейсы
        │   ├── types/                 # Общие типы
        │   ├── enums/                 # Перечисления
        │   └── constants/             # Константы
        │
        └── mock/                      # Фейковый REST API для разработки
            ├── db.json
            └── mock-api.interceptor.ts
```

## Data Flow

```
Pages → State → Services → HttpClient + authInterceptor → MockApiInterceptor → db.json
```

## Data Models

- **User**: id, username, password, avatar
- **Chat**: id, participants[], lastMessage, updatedAt
- **Message**: id, chatId, senderId, text, createdAt

## Routes

| Route    | Component      | Guard     |
|----------|---------------|-----------|
| `/`      | HomePage      | authGuard |
| `/login` | LoginPage     | —         |
| `/user`  | UserPage      | authGuard |
