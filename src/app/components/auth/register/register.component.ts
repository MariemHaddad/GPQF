import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/modules/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  nom: string ="";
  prenom: string ="";
  email: string ="";
  motDePasse: string ="";
  role: string ="";
  registrationForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
  
  }

  createAccount() {
    let bodyData = {
      "nom" : this.nom,
      "prenom" : this.prenom,
      "email" : this.email,
      "motDePasse" : this.motDePasse,
      "role" : this.role
    };
  
    this.http.post("http://localhost:8080/api/user/registeruser",bodyData,{responseType: 'text'}).subscribe((resultData: any)=>
    {
        console.log(resultData);
        alert("Employee Registered Successfully");
        // Optionally, redirect the user to another page after registration
      },
      error => {
        // Handle registration error here
        console.error('Registration error:', error);
        // Optionally, display an error message to the user
      }
    );
  }

}