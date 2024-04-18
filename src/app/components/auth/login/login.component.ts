import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as bcrypt from 'bcryptjs';
import { AuthService } from 'src/app/services/auth.service';
import { CryptoService } from 'src/app/services/crypto.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  
  email: string = '';
  motDePasse: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router, private http: HttpClient) { }
  login() {
    // Données à envoyer dans la requête POST
    const bodyData = {
      email: this.email,
      motDePasse: this.motDePasse
    };

    // Envoi de la requête POST pour l'authentification
    this.http.post("http://localhost:8080/api/user/authenticate", bodyData, { responseType: 'text' }).subscribe(
      (response: any) => {
        // Authentification réussie
        console.log(response); // Afficher la réponse dans la console

        if (response === 'Authentification réussie.') {
          this.router.navigate(['/home']);
        } else {
          this.errorMessage = response;
        }
      },
      error => {
        // Erreur d'authentification
        console.error(error); // Afficher l'erreur dans la console
        
        if (error.status === 401) {
          this.errorMessage = "Email ou mot de passe incorrect.";
        } else {
          this.errorMessage = "Une erreur s'est produite lors de l'authentification.";
        }
      }
    );
  }
}