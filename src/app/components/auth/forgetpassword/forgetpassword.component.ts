import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgetpassword',
  templateUrl: './forgetpassword.component.html',
  styleUrls: ['./forgetpassword.component.css']
})
export class ForgetpasswordComponent {
  email: string = '';
  message: string = '';
  errorMessage: string = ''; // New property to store error messages

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    this.authService.forgotPassword(this.email)
      .subscribe({
        next: (response) => {
           // Message à afficher
          this.errorMessage = '';
          // Pour afficher le modal, utilisez un délai ou d'autres méthodes selon le besoin
        },
        error: (error) => {
          this.errorMessage = error.error || 'Une erreur s\'est produite'; // Utilise error.error
          this.message = '';
          console.error(error);
        }
      });
  }
}
