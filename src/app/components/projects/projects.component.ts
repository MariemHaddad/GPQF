import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiviteService } from 'src/app/services/activite.service';
import { ProjetService } from 'src/app/services/projet.service';
import { Projet } from 'src/app/modules/projet';  
import { Activite } from 'src/app/modules/activite';
import { User } from 'src/app/modules/user';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  showAddProjectForm: boolean = false;
  hovered: boolean = false;
  activiteId: number = 0;
  projets: Projet[] = [];
  nouveauProjet: Projet = new Projet(); // Assurez-vous que cette initialisation est complète
  responsableQualiteNom: string = '';
  nomC: string = '';
  chefDeProjetNom: string = '';
  isDirecteur: boolean = false;
  activites: Activite[] = [];
  chefsDeProjet: User[] = [];
  responsablesQualite: User[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router, // Ajoutez Router au constructeur
    private projetService: ProjetService,
    private activiteService: ActiviteService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.activiteId = +id;
      this.loadProjets();
      this.loadChefsDeProjet();
      this.loadResponsablesQualite();

      // Ici, vous pouvez vérifier le rôle de l'utilisateur
      // et définir la variable isDirecteur en conséquence
      // Exemple simple pour illustration :
      const roleUtilisateur = localStorage.getItem('role'); // Ou toute autre méthode pour obtenir le rôle de l'utilisateur
      this.isDirecteur = roleUtilisateur === 'DIRECTEUR';
    }
  }

  loadChefsDeProjet(): void {
    this.projetService.getChefsDeProjet().subscribe((data: User[]) => {
      this.chefsDeProjet = data;
    });
  }

  loadResponsablesQualite(): void {
    this.projetService.getResponsablesQualite().subscribe((data: User[]) => {
      this.responsablesQualite = data;
    });
  }

  loadProjets(): void {
    this.projetService.getProjetsByActivite(this.activiteId).subscribe((data: Projet[]) => {
      this.projets = data;
    });
  }

  ajouterProjet(): void {
    // Vérifiez si les champs requis sont définis
    if (!this.responsableQualiteNom || !this.nomC) {
      console.error("Les champs Responsable Qualité et Nom du client sont obligatoires.");
      return;
    }

    // Vérifiez également pour chefDeProjetNom si l'utilisateur est directeur
    if (this.isDirecteur && !this.chefDeProjetNom) {
      console.error("Le champ Chef de Projet est obligatoire pour les directeurs.");
      return;
    }

    // Créez un nouvel objet Projet avec toutes les propriétés requises
    let nouveauProjet: Projet = {
      nomP: this.nouveauProjet.nomP,
      idP: 0, // Vous devez définir une valeur pour idP ici, car TypeScript l'attend
      descriptionP: this.nouveauProjet.descriptionP,
      datedebutP: this.nouveauProjet.datedebutP,
      datefinP: this.nouveauProjet.datefinP,
      methodologie: this.nouveauProjet.methodologie,
      objectifs: this.nouveauProjet.objectifs,
      typeprojet: this.nouveauProjet.typeprojet,
      responsableQualiteNom: this.responsableQualiteNom,
      chefDeProjetNom: this.chefDeProjetNom
    };

    // Appelez le service pour ajouter le projet
    this.projetService.ajouterProjet(nouveauProjet, this.activiteId, this.responsableQualiteNom, this.nomC, this.chefDeProjetNom).subscribe(
      response => {
        console.log(response);
        this.loadProjets(); // Rechargez la liste des projets après l'ajout
      },
      error => {
        console.error("Erreur lors de l'ajout du projet :", error);
      }
    );
  }
  loadActivites(): void {
    this.activiteService.getActivites().subscribe((data: Activite[]) => {
      this.activites = data;
    });
  }
  viewPhases(projetId: number): void {
    this.router.navigate([`/projects/${projetId}/phases`]);
  }
}