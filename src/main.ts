import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
  
window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  try {
    const reason: any = event.reason;
    const name = reason?.name || '';
    const message = reason?.message || '';
    const text = `${name} ${message}`;
    if (name === 'NavigatorLockAcquireTimeoutError' || text.includes('Navigator LockManager')) {
      event.preventDefault();
      console.debug('Supprimé: LockManager unhandled rejection');
    }
  } catch {}
});