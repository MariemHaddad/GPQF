import { Component, OnInit } from '@angular/core';
import { Activite } from 'src/app/modules/activite';

import { ActiviteService } from 'src/app/services/activite.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  loggedInUsername: string = '';
  pendingUsers: any[] = [];
  activites: Activite[] = [];
  newActivite: Activite = new Activite(0, '');
  nouveauNom: string = '';
  allUsers: any[] = []; 
  constructor(private authService: AuthService, private activiteService: ActiviteService) {}

  ngOnInit(): void {
    this.loggedInUsername = this.authService.getLoggedInUsername();
    this.loadPendingUsers();
    this.loadActivites();
    this.loadAllUsers();
  }
  loadAllUsers(): void { // Nouvelle méthode pour charger tous les utilisateurs
    this.authService.getAllUsers().subscribe((data: any[]) => {
      this.allUsers = data;
    });
  }

  loadPendingUsers(): void {
    this.authService.getPendingUsers().subscribe((data: any[]) => {
      this.pendingUsers = data;
    });
  }
  loadActivites(): void {
    this.activiteService.getActivites().subscribe((data: Activite[]) => {
      this.activites = data;
    });
  }
  approveAccount(userId: number): void {
    this.authService.approveAccount(userId).subscribe(() => {
      // Mettre à jour la liste des utilisateurs en attente après approbation
      this.loadPendingUsers();
    }, error => {
      console.error('Error approving account', error);
    });
  }
  ajouterActivite(): void {
    this.activiteService.ajouterActivite(this.newActivite).subscribe(() => {
      this.loadActivites();
      this.resetNewActivite();
    }, error => {
      console.error('Error adding activite', error);
    });
  }
  modifierActivite(idA: number, nouveauNom: string): void {
    console.log('ID de l\'activité à modifier :', idA);
    console.log('Nouveau nom de l\'activité :', nouveauNom);

    // Appeler la méthode modifierActivite avec l'identifiant et le nouveau nom
    this.activiteService.modifierActivite(idA, nouveauNom).subscribe(() => {
        this.loadActivites();
    }, error => {
        console.error('Error updating activite', error);
    });
}
  supprimerActivite(idA: number): void {
    this.activiteService.supprimerActivite(idA).subscribe(() => {
      this.loadActivites();
    }, error => {
      console.error('Error deleting activite', error);
    });
  }

  resetNewActivite(): void {
    this.newActivite = new Activite(0, '');
  }
  ouvrirFormulaireModification(activite: Activite): void {
    const nouveauNom = prompt("Entrez le nouveau nom de l'activité:", activite.nomA);
    if (nouveauNom !== null) {
        // Appeler la méthode modifierActivite avec l'identifiant de l'activité et le nouveau nom
        this.modifierActivite(activite.idA, nouveauNom);
    }
}}