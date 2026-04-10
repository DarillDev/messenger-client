import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '@app/core/store/auth/auth.store';
import { Observable, shareReplay, switchMap, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { AUTH_CONFIG } from '../../tokens/auth-config.token';

/**
 *  Переменная, хранящая Observable активного запроса на обновление токена.
 *
 * null  — рефреш сейчас не выполняется.
 * !null — рефреш уже запущен; новые 403 подписываются к нему, а не стартуют свой.
 *
 * Переменная намеренно объявлена вне функции-интерцептора — она должна быть
 * синглтоном уровня модуля и переживать несколько вызовов интерцептора.
 */
let refreshInProgress$: Observable<unknown> | null = null;

/**
 * HTTP-интерцептор авторизации.
 *
 * Отвечает за три вещи:
 *  1. Добавляет заголовок `Authorization: Bearer <token>` к каждому исходящему запросу.
 *  2. При получении 403 автоматически обновляет пару токенов и повторяет запрос.
 *  3. Предотвращает параллельные запросы на обновление токена (refresh-lock):
 *     если рефреш уже идёт — все новые 403 ждут его результата, а не запускают свой.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authStore = inject(AuthStore);
  const config = inject(AUTH_CONFIG);

  // Запросы к эндпоинтам авторизации (login, refresh) не должны содержать
  // Bearer-заголовок — их пропускаем без модификации.
  if (request.url.startsWith(config.authUrl)) {
    return next(request);
  }

  const accessToken = authStore.token()?.accessToken;

  // Клонируем запрос с заголовком авторизации, если токен есть.
  // Если токена нет (пользователь не аутентифицирован), отправляем запрос как есть —
  // сервер вернёт 401/403, которые обработаются ниже.
  const authorizedRequest = accessToken
    ? request.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : request;

  return next(authorizedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Прокидываем все ошибки кроме 403 дальше без обработки.
      if (error.status !== 403) {
        return throwError(() => error);
      }

      // --- Refresh lock ---
      // Если рефреш ещё не запущен — создаём его и сохраняем в `refreshInProgress$`.
      //   - все подписчики (параллельные запросы, получившие 403) разделяют один HTTP-вызов;
      //   - опоздавшие подписчики, пришедшие после завершения, мгновенно получают
      //     закешированный результат и не запускают повторный рефреш.
      // `finalize` гарантирует сброс флага как при успехе, так и при ошибке.
      // `catchError` здесь (а не у подписчика) гарантирует, что `logout` вызовется
      //  ровно один раз, даже если рефреш ждут несколько параллельных запросов.
      if (!refreshInProgress$) {
        refreshInProgress$ = authStore.refreshTokens().pipe(
          catchError(refreshError => {
            authStore.logout();
            return throwError(() => refreshError);
          }),
          finalize(() => {
            refreshInProgress$ = null;
          }),
          shareReplay(1),
        );
      }

      // Все запросы (и тот, что создал рефреш, и параллельные ожидающие)
      // подписываются на один и тот же `refreshInProgress$`.
      return refreshInProgress$.pipe(
        switchMap(() => {
          // Рефреш завершился успешно — читаем свежий токен из стора
          // и повторяем оригинальный запрос с обновлённым заголовком.
          const newToken = authStore.token()?.accessToken;
          return next(request.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }));
        }),
        catchError(() => {
          // Рефреш упал — logout уже вызван внутри refreshInProgress$,
          // здесь только пробрасываем исходную ошибку 403 вызывающему коду.
          return throwError(() => error);
        }),
      );
    }),
  );
};
