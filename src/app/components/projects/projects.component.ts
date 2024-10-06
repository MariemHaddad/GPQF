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
import { SatisfactionDataDTO } from 'src/app/modules/satisfaction-data.model';
import { DDEDataDTO } from 'src/app/modules/dde-data-dto';
import { NombreDeRunSemestrielResponse } from 'src/app/modules/nombre-de-run-semestriel-response.model';
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
  private chartDDE: Chart | undefined; 
  tauxNCSemestriels: TauxNCSemestrielResponse[] = [];
  private chartSatisfaction: Chart | undefined; 
  private chartNombreRun: Chart | undefined; // Déclaration pour le graphique du Nombre de Run
  nombreDeRunSemestriels: NombreDeRunSemestrielResponse[] = [];
  showEditModal: boolean = false;
projetSelectionne: Projet = new Projet();
showDeleteModal: boolean = false;
projetASupprimer: Projet = new Projet();
showPopup: boolean = false; 
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
        this.loadTauxNCSemestriels(); 
        this.loadSatisfactionData(); // Chargez les données pour le graphique ici
        this.loadDDEData();
        this.loadNombreDeRunSemestriel();
        const roleUtilisateur = localStorage.getItem('role');
        this.isDirecteur = roleUtilisateur === 'DIRECTEUR';
    }
}
ouvrirModalModification(projet: Projet): void {
  this.projetSelectionne = { ...projet }; // Clonez l'objet pour ne pas modifier directement
  this.showEditModal = true;
  this.showDeleteModal = false; // Ferme le modal de suppression s'il était ouvert
}

confirmerSuppression(projet: Projet): void {
  this.projetASupprimer = projet;
  this.showDeleteModal = true;
  this.showEditModal = false; // Ferme le modal de modification s'il était ouvert
}

fermerModalSuppression(): void {
  this.showDeleteModal = false;
}

fermerModal(): void {
  this.showEditModal = false;
}
modifierProjet(): void {
  console.log('Modification en cours pour le projet:', this.projetSelectionne);
  this.projetService.modifierProjet(this.projetSelectionne.idP, this.projetSelectionne)
    .subscribe({
      next: (response) => {
        console.log('Réponse de la modification:', response);
        alert('Projet modifié avec succès');
        this.showEditModal = false;
        this.loadProjets(); // Recharger les projets après modification
      },
      error: (error)=> {console.error('Erreur lors de la modification du projet:', error);}
    });
}

supprimerProjet(): void {
  console.log('Suppression en cours pour le projet ID:', this.projetASupprimer.idP);
  this.projetService.supprimerProjet(this.projetASupprimer.idP)
    .subscribe({
      next: (response) => {
        console.log('Réponse de la suppression:', response);
        alert('Projet supprimé avec succès');
        this.showDeleteModal = false;
        this.loadProjets(); // Recharger les projets après suppression
      },
      error: (error) => {
        console.error('Erreur lors de la suppression du projet:', error);
      
      }
    });
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
  loadSatisfactionData(): void {
    this.projetService.getSatisfactionData(this.activiteId).subscribe((data: SatisfactionDataDTO[]) => {
      this.createSatisfactionChart(data); // Créez le graphique après avoir chargé les données
    });
  }
createSatisfactionChart(satisfactionData: SatisfactionDataDTO[]): void {
  // Extraire les semestres et les valeurs SI1 et SI2
  const semestres = satisfactionData.map(data => data.semester);
  const si1Values = satisfactionData.map(data => data.si1Value);
  const si2Values = satisfactionData.map(data => data.si2Value);

  // Détruire le graphique précédent s'il existe
  if (this.chartSatisfaction) {
    this.chartSatisfaction.destroy();
  }

  // Créer le graphique avec Chart.js
  this.chartSatisfaction = new Chart('chartSatisfaction', {
    type: 'line', // Type de graphique
    data: {
      labels: semestres,
      datasets: [
        {
          label: 'Valeur SI1',
          data: si1Values,
          borderColor: 'rgba(255, 165, 0, 1)', // Orange
          backgroundColor: 'rgba(255, 165, 0, 0.2)', // Orange
          fill: true,
        },
        {
          label: 'Valeur SI2',
          data: si2Values,
          borderColor: 'rgba(0, 128, 0, 1)', // Vert
          backgroundColor: 'rgba(0, 128, 0, 0.2)', // Vert
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Valeurs SI1 / SI2',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Semestres',
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        tooltip: {
          mode: 'index',
        },
      },
    },
  });
}
loadDDEData(): void {
  this.projetService.getDDESemestriels(this.activiteId).subscribe((data: DDEDataDTO) => {
    this.createDDEChart(data);
  }, error => {
    console.error('Error loading DDE data', error);
  });
}

createDDEChart(ddeData: DDEDataDTO): void {
  if (!ddeData || typeof ddeData !== 'object') {
    console.error('Invalid DDE Data:', ddeData);
    return;
  }

  const keys = Object.keys(ddeData); // Assurez-vous que ddeData est un objet avec des clés
  const values = Object.values(ddeData); // Récupère les valeurs correspondantes

  if (this.chartDDE) {
    this.chartDDE.destroy();
  }

  this.chartDDE = new Chart('chartDDE', {
    type: 'bar', // ou 'line' selon vos besoins
    data: {
      labels: keys,
      datasets: [{
        label: 'Données DDE',
        data: values,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
loadNombreDeRunSemestriel(): void {
  this.projetService.getNombreDeRunParSemestre(this.activiteId).subscribe((data: NombreDeRunSemestrielResponse[]) => {
    this.nombreDeRunSemestriels = data;
    console.log('Données chargées :', this.nombreDeRunSemestriels);
    this.createNombreDeRunChart(); // Créer le graphique une fois les données chargées
  });
}

// Méthode pour créer le graphique Nombre de Run
createNombreDeRunChart(): void {
  const semestres = this.nombreDeRunSemestriels.map(item => item.semestre);
  const nombreDeRuns = this.nombreDeRunSemestriels.map(item => item.totalRuns);

  // Détruire le graphique précédent s'il existe
  if (this.chartNombreRun) {
    this.chartNombreRun.destroy();
  }

  // Créer le graphique avec Chart.js
  this.chartNombreRun = new Chart('chartNombreRun', {
    type: 'line',
    data: {
      labels: semestres,
      datasets: [
        {
          label: 'Nombre de Run',
          data: nombreDeRuns,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: true,
        }
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

}