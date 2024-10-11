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
  constructor(private http: HttpClient, private router: Router,) { }
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
    return this.http.post<any>(`${this.apiUrl}/authenticate`, { email, password }).pipe(
      tap(response => {
        if (response && response.token) {
          this.setToLocalStorage(this.tokenKey, response.token);
          console.log('Jeton stocké:', response.token); // Vérifiez que le jeton est stocké correctement
        }
      })
    );
  }

  // La méthode refreshToken reste la même

  setToLocalStorage(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  getFromLocalStorage(key: string): string | null {
    const value = localStorage.getItem(key);
    console.log(`Valeur stockée pour ${key}:`, value); // Vérifiez que la valeur est correcte
    return value;
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
  blockUser(idU: number): Observable<void> {
    return this.http.put<void>(`http://localhost:8080/api/user/block/${idU}`, {});
  }
  updateUser(id: number, updatedUser: any): Observable<any> {
    return this.http.put<any>(`http://localhost:8080/api/user/update/${id}`, updatedUser);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post("http://localhost:8080/api/user/forgot-password", { email }, { responseType: 'text' });
}
getAllUsers(): Observable<any[]> { // Nouvelle méthode pour récupérer tous les utilisateurs
  return this.http.get<any[]>(`http://localhost:8080/api/user/all-users`);
}
  getPendingUsers(): Observable<any> {
    return this.http.get<any>('http://localhost:8080/api/authentication/pending-users');
  }
  resetPassword(token: string, newPassword: string): Observable<any> {
    const headers = new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assurez-vous que ce token est correct
        'Content-Type': 'application/json'
    });

    return this.http.post(`http://localhost:8080/api/user/reset-password`, { token, newPassword }, { headers, responseType: 'text'  });
}
  
approveAccount(userId: number): Observable<any> {
  const headers = new HttpHeaders().set('Content-Type', 'application/json');


  const params = new HttpParams()
  .set('idU', userId.toString())
  .set('status', 'APPROVED');

return this.http.post<any>('http://localhost:8080/api/authentication/change-account-status', {}, { headers, params });}
  hasRole(role: string): boolean {
    const token = this.getFromLocalStorage(this.tokenKey);
    if (!token) {
      console.log('Token non trouvé');
      return false;
    }
  
    try {
      const decodedToken = this.jwtHelper.decodeToken(token);
      console.log('Jeton décodé:', decodedToken); // Vérifiez le contenu du jeton
      const userRole = decodedToken.role; // Utilisez 'role' au lieu de 'roles'
      console.log('Rôle utilisateur:', userRole); // Affichez le rôle utilisateur
      // Comparez le rôle utilisateur avec le rôle recherché en ajoutant le préfixe 'ROLE_'
      return userRole === `ROLE_${role}`;
    } catch (error) {
      console.error('Erreur lors du décodage du jeton:', error);
      return false;
    }
  }
}
  
  
      
