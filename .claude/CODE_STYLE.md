# Code Style & Testing Guidelines

Правила основаны на анализе кодовой базы проектов **mono-shared** (DS-компоненты) и **Angular Material Components**.

---

## 1. Компоненты

### Общие правила

```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [/* только необходимые зависимости */],
  templateUrl: './example.component.html',
  styleUrl: './example.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '[size(), appearance()]',
  },
})
export class ExampleComponent {}
```

| Правило | Описание |
|---------|----------|
| **standalone: true** | Дефолт в angular.json schematics. NgModules запрещены |
| **changeDetection** | OnPush — дефолт в angular.json schematics. Исключение — компоненты, оборачивающие сторонние библиотеки |
| **Шаблоны** | Всегда внешние (`templateUrl`). Inline только для абстрактных базовых классов |
| **Стили** | Всегда внешние SCSS (`styleUrl`). Inline запрещены |
| **Селекторы** | Prefix `app-`. Директивы — attribute selector `[appExample]` |
| **Host bindings** | Через `host: {}` в декораторе, не через `@HostBinding`/`@HostListener` |
| **Encapsulation** | `Emulated` (по умолчанию). `None` — только для overlay/CDK-компонентов |

### Dependency Injection

```typescript
// Всегда inject() — constructor injection запрещен
private readonly router = inject(Router);
private readonly http = inject(HttpClient);
private readonly elementRef = inject(ElementRef);
private readonly cdr = inject(ChangeDetectorRef);
```

### Signals (приоритетный подход)

```typescript
// Inputs — signal-based
public readonly size = input<'S' | 'M' | 'L'>('M');
public readonly label = input.required<string>();

// Outputs — output()
public readonly clicked = output<void>();
public readonly valueChange = output<string>();

// Two-way binding — model()
public readonly isActive = model(false);

// Computed
protected readonly fullName = computed(() => `${this.firstName()} ${this.lastName()}`);

// Внутреннее состояние
protected readonly isLoading = signal(false);

// linkedSignal для производного состояния
protected readonly derivedValue = linkedSignal(() => this.computeValue(this.source()));
```

### RxJS — только для сложных асинхронных потоков

```typescript
// Конвертация Observable -> Signal
protected readonly isDark = toSignal(this.themeService.isDark$, { initialValue: false });
protected readonly items = toSignal(this.items$, { initialValue: [] });
```

Используйте RxJS для:
- Таймеров и интервалов (`timer`, `interval`)
- Resize observers
- Сложных event streams (debounce, throttle, merge)
- HTTP-запросов (HttpClient)

### Lifecycle Hooks

| Хук | Когда использовать |
|-----|-------------------|
| Без хуков | Предпочтительно — всё через signals и `constructor()` |
| `afterNextRender()` | DOM-зависимая инициализация (resize observers, focus) |
| `ngOnInit` | Получение `NgControl` через injector, подписка на внешние сервисы |
| `ngOnDestroy` | Только если есть ручные подписки без `destroyer()` |

### Cleanup

```typescript
private readonly destroyer = createDestroyer();

constructor() {
  afterNextRender(() => {
    fromEvent(window, 'resize')
      .pipe(this.destroyer())
      .subscribe(() => this.handleResize());
  });
}
```

### Шаблоны — новый control flow

```html
@if (isLoading()) {
  <app-spinner />
} @else {
  @for (item of items(); track item.id) {
    <app-item [data]="item" />
  } @empty {
    <p>{{ 'no-items' | translate }}</p>
  }
}
```

---

## 2. Сервисы

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  // Состояние — BehaviorSubject или signal
  private readonly _user$ = new BehaviorSubject<User | null>(null);
  public readonly user$ = this._user$.asObservable();

  // Публичный API
  public login(credentials: LoginDto): Observable<User> {
    return this.http.post<User>('/api/auth/login', credentials).pipe(
      tap(user => this._user$.next(user)),
    );
  }
}
```

| Правило | Описание |
|---------|----------|
| **providedIn** | `'root'` для синглтонов. Без провайдера — для scoped-сервисов |
| **State** | `BehaviorSubject` для реактивного состояния. `signal()` для простого |
| **Public API** | Expose `Observable` (read-only), не `Subject` |
| **Error handling** | Возвращать `EMPTY` или `of(null)` вместо throw. `console.warn()` для валидации |
| **inject()** | Всегда. Constructor injection запрещен |

---

## 3. Директивы

```typescript
@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  private readonly elementRef = inject(ElementRef);

  @Output()
  public readonly appClickOutside = fromEvent<PointerEvent>(document, 'click').pipe(
    filter(event => !this.elementRef.nativeElement.contains(event.target)),
  );
}
```

| Правило | Описание |
|---------|----------|
| **standalone: true** | Всегда |
| **Selector** | Attribute selector: `[appDirectiveName]` |
| **Cleanup** | `createDestroyer()` для подписок |
| **Host bindings** | Через `host: {}` в декораторе |

---

## 4. Pipes

```typescript
// Pure pipe (по умолчанию)
@Pipe({ name: 'keys', standalone: true })
export class KeysPipe implements PipeTransform {
  public transform(value: Record<string, unknown>): string[] {
    return value ? Object.keys(value) : [];
  }
}

// Impure pipe (для реактивных зависимостей)
@Pipe({ name: 'dateFormat', standalone: true, pure: false })
export class DateFormatPipe implements PipeTransform, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);
  // ...
  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
```

| Правило | Описание |
|---------|----------|
| **pure: true** | По умолчанию. Impure — только если pipe зависит от внешнего состояния (язык, тема) |
| **standalone: true** | Всегда |
| **OnDestroy** | Обязательно для impure pipes с подписками |

---

## 5. Маршрутизация

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  { path: '**', redirectTo: '' },
];
```

| Правило | Описание |
|---------|----------|
| **loadComponent** | Lazy loading через `loadComponent` для всех page-компонентов |
| **Guards** | Функциональные guards (не class-based) |
| **Wildcard** | Всегда добавлять `{ path: '**', redirectTo: '' }` |
| **pathMatch** | Указывать `'full'` для пустых путей с redirect |

### Guards (функциональные)

```typescript
export const authGuard: CanActivateFn = () => {
  const authState = inject(AuthState);
  const router = inject(Router);

  if (authState.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
```

### Interceptors (функциональные)

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authState = inject(AuthState);
  const token = authState.token();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
```

---

## 6. Стили (SCSS)

```scss
// Используем CSS custom properties для тем
:host {
  display: flex;
  color: var(--on-surface);
  background: var(--surface);
  border-radius: 8px;
  gap: var(--spacing-8);
  padding: var(--spacing-16);

  // Размеры через host-классы
  &.S { padding: var(--spacing-8); }
  &.M { padding: var(--spacing-16); }
  &.L { padding: var(--spacing-24); }
}
```

| Правило | Описание |
|---------|----------|
| **CSS Variables** | Для цветов, отступов, типографики (theming) |
| **:host** | Стилизация корневого элемента через `:host` |
| **Размеры** | Через host-классы (`&.S`, `&.M`, `&.L`) привязанные к `[class]` binding |
| **Mixins** | `@use 'mixins/...'` для переиспользуемых паттернов |
| **Nesting** | Максимум 3 уровня вложенности |
| **BEM** | Не используется — host-based подход с flat-классами |

---

## 7. Структура файлов

```
├── feature/
│   ├── feature.component.ts
│   ├── feature.component.html
│   ├── feature.component.scss
│   ├── feature.component.spec.ts
│   └── feature.types.ts          # Типы, специфичные для компонента
```

| Правило | Описание |
|---------|----------|
| **1 компонент = 1 папка** | Все файлы компонента в одной директории |
| **index.ts** | Barrel export для публичного API библиотеки |
| **Types рядом** | Интерфейсы/типы компонента — в `*.types.ts` рядом |
| **Shared types** | Общие интерфейсы — в `shared/interfaces/` |

---

---

# Unit Testing Guidelines

Фреймворк: **Vitest** + **jsdom** (для messenger-client).
Паттерны основаны на практиках из **mono-shared** (Jest) и **Angular Material** (Jasmine).

---

## 1. Паттерн AAA (Arrange-Act-Assert)

Каждый тест строится по паттерну **AAA** — три чётко разделённые фазы:

| Фаза | Что делает | Пример |
|------|-----------|--------|
| **Arrange** | Подготовка данных, настройка моков, установка начального состояния | `component.size.set('L')` |
| **Act** | Одно действие, которое тестируем | `component.onSubmit()` |
| **Assert** | Проверка результата | `expect(spy).toHaveBeenCalled()` |

### Примеры

```typescript
// Компонент — тест логики
it('should add message to list when sendMessage is called', () => {
  // Arrange
  const message = { id: '1', text: 'Hello', senderId: 'user1' };
  component.chatId.set('chat-1');

  // Act
  component.sendMessage(message);

  // Assert
  expect(component.messages()).toContain(message);
});

// Компонент — тест View
it('should show error banner when form is invalid', () => {
  // Arrange
  component.form.controls.username.setValue('');
  component.form.controls.username.markAsTouched();

  // Act
  fixture.detectChanges();

  // Assert
  const errorBanner = fixture.nativeElement.querySelector('[data-testid="error-banner"]');
  expect(errorBanner).not.toBeNull();
  expect(errorBanner.textContent).toContain('Required');
});

// Сервис — тест HTTP
it('should send POST request with credentials on login', () => {
  // Arrange
  const credentials = { username: 'admin', password: '123' };

  // Act
  service.login(credentials).subscribe();

  // Assert
  const req = httpMock.expectOne('/api/auth/login');
  expect(req.request.method).toBe('POST');
  expect(req.request.body).toEqual(credentials);
  req.flush(mockUser);
});

// Pipe — чистая функция
it('should truncate text longer than maxLength', () => {
  // Arrange
  const longText = 'Hello World and everyone';

  // Act
  const result = pipe.transform(longText, 11);

  // Assert
  expect(result).toBe('Hello World...');
});

// Async — fakeAsync
it('should update search results after debounce', fakeAsync(() => {
  // Arrange
  const searchSpy = vi.spyOn(searchService, 'search').mockReturnValue(of(mockResults));

  // Act
  component.onSearchInput('angular');
  tick(300);
  fixture.detectChanges();

  // Assert
  expect(searchSpy).toHaveBeenCalledWith('angular');
  expect(component.results().length).toBe(3);
  discardPeriodicTasks();
}));
```

### Правила AAA

| Правило | Описание |
|---------|----------|
| **Один Act на тест** | Каждый `it()` тестирует одно действие. Несколько действий — разбить на отдельные тесты |
| **Arrange в beforeEach** | Общая подготовка (TestBed, fixture, component) — в `beforeEach`. В `it()` — только специфичная подготовка |
| **Пустая строка-разделитель** | Между Arrange/Act/Assert оставлять пустую строку для читаемости |
| **Комментарии AAA** | Комментарии `// Arrange`, `// Act`, `// Assert` обязательны, если тест больше 5 строк. Для однострочных тестов — не нужны |
| **Assert — конкретный** | `expect(result).toBe('exact value')`, а не `expect(result).toBeTruthy()` где возможно |
| **Без логики в Assert** | Никаких `if`/`for`/тернарников в блоке Assert. Assert — только `expect()` |

---

## 2. Структура теста

```typescript
describe('ExampleComponent', () => {
  let fixture: ComponentFixture<ExampleComponent>;
  let component: ExampleComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { user$: of(mockUser) } },
      ],
    });

    fixture = TestBed.createComponent(ExampleComponent);
    component = fixture.componentInstance;
  });

  describe('Model', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    describe('methodName()', () => {
      it('should return X when Y', () => {
        // Arrange
        const input = 'test';

        // Act
        const result = component.methodName(input);

        // Assert
        expect(result).toBe('expected');
      });
    });
  });

  describe('View', () => {
    it('default state', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement).toMatchSnapshot();
    });

    it('should show loading spinner when isLoading is true', () => {
      // Arrange
      component.isLoading.set(true);

      // Act
      fixture.detectChanges();

      // Assert
      expect(fixture.nativeElement.querySelector('.spinner')).not.toBeNull();
    });
  });
});
```

### Организация блоков

| Блок | Что тестируем |
|------|--------------|
| **Model** | Логика компонента: методы, computed signals, состояние |
| **View** | DOM: рендеринг, условный показ элементов, текст |
| **Events** | Пользовательские взаимодействия: клик, ввод, submit |
| **Integration** | Взаимодействие с дочерними компонентами |

---

## 3. TestBed конфигурация

### Компонент с мок-сервисами

```typescript
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      {
        provide: ChatService,
        useValue: {
          getChats: vi.fn().mockReturnValue(of(mockChats)),
          sendMessage: vi.fn().mockReturnValue(of(mockMessage)),
        },
      },
    ],
  });

  fixture = TestBed.createComponent(ChatListComponent);
  component = fixture.componentInstance;
});
```

### Компонент с Host-компонентом (для тестирования inputs/outputs)

```typescript
@Component({
  standalone: true,
  imports: [MessageBubbleComponent],
  template: '<app-message-bubble [message]="message" (deleted)="onDeleted($event)" />',
})
class TestHostComponent {
  public message = mockMessage;
  public onDeleted = vi.fn();
}

beforeEach(() => {
  fixture = TestBed.createComponent(TestHostComponent);
  const bubbleDebugEl = fixture.debugElement.query(By.directive(MessageBubbleComponent));
  component = bubbleDebugEl.componentInstance;
});
```

### Директива с `runInInjectionContext`

```typescript
beforeEach(() => {
  directive = TestBed.runInInjectionContext(() => new HighlightDirective());
});
```

### Pipe — без TestBed

```typescript
describe('TruncatePipe', () => {
  const pipe = new TruncatePipe();

  it('should truncate long text', () => {
    expect(pipe.transform('Hello World', 5)).toBe('Hello...');
  });
});
```

---

## 4. Мокирование

### Сервисы — через `useValue` с `vi.fn()`

```typescript
{
  provide: AuthService,
  useValue: {
    login: vi.fn().mockReturnValue(of(mockUser)),
    logout: vi.fn(),
    isAuthenticated: vi.fn().mockReturnValue(true),
  },
}
```

### Модули/функции — через `vi.mock()`

```typescript
vi.mock('../services/api.service', () => ({
  ApiService: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockReturnValue(of([])),
  })),
}));
```

### HTTP — через `provideHttpClientTesting()`

```typescript
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  });

  service = TestBed.inject(ApiService);
  httpMock = TestBed.inject(HttpTestingController);
});

afterEach(() => {
  httpMock.verify(); // Убедиться, что нет необработанных запросов
});

it('should fetch chats', () => {
  service.getChats().subscribe(chats => {
    expect(chats).toEqual(mockChats);
  });

  const req = httpMock.expectOne('/api/chats');
  expect(req.request.method).toBe('GET');
  req.flush(mockChats);
});
```

### Signals — через `.set()` и чтение

```typescript
it('should compute fullName from firstName and lastName signals', () => {
  component.firstName.set('John');
  component.lastName.set('Doe');
  expect(component.fullName()).toBe('John Doe');
});
```

---

## 5. DOM-запросы

```typescript
// По CSS-селектору
fixture.nativeElement.querySelector('[data-testid="send-button"]');
fixture.nativeElement.querySelectorAll('.message-item');

// По директиве
fixture.debugElement.query(By.directive(MessageBubbleComponent));
fixture.debugElement.queryAll(By.css('button'));

// nativeElement для DOM-операций
const el = fixture.debugElement.query(By.css('.title'))!.nativeElement;
expect(el.textContent).toContain('Welcome');
```

**Правило:** Используйте `data-testid` для тестовых селекторов вместо CSS-классов.

---

## 6. Асинхронное тестирование

### fakeAsync + tick

```typescript
it('should debounce search input', fakeAsync(() => {
  component.onSearchInput('hello');
  tick(300); // debounce time
  fixture.detectChanges();

  expect(component.searchResults().length).toBe(3);
  discardPeriodicTasks(); // очистить таймеры
}));
```

### firstValueFrom для Observable -> Promise

```typescript
it('should emit current user', async () => {
  const user = await firstValueFrom(service.user$);
  expect(user).toEqual(mockUser);
});
```

### Subjects для управления потоком

```typescript
const click$ = new Subject<MouseEvent>();
vi.spyOn(service, 'onClick$', 'get').mockReturnValue(click$);

click$.next(new MouseEvent('click'));
fixture.detectChanges();

expect(component.isOpen()).toBe(true);
```

---

## 7. Snapshot-тесты

```typescript
it('default state', () => {
  fixture.detectChanges();
  expect(fixture.nativeElement).toMatchSnapshot();
});
```

Используйте для:
- Проверки начального состояния компонента (default state)
- Простых presentational-компонентов

НЕ используйте для:
- Сложных компонентов с динамическим контентом
- Тестирования логики — только визуальная структура

---

## 8. Что тестировать

### Компоненты

| Что | Пример |
|-----|--------|
| Создание | `expect(component).toBeTruthy()` |
| Default state | Snapshot или DOM-проверки |
| Signal inputs | `component.size.set('L'); fixture.detectChanges()` |
| Computed signals | `expect(component.fullName()).toBe(...)` |
| Условный рендеринг | `@if` / `@for` — проверить наличие/отсутствие элементов |
| Events | `element.click(); fixture.detectChanges()` |
| Output emissions | `vi.spyOn(component.clicked, 'emit')` |
| Form control integration | `writeValue`, `validate`, `setDisabledState` |

### Сервисы

| Что | Пример |
|-----|--------|
| Методы | Вызвать метод, проверить Observable/результат |
| Состояние | Проверить BehaviorSubject / signal после действия |
| HTTP | `httpMock.expectOne()`, проверить method и body |
| Error handling | Проверить поведение при ошибке |

### Pipes

| Что | Пример |
|-----|--------|
| Transform | `expect(pipe.transform(input)).toBe(expected)` |
| Edge cases | `null`, `undefined`, пустая строка |
| Cleanup | `ngOnDestroy()` для impure pipes |

### Директивы

| Что | Пример |
|-----|--------|
| Host element changes | Проверить атрибуты/классы на элементе |
| Events | Trigger events, проверить реакцию |
| Inputs | Установить input, проверить поведение |

---

## 9. Именование тестов

```typescript
// Формат: should [action] when [condition]
it('should show error message when login fails', () => {});
it('should disable submit button when form is invalid', () => {});
it('should emit valueChange when input changes', () => {});
it('should navigate to /login when not authenticated', () => {});

// Для default state
it('default state', () => {});
it('should create', () => {});
```

---

## 10. Запрещено в тестах

| Запрещено | Почему |
|-----------|--------|
| `setTimeout` в тестах | Используйте `fakeAsync` + `tick` |
| Тестирование private через `as any` | Тестируйте через публичный API. Исключение — legacy код |
| Дублирование setup | Выносите в `beforeEach` или helper-функции |
| Magic numbers | Используйте константы: `const DEBOUNCE_MS = 300` |
| Прямой доступ к DOM без `detectChanges()` | Всегда вызывайте `fixture.detectChanges()` перед DOM-проверками |
