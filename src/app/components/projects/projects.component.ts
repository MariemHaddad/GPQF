import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiviteService } from 'src/app/services/activite.service';
import { ProjetService } from 'src/app/services/projet.service';
import { Projet } from 'src/app/modules/projet';  
import { Activite } from 'src/app/modules/activite';
import { User } from 'src/app/modules/user';
import { Chart } from 'chart.js'; 
import { TauxNCData } from 'src/app/modules/taux-nc-data.model';
import { TauxNCSemestrielResponse } from 'src/app/modules/taux-nc-semestriel-response.model';
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
  private chartNC: Chart | undefined; 
  private chartNCS: Chart | undefined; 
  tauxNCSemestriels: TauxNCSemestrielResponse[] = [];
  
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
        this.loadTauxNCData(); 
        this.loadTauxNCSemestriels(); // Chargez les données pour le graphique ici

        const roleUtilisateur = localStorage.getItem('role');
        this.isDirecteur = roleUtilisateur === 'DIRECTEUR';
    }
}
loadTauxNCSemestriels(): void {
  const activiteId = this.activiteId; // Utilisez l'ID d'activité existant
  this.projetService.getTauxNCSemestriels(activiteId).subscribe((data: TauxNCSemestrielResponse[]) => {
    this.tauxNCSemestriels = data; // Stockez les données semestrielles
    this.createSemestrialChart(); // Créez le graphique après avoir chargé les données
  });
}  createSemestrialChart(): void {
  const semestres = this.tauxNCSemestriels.map((item) => item.semestre);
  const tauxNCInterne = this.tauxNCSemestriels.map((item) => item.tauxNCInterne);
  const tauxNCExterne = this.tauxNCSemestriels.map((item) => item.tauxNCExterne);

  // Détruire le graphique précédent s'il existe
  if (this.chartNCS) {
      this.chartNCS.destroy();
  }

  // Créer le graphique avec Chart.js
  this.chartNCS = new Chart('chartNCS', {
      type: 'line', // Type de graphique
      data: {
          labels: semestres,
          datasets: [
              {
                  label: 'Taux NC Interne',
                  data: tauxNCInterne,
                  borderColor: 'rgba(75, 192, 192, 1)',
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  fill: true,
              },
              {
                  label: 'Taux NC Externe',
                  data: tauxNCExterne,
                  borderColor: 'rgba(255, 99, 132, 1)',
                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                  fill: true,
              },
          ],
      },
      options: {
          responsive: true,
          scales: {
              y: {
                  beginAtZero: true,
              },
          },
      },
  });
}

loadTauxNCData(): void {
    this.projetService.getTauxNCData(this.activiteId).subscribe((data: TauxNCData[]) => {
        this.createNCCharts(data); // Créez le graphique après avoir chargé les données
    });
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
  createNCCharts(tauxNCData: TauxNCData[]): void {
    // Assurez-vous que les données existent
    if (!tauxNCData || tauxNCData.length === 0) {
        console.error('No data available for charts');
        return;
    }

    // Extraire les taux
    const projets = tauxNCData.map(data => data.projetNom); // Noms des projets
    const tauxNCInterne = tauxNCData.map(data => data.tauxNCInterne); // Taux NC internes
    const tauxNCExterne = tauxNCData.map(data => data.tauxNCExterne); // Taux NC externes

    // Détruire le graphique précédent s'il existe
    if (this.chartNC) {
        this.chartNC.destroy();
    }

    // Créer le graphique avec Chart.js
    this.chartNC = new Chart('chartNC', {
        type: 'line', // Type de graphique
        data: {
            labels: projets, // Noms des projets en tant que labels sur l'axe des x
            datasets: [
                {
                    label: 'Taux NC Internes',
                    data: tauxNCInterne,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: false // Ne pas remplir sous la courbe
                },
                {
                    label: 'Taux NC Externes',
                    data: tauxNCExterne,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    fill: false // Ne pas remplir sous la courbe
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true, // Commencer l'axe Y à 0
                    title: {
                        display: true,
                        text: 'Taux de Non-Conformités (%)' // Titre de l'axe Y
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Projets' // Titre de l'axe X
                    }
                }
            },
            plugins: {
                legend: {
                    display: true, // Afficher la légende
                    position: 'top', // Position de la légende
                },
                tooltip: {
                    mode: 'index', // Affiche le tooltip pour plusieurs courbes
                }
            }
        }
    });
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