import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError(err => {
      const message = err.error?.message || err.message || 'Une erreur est survenue';
      notification.error(message);
      return throwError(() => err);
    })
  );
};
