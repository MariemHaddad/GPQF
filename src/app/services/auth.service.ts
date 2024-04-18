import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import * as bcrypt from 'bcryptjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/user'; // URL de votre API

  constructor(private http: HttpClient,private router:Router) { }

 
  createAccount(data:FormGroup):Observable<any>{
    return this.http.post<any>("http://localhost:8080/api/user/registeruser",data);
  }

  
  authenticate(email: string, motDePasse: string): Observable<any> {
    return this.http.post<any>("http://localhost:8080/api/user/authenticate", { email, motDePasse });
  }
  private baseUrl = 'http://localhost:8080/api/user'; // Base URL de votre API


  forgotPassword(email: string): Observable<any> {
    return this.http.post("http://localhost:8080/api/user/forgot-password", { email });
  }
  getRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/roles`); // Assurez-vous que votre backend fournit une API pour récupérer les rôles
  }
}