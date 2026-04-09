---
name: write-tests
description: Generate unit tests following messenger-client conventions (AAA pattern, Jest, Angular TestBed)
---

# Write Unit Tests

Generate unit tests for the specified file or component following project conventions.

**Target:** $ARGUMENTS

## Before Writing Tests

1. Read the full testing guidelines from [CODE_STYLE.md](../../CODE_STYLE.md) — sections "Unit Testing Guidelines" (sections 1-10)
2. Read the target file to understand its public API, dependencies, template bindings, and signals
3. Identify the file type: component, service, directive, or pipe

## Test File Structure

Every test file follows this structure:

```
describe('ClassName', () => {
  // beforeEach with TestBed setup

  describe('Model', () => {
    // Public methods, computed signals, state logic
  });

  describe('View', () => {
    // DOM rendering, conditional elements, text content
  });

  describe('Events', () => {
    // User interactions: click, input, submit
  });
});
```

## AAA Pattern (Mandatory)

Every `it()` block follows Arrange-Act-Assert with blank line separators:

```
it('should [action] when [condition]', () => {
  // Arrange
  ...

  // Act
  ...

  // Assert
  ...
});
```

- AAA comments required if test > 5 lines
- One Act per test
- No logic (if/for) in Assert block
- Specific assertions: `toBe('exact')` over `toBeTruthy()`

## Patterns by File Type

### Components
- TestBed with mocked services via `useValue: { method: jest.fn() }`
- Host component pattern for testing inputs/outputs
- `fixture.detectChanges()` before DOM assertions
- `data-testid` selectors for DOM queries
- Signal inputs: `component.myInput.set(value)`

### Services
- `TestBed.inject(ServiceName)` for instantiation
- `provideHttpClient()` + `provideHttpClientTesting()` for HTTP
- `httpMock.expectOne(url)` + `req.flush(data)` for HTTP assertions
- `afterEach(() => httpMock.verify())`

### Pipes
- Direct instantiation: `const pipe = new MyPipe()`
- No TestBed needed for pure pipes
- Test edge cases: null, undefined, empty string

### Directives
- `TestBed.runInInjectionContext(() => new MyDirective())`
- Or host component with directive applied in template

## Async Testing

- `fakeAsync(() => { ... tick(ms); ... discardPeriodicTasks(); })`
- `firstValueFrom(observable$)` for Observable -> Promise
- Subject stubs for controlling observable flow

## Checklist Before Done

- [ ] All public methods have at least one test
- [ ] AAA pattern with blank line separators
- [ ] Proper mocking (no real HTTP, no real services)
- [ ] Default state snapshot (for presentational components)
- [ ] Edge cases covered (empty, null, error states)
- [ ] Test names follow "should [action] when [condition]"
- [ ] No `setTimeout`, no `as any` for private access, no magic numbers
