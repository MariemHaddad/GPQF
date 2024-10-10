import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token: string | null = null;
  newPassword: string = '';
  message: string = '';
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token'); // Récupérer le token depuis l'URL
  }

  onSubmit() {
    console.log('Token:', this.token);
    console.log('New Password:', this.newPassword);
    if (this.token) {
      this.authService.resetPassword(this.token, this.newPassword).subscribe({
        next: (response) => {
          // Assurez-vous que response.message existe
          this.errorMessage = '';
         
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Une erreur s\'est produite'; // Utilisez la syntaxe de la vérification des nullités
          this.message = '';
          console.error(error);
        }
      });
    } else {
      this.errorMessage = 'Token manquant.';
    }
  }
}