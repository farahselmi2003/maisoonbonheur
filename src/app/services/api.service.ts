import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = (environment && environment.apiUrl) ? environment.apiUrl.replace(/\/$/, '') : 'http://localhost:8081/api';
  private authBaseUrl = (environment as any).authApiUrl ? (environment as any).authApiUrl.replace(/\/$/, '') : this.baseUrl;

  constructor(private http: HttpClient) {}

  private getUserFromStorage(): any {
    const userKey = (environment && environment.userKey) ? environment.userKey : 'mb_user_session';
    const raw = localStorage.getItem(userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private getTokenFromStorage(): string | null {
    const tokenKey = (environment && environment.tokenKey) ? environment.tokenKey : 'mb_token';
    return localStorage.getItem(tokenKey);
  }

  private buildHeaders(extra?: { [k: string]: string | number | boolean }): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const token = this.getTokenFromStorage();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    const user = this.getUserFromStorage();
    if (user && (user.id !== undefined && user.id !== null)) headers = headers.set('X-User-Id', String(user.id));
    if (extra) Object.keys(extra).forEach(k => { const v = extra[k]; if (v !== undefined && v !== null) headers = headers.set(k, String(v)); });
    return headers;
  }

  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== undefined && value !== null) httpParams = httpParams.set(key, String(value));
    });
    return httpParams;
  }

  private url(path: string): string {
    if (!path) return this.baseUrl;
    const isAuth = path.startsWith('/auth');
    const base = isAuth ? this.authBaseUrl : this.baseUrl;
    return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
  }

  get<T>(path: string, params?: any, extraHeaders?: { [k: string]: string | number | boolean }): Observable<T> {
    return this.http.get<T>(this.url(path), { headers: this.buildHeaders(extraHeaders), params: this.buildParams(params) });
  }

  post<T>(path: string, body?: any, params?: any, extraHeaders?: { [k: string]: string | number | boolean }): Observable<T> {
    return this.http.post<T>(this.url(path), body, { headers: this.buildHeaders(extraHeaders), params: this.buildParams(params) });
  }

  put<T>(path: string, body?: any, params?: any, extraHeaders?: { [k: string]: string | number | boolean }): Observable<T> {
    return this.http.put<T>(this.url(path), body, { headers: this.buildHeaders(extraHeaders), params: this.buildParams(params) });
  }

  patch<T>(path: string, body?: any, params?: any, extraHeaders?: { [k: string]: string | number | boolean }): Observable<T> {
    return this.http.patch<T>(this.url(path), body, { headers: this.buildHeaders(extraHeaders), params: this.buildParams(params) });
  }

  delete<T>(path: string, params?: any, extraHeaders?: { [k: string]: string | number | boolean }): Observable<T> {
    return this.http.delete<T>(this.url(path), { headers: this.buildHeaders(extraHeaders), params: this.buildParams(params) });
  }
}
