import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, catchError, map, tap, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private jwtHelper: JwtHelperService = new JwtHelperService();
  private apiUrl = 'http://localhost:8080/api/authentication';
  private tokenKey: string = 'token';
  private loggedInUsername: string = '';
  constructor(private http: HttpClient, private router: Router) { }
  setLoggedInUsername(username: string) {
    this.loggedInUsername = username;
    console.log("Nom d'utilisateur stocké :", username);
  }
  getLoggedInUsername(): string {
    return this.loggedInUsername;
  }

 

  createaccount(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, data)
    
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

 
  authenticate(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/authenticate`, { email, password });
  }

  setToLocalStorage(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  getFromLocalStorage(key: string) {
    return localStorage.getItem(key);
  }

  isAuthenticated() {
    return !!this.getFromLocalStorage("token");
  }
  forgotPassword(email: string): Observable<any> {
    return this.http.post("http://localhost:8080/api/user/forgot-password", { email });
  }
  getPendingUsers(): Observable<any> {
    return this.http.get<any>('http://localhost:8080/api/authentication/pending-users');
  }

  approveAccount(userId: number): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
  const params = new HttpParams().set('idU', userId.toString()).set('status', 'APPROVED'); 
    return this.http.post<any>('http://localhost:8080/api/authentication/change-account-status', {}, { headers, params });
  }
}
  
  
      
