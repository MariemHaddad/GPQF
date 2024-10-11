import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup,  Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registrationForm!: FormGroup;
  message!:string;
  showModal: boolean = false;
  errorMessage: string = '';  
  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private router: Router

  ) { }
 
  ngOnInit(): void {
    this.registrationForm = this.formBuilder.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  createaccount() {
    if (this.registrationForm.valid) {
      this.auth.createaccount(this.registrationForm.value).subscribe({
        next: (data) => {
          this.registrationForm.reset();
          this.message = 'Account Created';
          this.showModal = true;  // Show the modal on success
          this.errorMessage = ''; // Clear error message
        },
        error: (err) => {
          console.log(err);
        }
      });
    } else {
      // Set error message if form is invalid
      this.errorMessage = 'Information invalide. Veuillez vérifier votre adresse mail ou mot de passe. Le mot de passe doit contenir au moins 6 caractères, dont au moins une lettre majuscule, une lettre minuscule et un chiffre.';
    }
  }
  redirectToLogin() {
    this.showModal = false;
    this.router.navigate(['/login']);
  }

}