import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { Activite } from 'src/app/modules/activite';
import { ActiviteService } from 'src/app/services/activite.service';
import { AuthService } from 'src/app/services/auth.service';
import { ProjetService } from 'src/app/services/projet.service';
import { Chart, ChartTypeRegistry, registerables, TooltipItem } from 'chart.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  loggedInUsername: string = '';
  activites: Activite[] = [];
  @ViewChild('myChartRef') myChartRef!: ElementRef<HTMLCanvasElement>; // Spécifiez le type de l'élément
  chart: Chart<'pie', number[], string> | undefined; // Type spécifié pour 'pie'
  projectStatus = {
    enCours: 10,
    termines: 5,
    enAttente: 3,
  };
   // Variable pour stocker le rôle de l'utilisateur
  // Déclarez authService comme public pour qu'il soit accessible depuis le modèle HTML
  constructor(public authService: AuthService, private router: Router, private http: HttpClient,private activiteService: ActiviteService,private projetService: ProjetService) {Chart.register(...registerables); }

  ngOnInit(): void {
    this.loggedInUsername = this.authService.getLoggedInUsername();
    this.loadActivites();   
    this.getProjectStatus(); 
    
  }
  ngAfterViewInit() {
    console.log('myChartRef:', this.myChartRef);
    this.createChart();
  }
  loadActivites(): void {
    this.activiteService.getActivites().subscribe((data: Activite[]) => {
      this.activites = data;
    });
  }
  getProjectStatus(): void {
    this.projetService.getProjectStatus().subscribe(status => {
      this.projectStatus = status;
      this.createChart(); // Mettre à jour le graphique avec les nouvelles données
    });
  }
  createChart() {
    if (this.chart) {
      this.chart.destroy(); // Détruire le graphique précédent s'il existe
    }
  
    const labels = ['En Cours', 'Terminés', 'En Attente'];
    const percentages = [
      this.getPercentage('enCours'),
      this.getPercentage('termines'),
      this.getPercentage('enAttente'),
    ];
  
    this.chart = new Chart(this.myChartRef.nativeElement, {
      type: 'pie', // Type directement en string
      data: {
        labels: labels,
        datasets: [{
          label: 'Statut des Projets',
          data: percentages, // Utiliser les pourcentages
          backgroundColor: [
            'rgba(60, 179, 113, 1)', // En Cours : Vert
            'rgba(0, 123, 255, 0.6)', // Terminés : Bleu foncé
            'rgba(255, 165, 0, 0.6)',  // En Attente : Orange
          ],
          borderColor: [
            'rgba(60, 179, 113, 1)', // En Cours : Vert
            'rgba(0, 123, 255, 1)',   // Terminés : Bleu foncé
            'rgba(255, 165, 0, 1)',   // En Attente : Orange
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem: TooltipItem<'pie'>) => { // Utiliser le type TooltipItem de Chart.js
                const label = tooltipItem.label || '';
                const value = tooltipItem.raw as number; // Casting de 'raw' en tant que number
                return `${label}: ${value.toFixed(2)}%`; // Affiche le pourcentage avec deux décimales
              }
            }
          }
        }
      }
    });
  }
  
  // Méthode pour obtenir les pourcentages
  getTotalProjects(): number {
    return this.projectStatus.enCours + this.projectStatus.termines + this.projectStatus.enAttente;
  }

  getPercentage(status: 'enCours' | 'termines' | 'enAttente'): number {
    const total = this.getTotalProjects();
    return total > 0 ? (this.projectStatus[status] / total) * 100 : 0;
  }

} 


