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
  isModalOpen = false;
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
projetASupprimer: Projet | undefined;
showPopup: boolean = false; 
private chartTaux8D: Chart | undefined; 
taux8DSemestriels: { [key: string]: number[] } = {};
tauxConformiteSemestriels: { semestre: string, taux: number }[] = []; // Pour stocker les taux par semestre
private chartTauxConformite: Chart | undefined; 
tauxLiberationData: { projet: string, taux: number }[] = [];
courbeAffichee: string = '';
private chartTauxLiberation: Chart | undefined;
selectedDashboard: string = 'nc'; 
  objectives = {
    semestrielle: '',
    satisfaction: '',
    liberation: '',
    dde: '',
    hardware: '',
    taux8D: '',
    efficaciteLiberation: '',
    instantane: ''
  };

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
        this.loadTaux8DSemestriels();
        this.loadTauxConformiteSemestriels();
        this.loadTauxLiberation();
        const roleUtilisateur = localStorage.getItem('role');
        this.isDirecteur = roleUtilisateur === 'DIRECTEUR';
    }
    this.loadObjectivesFromLocalStorage();
  }



  // Method to update objectives
  updateObjective(dashboard: string, objective: string): void {
    // Check the dashboard string carefully for consistency
    switch (dashboard) {
      case 'Semestrielle':
        this.objectives.semestrielle = objective;
        break;
      case 'Satisfaction':
        this.objectives.satisfaction = objective;
        break;
      case 'libération':
        this.objectives.liberation = objective;
        break;
      case '8D':
        this.objectives.taux8D = objective;
        break;
      case 'dde':
        this.objectives.dde = objective;
        break;
      case 'hardware':
        this.objectives.hardware = objective;
        break;
      case 'Efficacitélibération':
        this.objectives.efficaciteLiberation = objective;
        break;
      case 'Instantané':
        this.objectives.instantane = objective;
        break;
    }
    this.saveObjectivesToLocalStorage(); // Save updated objectives
  }

  // Save objectives to localStorage
  saveObjectivesToLocalStorage(): void {
    localStorage.setItem('dashboardObjectives', JSON.stringify(this.objectives));
  }

  // Load objectives from localStorage
  loadObjectivesFromLocalStorage(): void {
    const savedObjectives = localStorage.getItem('dashboardObjectives');
    if (savedObjectives) {
      this.objectives = JSON.parse(savedObjectives);
    }
  }

  // Example of a method to change the dashboard
  selectDashboard(dashboard: string): void {
    this.selectedDashboard = dashboard;
    switch (dashboard) {
      case 'hardware':
        this.loadNombreDeRunSemestriel();
        break;
      case 'dde':
        this.loadDDEData();
        break;
      case 'satisfaction':
        this.loadSatisfactionData();
        break;
      case 'libération':
        this.loadTauxLiberation();
        break;
      case '8D':
        this.loadTaux8DSemestriels();
        break;
      case 'Instantané':
        this.loadTauxNCData();
        break;
      case 'Semestrielle':
        this.loadTauxNCSemestriels();
        break;
      case 'Efficacitélibération':
        this.loadTauxConformiteSemestriels();
        break;
    }
  }
openModal() {
  this.isModalOpen = true;
}
loadTauxLiberation(): void { 
  this.projetService.getTauxLiberation(this.activiteId).subscribe((data: { projet: string, taux: number }[]) => {
      console.log('Réponse de l\'API:', data); // Vérifiez la structure ici
      this.tauxLiberationData = data; // Utilisez directement les données retournées
      console.log('tauxLiberationData:', this.tauxLiberationData); // Vérifiez la nouvelle structure
      this.createTauxLiberationChart(); // Créez le graphique après avoir chargé les données
  }, error => {
      console.error('Erreur lors du chargement des taux de libération:', error);
  });
}
createTauxLiberationChart(): void {
  // Vérifiez que tauxLiberationData est un tableau
  if (!Array.isArray(this.tauxLiberationData)) {
    console.error('Erreur: tauxLiberationData n\'est pas un tableau', this.tauxLiberationData);
    return;
  }

  // Détruire le graphique précédent s'il existe
  if (this.chartTauxLiberation) {
    this.chartTauxLiberation.destroy();
  }

  // Trier les données par semestre (ou par projet si nécessaire)
  this.tauxLiberationData.sort((a, b) => {
    // Supposons que le semestre est sous la forme "S1-2024" ou "S2-2025"
    const semestreA = a.projet;
    const semestreB = b.projet;

    const [partA, yearA] = semestreA.split('-');
    const [partB, yearB] = semestreB.split('-');

    // Convertir le semestre en nombre pour le tri
    const numericSemesterA = parseInt(partA.replace('S', ''), 10);
    const numericSemesterB = parseInt(partB.replace('S', ''), 10);

    // Comparer d'abord l'année, puis le semestre
    if (yearA !== yearB) {
      return yearA.localeCompare(yearB);
    }
    return numericSemesterA - numericSemesterB;
  });

  // Obtenir les labels et les taux à partir des données triées
  const labels = this.tauxLiberationData.map(item => item.projet);
  const taux = this.tauxLiberationData.map(item => item.taux);

  // Créer le graphique avec Chart.js
  this.chartTauxLiberation = new Chart('chartTauxLiberation', {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Taux de libération (%)',
        data: taux,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Taux de Libération (%)',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Projet',
          },
        },
      },
    },
  });
}
loadTauxConformiteSemestriels(): void {
  this.projetService.getTauxCBySemestre(this.activiteId).subscribe((data: { [key: string]: number[] }) => {
    const semestres: string[] = [];
    const tauxConformite: number[] = [];

    // Parcourez les entrées de l'objet et construisez les tableaux
    for (const [semestre, taux] of Object.entries(data)) {
      semestres.push(semestre);
      tauxConformite.push(...taux); // Récupérez les valeurs du tableau
    }

    // Modifiez la structure pour correspondre à la définition attendue
    this.tauxConformiteSemestriels = semestres.map((semestre, index) => ({
      semestre,
      taux: tauxConformite[index], // Utilisez le taux correspondant
    }));

    // Ajoutez le console.log ici
    console.log('Taux de conformité semestriels avant tri:', this.tauxConformiteSemestriels);

    this.createTauxConformiteChart(); // Créez le graphique après avoir chargé les données
  });
}

createTauxConformiteChart(): void {
  // Trier les semestres par ordre croissant
  this.tauxConformiteSemestriels.sort((a, b) => {
    // On suppose que le format des semestres est "S1-AAAA" ou "S2-AAAA"
    const [sA, anA] = a.semestre.split('-');
    const [sB, anB] = b.semestre.split('-');

    const anComparison = Number(anA) - Number(anB);
    if (anComparison !== 0) {
      return anComparison; // Compare les années d'abord
    }

    // Comparer les semestres, en considérant S1 avant S2
    return Number(sA[1]) - Number(sB[1]);
  });

  // Obtenir les semestres et les taux triés
  const semestres = this.tauxConformiteSemestriels.map((item) => item.semestre);
  const tauxConformite = this.tauxConformiteSemestriels.map((item) => item.taux);

  // Détruire le graphique précédent s'il existe
  if (this.chartTauxConformite) {
    this.chartTauxConformite.destroy();
  }

  // Créer le graphique avec Chart.js
  this.chartTauxConformite = new Chart('chartTauxConformite', {
    type: 'line', // Type de graphique
    data: {
      labels: semestres,
      datasets: [
        {
          label: 'Taux de conformité',
          data: tauxConformite,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
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
            text: 'Taux de Conformité (%)',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Semestres',
          },
        },
      },
    },
  });
}
loadTaux8DSemestriels(): void {
  this.projetService.getTauxRealisation8DSemestriel(this.activiteId).subscribe((data: { [key: string]: number[] }) => {
    this.taux8DSemestriels = data;
    this.createTaux8DSemestrielChart();
  });
}
createTaux8DSemestrielChart(): void {
  const semestres = Object.keys(this.taux8DSemestriels);
  
  // Convertir les semestres au format [année, semestre] pour le tri
  const semestresTriees = semestres.map(semestre => {
    const [s1s2, annee] = semestre.split('-'); // Utiliser '-' pour séparer S1/S2 et année
    const order = `${annee}-${s1s2 === 'S1' ? '01' : '02'}`; // format pour tri
    return { label: semestre, order };
  }).sort((a, b) => a.order.localeCompare(b.order)); // trier par année et semestre dans l'ordre croissant

  // Vérification des semestres triés
  console.log("Semestres triés :", semestresTriees);
  
  // Extraire les labels et calculer les taux
  const labels = semestresTriees.map(item => item.label);
  const taux8D = semestresTriees.map(item => {
    const total = this.taux8DSemestriels[item.label].reduce((a, b) => a + b, 0);
    const count = this.taux8DSemestriels[item.label].length;
    return total / (count || 1); // Éviter la division par zéro
  });

  // Détruire le graphique précédent s'il existe
  if (this.chartTaux8D) {
    this.chartTaux8D.destroy();
  }

  // Créer le graphique avec Chart.js
  this.chartTaux8D = new Chart('chartTaux8D', {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Taux de réalisation des 8D',
          data: taux8D,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
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
loadTauxNCSemestriels(): void {
  const activiteId = this.activiteId; // Utilisez l'ID d'activité existant
  this.projetService.getTauxNCSemestriels(activiteId).subscribe((data: TauxNCSemestrielResponse[]) => {
    this.tauxNCSemestriels = data; // Stockez les données semestrielles
    this.createSemestrialChart(); // Créez le graphique après avoir chargé les données
  });
}  createSemestrialChart(): void {
  // Obtenir les semestres et les taux
  const semestres = this.tauxNCSemestriels.map((item) => item.semestre);
  const tauxNCInterne = this.tauxNCSemestriels.map((item) => item.tauxNCInterne);
  const tauxNCExterne = this.tauxNCSemestriels.map((item) => item.tauxNCExterne);

  // Créer un tableau d'objets pour le tri
  const semestresTriees = semestres.map((semestre, index) => ({
      semestre,
      tauxNCInterne: tauxNCInterne[index],
      tauxNCExterne: tauxNCExterne[index]
  })).sort((a, b) => {
      const [y1, s1] = a.semestre.split('-'); // Sépare par '-' (année, semestre)
      const [y2, s2] = b.semestre.split('-'); // Sépare par '-' (année, semestre)

      // Comparaison des années
      const yearComparison = parseInt(y1) - parseInt(y2);
      if (yearComparison !== 0) return yearComparison; // Retourne la différence si les années sont différentes

      // Comparaison des semestres
      const semestre1 = parseInt(s1.replace('S', '')); // Convertir S1/S2 en nombre
      const semestre2 = parseInt(s2.replace('S', ''));
      return semestre1 - semestre2; // Trier par semestre
  });

  // Debug: Vérifier l'ordre des semestres après tri
  console.log('Semestres triés:', semestresTriees);

  // Extraire les données triées
  const labels = semestresTriees.map(item => item.semestre);
  const tauxNCInterneTrie = semestresTriees.map(item => item.tauxNCInterne);
  const tauxNCExterneTrie = semestresTriees.map(item => item.tauxNCExterne);

  // Détruire le graphique précédent s'il existe
  if (this.chartNCS) {
      this.chartNCS.destroy();
  }

  // Créer le graphique avec Chart.js
  this.chartNCS = new Chart('chartNCS', {
      type: 'line', // Type de graphique
      data: {
          labels: labels,
          datasets: [
              {
                  label: 'Taux NC Interne',
                  data: tauxNCInterneTrie,
                  borderColor: 'rgba(75, 192, 192, 1)',
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  fill: true,
              },
              {
                  label: 'Taux NC Externe',
                  data: tauxNCExterneTrie,
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
 
  loadSatisfactionData(): void {
    this.projetService.getSatisfactionData(this.activiteId).subscribe((data: SatisfactionDataDTO[]) => {
      this.createSatisfactionChart(data); // Créez le graphique après avoir chargé les données
    });
  }
  createSatisfactionChart(satisfactionData: SatisfactionDataDTO[]): void {
    // Vérifiez que satisfactionData est un tableau valide
    if (!Array.isArray(satisfactionData)) {
        console.error('Erreur: satisfactionData n\'est pas un tableau', satisfactionData);
        return;
    }

    // Trier les semestres avant de les utiliser
    satisfactionData.sort((a, b) => {
        const [s1, y1] = a.semester.split('-'); // Sépare par '-'
        const [s2, y2] = b.semester.split('-'); // Sépare par '-'
        
        // Comparaison des années
        const yearComparison = parseInt(y1) - parseInt(y2);
        if (yearComparison !== 0) return yearComparison; // Retourne la différence si les années sont différentes

        // Comparaison des semestres
        return parseInt(s1.replace('S', '')) - parseInt(s2.replace('S', ''));
    });

    // Extraire les semestres et les valeurs
    const semestres = satisfactionData.map(data => data.semester);
    const si1Values = satisfactionData.map(data => data.si1Value);
    const si2Values = satisfactionData.map(data => data.si2Value);

    // Détruire le graphique précédent s'il existe
    if (this.chartSatisfaction) {
        this.chartSatisfaction.destroy();
    }

    // Créer le graphique avec Chart.js
    this.chartSatisfaction = new Chart('chartSatisfaction', {
        type: 'line',
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

  // Extraire les clés et les valeurs
  const keys = Object.keys(ddeData);
  const values = Object.values(ddeData);

  // Associer les clés et les valeurs pour pouvoir les trier ensemble
  const sortedData = keys.map((key, index) => ({
    key,
    value: values[index],
  }));

  // Trier les données en fonction des clés (supposons qu'elles représentent des semestres)
  sortedData.sort((a, b) => {
    const [s1, y1] = a.key.split('-');
    const [s2, y2] = b.key.split('-');

    const yearComparison = parseInt(y1) - parseInt(y2);
    return yearComparison !== 0 ? yearComparison : (parseInt(s1.replace('S', '')) - parseInt(s2.replace('S', '')));
  });

  // Extraire les clés et valeurs triées
  const sortedKeys = sortedData.map(item => item.key);
  const sortedValues = sortedData.map(item => item.value);

  // Détruire le graphique précédent s'il existe
  if (this.chartDDE) {
    this.chartDDE.destroy();
  }

  // Créer le graphique avec Chart.js
  this.chartDDE = new Chart('chartDDE', {
    type: 'bar', // ou 'line' selon vos besoins
    data: {
      labels: sortedKeys,
      datasets: [{
        label: 'Données DDE',
        data: sortedValues,
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
  // Trier les semestres par ordre croissant
  this.nombreDeRunSemestriels.sort((a, b) => {
    // Extraire le semestre et l'année
    const [s1, y1] = a.semestre.split('-');
    const [s2, y2] = b.semestre.split('-');

    // Convertir les semestres en nombres
    const semestre1 = parseInt(s1.replace('S', '')); // 1 pour S1 et 2 pour S2
    const semestre2 = parseInt(s2.replace('S', ''));

    // Comparer d'abord par année
    const yearComparison = parseInt(y1) - parseInt(y2);
    
    // Si les années sont identiques, comparer les semestres
    return yearComparison !== 0 
      ? yearComparison 
      : semestre1 - semestre2; // Comparaison sur le semestre
  });

  // Obtenir les semestres et le nombre de runs à partir des données triées
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
    idP: 0, // L'ID du projet sera généré par le backend
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
      this.showAddProjectForm = false; // Fermer le formulaire après l'ajout réussi
      this.resetForm(); // Réinitialiser le formulaire après l'ajout
    },
    error => {
      console.error("Erreur lors de l'ajout du projet :", error);
    }
  );
}resetForm(): void {
  this.nouveauProjet = {
    idP: 0, // Réinitialiser à 0 ou à une valeur par défaut
    nomP: '',
    descriptionP: '',
    datedebutP: '',
    datefinP: '',
    methodologie: '',
    objectifs: '',
    typeprojet: '',
    responsableQualiteNom: '', // Ajoutez cette propriété ici
    chefDeProjetNom: ''        // Ajoutez cette propriété ici
  };
  this.responsableQualiteNom = '';
  this.nomC = '';
  this.chefDeProjetNom = ''; // Réinitialisez si nécessaire
}
ouvrirModalModification(projet: Projet): void {
  this.projetSelectionne = { ...projet }; // Cloner l'objet projet
  this.showEditModal = true; // Ouvrir le modal de modification
}

confirmerSuppression(projet: Projet): void {
  console.log('Confirmation de suppression pour le projet:', projet);
  this.projetASupprimer = projet; // Stocker le projet à supprimer
  this.showDeleteModal = true; // Ouvrir le modal
}

fermerModalSuppression(): void {
  this.showDeleteModal = false; // Fermer le modal
  this.projetASupprimer = undefined; // Réinitialiser le projet à supprimer
}

fermerModal(): void {
  this.showEditModal = false; // Fermer le modal
}

modifierProjet(): void {
  if (this.projetSelectionne) {
    this.projetService.modifierProjet(this.projetSelectionne.idP, this.projetSelectionne)
      .subscribe({
        next: (response) => {
          console.log('Projet modifié avec succès:', response);
          this.showEditModal = false; // Fermer le modal
          this.loadProjets(); // Recharger la liste des projets après modification
        },
        error: (error) => {
          console.error('Erreur lors de la modification du projet:', error);
        }
      });
  }
}

loadProjets(): void {
  this.projetService.getProjetsByActivite(this.activiteId).subscribe((data: Projet[]) => {
    this.projets = data;
  });
}

supprimerProjet(): void {
  if (this.projetASupprimer && this.projetASupprimer.idP) {
      console.log('ID du projet à supprimer:', this.projetASupprimer.idP);
      this.projetService.supprimerProjet(this.projetASupprimer.idP)
          .subscribe({
              next: (response) => {
                  console.log('Réponse de l\'API après suppression:', response);
                  this.loadProjets(); // Recharger les projets après suppression
                  this.fermerModalSuppression(); // Fermer le modal après succès
              },
              error: (error) => {
                  console.error('Erreur lors de la suppression du projet:', error);
                  alert('Erreur lors de la suppression du projet'); // Alerte en cas d'erreur
              }
          });
  } else {
      console.error('Aucun projet sélectionné pour la suppression.');
  }
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