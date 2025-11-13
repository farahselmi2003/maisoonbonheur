import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => { // Correction: AppComponent au lieu de App
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent], // Correction: AppComponent au lieu de App
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent); // Correction: AppComponent au lieu de App
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent); // Correction: AppComponent au lieu de App
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, maison-bonheur');
  });
});