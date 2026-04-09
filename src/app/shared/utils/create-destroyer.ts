import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MonoTypeOperatorFunction } from 'rxjs';

export function createDestroyer(): <T>() => MonoTypeOperatorFunction<T> {
  const destroyRef = inject(DestroyRef);

  return <T>() => takeUntilDestroyed<T>(destroyRef);
}
