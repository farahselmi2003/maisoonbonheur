import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private STORAGE_KEY = 'mb_user_session';
  private USERS_KEY = 'mb_users';
  private users: User[] = [];
  private currentUser$ = new BehaviorSubject<User | null>(null);

  constructor(private router: Router) {
    this.loadUsers();
    this.loadSession();
  }

  get user$(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  get currentUser(): User | null {
    return this.currentUser$.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUser$.value;
  }

  private loadUsers(): void {
    const storedUsers = localStorage.getItem(this.USERS_KEY);
    if (storedUsers) {
      try {
        this.users = JSON.parse(storedUsers);
      } catch (error) {
        console.error('Error parsing users from storage:', error);
        this.users = [];
      }
    }
  }

  private saveUsers(): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(this.users));
  }

  register(user: User): { success: boolean; message: string } {
    // Charger les utilisateurs à jour
    this.loadUsers();
    
    if (this.users.find(u => u.email === user.email)) {
      return { success: false, message: 'Cet email est déjà utilisé.' };
    }
    this.users.push(user);
    this.saveUsers();
    return { success: true, message: 'Inscription réussie.' };
  }

  login(email: string, password: string): { success: boolean; message: string } {
    // Charger les utilisateurs à jour
    this.loadUsers();
    
    const user = this.users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      this.currentUser$.next(user);
      return { success: true, message: 'Connexion réussie.' };
    }
    return { success: false, message: 'Email ou mot de passe incorrect.' };
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUser$.next(null);
    this.router.navigate(['/login']);
  }

  private loadSession(): void {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      try {
        const user = JSON.parse(data);
        this.currentUser$.next(user);
      } catch (error) {
        console.error('Error parsing user session:', error);
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }

  updateUser(updatedUser: User): { success: boolean; message: string } {
    const currentUser = this.currentUser;
    if (!currentUser) {
      return { success: false, message: 'Aucun utilisateur connecté.' };
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    const emailExists = this.users.some(u => 
      u.email === updatedUser.email && u.email !== currentUser.email
    );
    
    if (emailExists) {
      return { success: false, message: 'Cet email est déjà utilisé.' };
    }

    // Mettre à jour l'utilisateur dans la liste
    const userIndex = this.users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
      this.users[userIndex] = updatedUser;
      this.saveUsers();
    }

    // Mettre à jour la session courante
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedUser));
    this.currentUser$.next(updatedUser);

    return { success: true, message: 'Profil mis à jour avec succès.' };
  }
}