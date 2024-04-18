import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { RouterModule, Router } from '@angular/router';
@Component({
  selector: 'app-forgetpassword',
  templateUrl: './forgetpassword.component.html',
  styleUrls: ['./forgetpassword.component.css']
})
export class ForgetpasswordComponent {
  email: string = '';
  message: string='';

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    this.authService.forgotPassword(this.email)
      .subscribe(response => {
        this.message = response; // Assurez-vous que response contient le message correct
        setTimeout(() => {
          this.router.navigate(['/login']); // Redirection vers la page de login après 2 secondes
        }, 2000);
      }, error => {
        console.error(error); // Gérer les erreurs
      });
  }
  
  }





