import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Activite } from 'src/app/modules/activite';
import { ActiviteService } from 'src/app/services/activite.service';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  loggedInUsername: string = '';
  activites: Activite[] = [];
   // Variable pour stocker le rôle de l'utilisateur
  // Déclarez authService comme public pour qu'il soit accessible depuis le modèle HTML
  constructor(public authService: AuthService, private router: Router, private http: HttpClient,private activiteService: ActiviteService) {}

  ngOnInit(): void {
    this.loggedInUsername = this.authService.getLoggedInUsername();
    this.loadActivites();   
    
  }
  loadActivites(): void {
    this.activiteService.getActivites().subscribe((data: Activite[]) => {
      this.activites = data;
    });
  }

} 


