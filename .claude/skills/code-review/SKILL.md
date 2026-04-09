---
name: code-review
description: Review code against messenger-client coding standards (components, services, SCSS, tests)
---

# Code Review

Review code against project coding standards.

**Target:** $ARGUMENTS

## Before Reviewing

1. Read [CODE_STYLE.md](../../CODE_STYLE.md) completely
2. Read the target file(s)
3. Identify the file type and apply the corresponding section from CODE_STYLE.md

## Review Process

For each file, check against the relevant rules and report findings in three categories:

### Must Fix (rule violations)
Hard violations of project conventions that must be corrected.

### Should Fix (convention deviations)
Deviations from established patterns that should be addressed.

### Consider (improvements)
Suggestions for better code quality, not strict violations.

## Checklists by File Type

### Component (.component.ts)
- [ ] standalone: true
- [ ] ChangeDetectionStrategy.OnPush
- [ ] External templateUrl and styleUrl (no inline)
- [ ] inject() for DI (no constructor injection)
- [ ] Signal-based inputs: input(), output(), model()
- [ ] host: {} for host bindings (no @HostBinding/@HostListener)
- [ ] Encapsulation: Emulated (default) or None for overlays only
- [ ] Minimal lifecycle hooks (prefer afterNextRender, avoid OnInit where possible)
- [ ] createDestroyer() for subscriptions

### Service (.service.ts)
- [ ] providedIn: 'root' for singletons
- [ ] inject() for DI
- [ ] BehaviorSubject or signal for state
- [ ] Public Observable (not Subject)
- [ ] Error handling: EMPTY or of(null), not throw

### Directive (.directive.ts)
- [ ] standalone: true
- [ ] Attribute selector [appName]
- [ ] createDestroyer() for subscriptions

### Pipe (.pipe.ts)
- [ ] standalone: true
- [ ] pure: true by default
- [ ] OnDestroy for impure pipes with subscriptions

### SCSS (.component.scss)
- [ ] CSS custom properties for theming
- [ ] :host for root element styling
- [ ] Host-classes for size variants
- [ ] Max 3 nesting levels
- [ ] @use for mixins (not @import)

### Test (.spec.ts)
- [ ] AAA pattern (Arrange-Act-Assert) with blank line separators
- [ ] Model / View / Events / Integration sections
- [ ] Proper mocking (jest.fn(), useValue, provideHttpClientTesting)
- [ ] data-testid for DOM selectors
- [ ] fakeAsync+tick for async, no setTimeout
- [ ] "should [action] when [condition]" naming
- [ ] No `as any` for private member access

### Naming Conventions
- [ ] Interfaces: IUser, IChat
- [ ] Type aliases: TAlertType, TSize
- [ ] Enums: ETheme, EStatus
- [ ] Component types in *.types.ts next to component
- [ ] File suffixes: *.component.ts, *.service.ts, etc.

### Routing
- [ ] loadComponent for lazy loading
- [ ] Functional guards and interceptors
- [ ] Wildcard fallback route
- [ ] pathMatch: 'full' for empty path redirects

## Output Format

```
## Review: [filename]

### Must Fix
1. [line:N] Description — rule reference

### Should Fix
1. [line:N] Description — rule reference

### Consider
1. [line:N] Description
```
