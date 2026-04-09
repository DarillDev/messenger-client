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
- **Mock API**: dev-only через `MockApiInterceptor` в `main.ts`, prod uses `main.prod.ts` via `fileReplacements`

## Code Style Rules

Полный справочник с примерами: [CODE_STYLE.md](.claude/CODE_STYLE.md). Используй `/write-tests` и `/code-review` скиллы для подгрузки полных правил.

### Компоненты
- standalone: true и OnPush — дефолт в angular.json schematics (не указывать явно при генерации)
- External templateUrl/styleUrl
- host: {} для bindings, prefix `app-` или `ui-kit-` для ui-kit компонентов, Emulated encapsulation (None только для overlay)
- inject() всегда, constructor injection запрещён
- createDestroyer() для cleanup подписок

### Signals
- input(), output(), model(), computed(), signal(), linkedSignal(), toSignal()
- RxJS только для таймеров, resize, сложных event streams, HTTP

### Lifecycle
- Предпочтительно без хуков. afterNextRender() для DOM, ngOnInit только для NgControl
- `effect(onCleanup => {...})` для подписок с автоочисткой

### Templates
- Новый control flow: @if, @for (с track), @empty
- **НЕ использовать** *ngIf, *ngFor — только новый синтаксис

### Сервисы
- providedIn: 'root', BehaviorSubject/signal для состояния
- Expose Observable (не Subject), ошибки через EMPTY/of(null)

### Директивы & Pipes
- standalone, attribute selector `[appName]` или `[uiKitName]` для ui-kit
- Pipes: pure по умолчанию, OnDestroy для impure

### Маршрутизация
- loadComponent lazy loading, функциональные guards/interceptors, wildcard route

### SCSS
- CSS custom properties, :host, host-классы для размеров, max 3 уровня nesting, @use mixins
- `stylePreprocessorOptions.includePaths: ["src"]` — можно `@use 'styles/mixins'` из компонентов
- Директивы не поддерживают `styleUrl` — стили через global CSS с host-классом

### Naming Conventions
- Интерфейсы: IUser, Type aliases: TAlertType, Enum: ETheme
- Boolean: isLoading, isEmpty, hasPrefix (is/has prefix)
- Типы компонента в *.types.ts рядом
- File suffixes: *.component.ts, *.service.ts, *.directive.ts, *.pipe.ts, *.token.ts
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
- ESLint: selector prefixes `app-` и `ui-kit-`/`uiKit` разрешены
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
│   ├── REQUIREMENTS.md
│   ├── design/                        # Утверждённый дизайн (HTML)
│   └── superpowers/                   # Спеки и планы реализации
│       ├── specs/
│       └── plans/
└── src/
    ├── main.ts                        # Dev точка входа (с MockApiInterceptor)
    ├── main.prod.ts                   # Prod точка входа (чистый)
    ├── index.html                     # Корневой HTML (data-theme="dark", Google Fonts)
    ├── styles.scss                    # Глобальные стили (reset, ambient bg, ui-kit-input)
    ├── styles/                        # SCSS-утилиты
    │   ├── _variables.scss            # CSS custom properties (dark/light темы, radii, fonts, easings)
    │   └── _mixins.scss               # liquid-glass, panel-card, scrollbar-thin, responsive
    └── app/
        ├── app.component.ts           # Корневой компонент (<router-outlet>)
        ├── app.config.ts              # Провайдеры (router, httpClient)
        ├── app.routes.ts              # Маршруты (/login, /, **)
        │
        ├── core/                      # Синглтоны: сервисы, guards, interceptors, модели
        │
        ├── state/                     # Управление состоянием (state management)
        │
        ├── pages/                     # Routed-компоненты
        │   ├── login/                 # Страница авторизации
        │   │   ├── login.component.ts/html/scss/spec.ts
        │   │   ├── enums/             # ELoginFormErrorKey
        │   │   └── constants/         # LOGIN_FORM_ERRORS_TEXT
        │   └── internal/              # Internal layout (sidebar + main)
        │       └── internal-layout.component.ts/html/scss/spec.ts
        │
        ├── shared/
        │   └── ui-kit/                # Переиспользуемые UI-компоненты
        │       ├── button/            # ButtonComponent (primary/secondary, fullWidth)
        │       │   └── index.ts
        │       ├── glass-card/        # GlassCardComponent (liquid glass контейнер)
        │       │   └── index.ts
        │       ├── input/             # UiKitInputDirective (реализует FORM_FIELD_CONTROL)
        │       │   └── index.ts
        │       └── form-field/        # FormField архитектура (Material-style)
        │           ├── components/
        │           │   └── form-field/    # FormFieldComponent (контейнер: label, error, prefix/suffix)
        │           ├── directives/
        │           │   ├── prefix/        # UiKitPrefixDirective
        │           │   └── suffix/        # UiKitSuffixDirective
        │           ├── pipes/
        │           │   └── error-text/    # ErrorTextPipe (DI-based error resolution)
        │           ├── tokens/
        │           │   └── error-messages.token.ts  # UI_KIT_ERROR_MESSAGES + provideUiKitErrorMessages()
        │           ├── utils/
        │           │   └── wrap-validator.ts  # wrapValidator(validatorFn, customKey)
        │           ├── form-field.token.ts         # FORM_FIELD + IFormField
        │           ├── form-field-control.token.ts  # FORM_FIELD_CONTROL + IFormFieldControl
        │           └── index.ts
        │
        └── mock/                      # Фейковый REST API (dev-only)
            ├── db.json
            └── mock-api.interceptor.ts
```

## UI-Kit Architecture

### FormField (Material-style)
- **FORM_FIELD_CONTROL** — InjectionToken + IFormFieldControl interface. Контрол реализует: stateChanges, isFocused, isEmpty, isDisabled, isErrorState, ngControl, id, placeholder
- **FORM_FIELD** — InjectionToken + IFormField interface. FormField провайдит себя, контрол инжектит и регистрируется через `registerControl()`
- **FormFieldComponent** — контейнер: floating/static label, error/hint subscript, prefix/suffix slots
- **UiKitInputDirective** — вешается на нативный `<input>`, реализует FORM_FIELD_CONTROL, регистрируется в FormField через DI
- **ErrorTextPipe** — резолвит ключ ошибки в текст: override map → DI map (UI_KIT_ERROR_MESSAGES) → fallback key
- **provideUiKitErrorMessages(patch)** — патчит (не заменяет) дефолтный map ошибок на любом уровне инжектора
- **wrapValidator(validatorFn, customKey)** — оборачивает стандартный валидатор, ремапит error key

Каждый ui-kit компонент имеет `index.ts` barrel export.

## Data Flow

```
Pages → State → Services → HttpClient + authInterceptor → MockApiInterceptor → db.json
```

## Data Models

- **User**: id, username, password, avatar
- **Chat**: id, participants[], lastMessage, updatedAt
- **Message**: id, chatId, senderId, text, createdAt

## Routes

| Route    | Component              | Guard     |
|----------|------------------------|-----------|
| `/`      | InternalLayoutComponent | —         |
| `/login` | LoginComponent          | —         |
| `**`     | redirect → `/`          | —         |
