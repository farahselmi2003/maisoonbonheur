import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { JsonServerService } from '../../services/json-server';
import { firstValueFrom } from 'rxjs';


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
    private jsonServerService: JsonServerService, 
    private router: Router
  ) {}

  async login() {
    if (!this.email || !this.password) {
      this.errorMsg = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    try {
      const user = await firstValueFrom(this.jsonServerService.signIn(this.email, this.password));

      if (user) {
        this.router.navigate(['/']);
      }
    } catch (err) {
      this.errorMsg = 'Email ou mot de passe incorrect';
      console.error('Login error:', err);
    } finally {
      this.isLoading = false;
    }
  }
}
