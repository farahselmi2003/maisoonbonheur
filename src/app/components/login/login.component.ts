import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl:"./login.component.html" ,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMsg: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private analyticsService: AnalyticsService
  ) {}

  async login() {
    if (!this.email || !this.password) {
      this.errorMsg = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    try {
      const user = await firstValueFrom(
        this.authService.login({ email: this.email, password: this.password })
      );
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      if (user) {
        this.analyticsService.trackLogin('email');
        this.router.navigate([returnUrl || '/']);
      }
    } catch (err) {
      this.errorMsg = 'Email ou mot de passe incorrect';
      console.error('Login error:', err);
    } finally {
      this.isLoading = false;
    }
  }
}
