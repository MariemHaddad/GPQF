import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';


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

 
  refreshToken(): Observable<any> {
    const refreshToken = this.getFromLocalStorage('refreshToken');
    return this.http.post<any>(`${this.apiUrl}/refresh-token`, { refreshToken }).pipe(
        map((response: any) => response.token)
    );
  }

  
  authenticate(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/authenticate`, { email, password });
  }

  // La méthode refreshToken reste la même

  setToLocalStorage(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  getFromLocalStorage(key: string): string | null {
    return localStorage.getItem(key);
  }

  isAuthenticated(): boolean {
    const token = this.getFromLocalStorage(this.tokenKey);
    // Vérifie si le token existe
    return token !== null;
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
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
  hasRole(role: string): boolean {
    const token = this.getFromLocalStorage(this.tokenKey);
    if (!token) {
      return false;
    }

    const decodedToken = this.jwtHelper.decodeToken(token);
    const roles = decodedToken.roles || []; // Assuming roles are stored under 'roles' in the token

    return roles.includes(role);
  }

  private handleError(error: HttpErrorResponse) {
    // Customize the error handling logic here as needed
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}
  
  
      
