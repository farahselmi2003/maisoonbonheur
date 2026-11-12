import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    const name = error?.name || '';
    const message = error?.message || '';
    const text = `${name} ${message}`;

    // Ignore Supabase Navigator LockManager noise in dev
    if (
      name === 'NavigatorLockAcquireTimeoutError' ||
      text.includes('Navigator LockManager') ||
      text.includes('lock:sb-')
    ) {
      console.debug('Supprimé: LockManager dev warning', error);
      return;
    }

    // Fallback to default logging
    console.error(error);
  }
}