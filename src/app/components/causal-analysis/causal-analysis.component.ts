import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CauseIshikawa } from 'src/app/modules/causeIshikawa';
import { Pourquoi } from 'src/app/modules/pourquoi';
import { CausalAnalysisService } from 'src/app/services/causal-analysis.service';
import { AnalyseCausale } from 'src/app/modules/analyseCausale';
import { ActivatedRoute } from '@angular/router';
import { Checklist } from 'src/app/modules/checklist';
import { ChecklistService } from 'src/app/services/checklist.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-causal-analysis',
  templateUrl: './causal-analysis.component.html',
  styleUrls: ['./causal-analysis.component.css']
})
export class CausalAnalysisComponent implements OnInit {
  checklistId: number | undefined;
  analyseCausale: AnalyseCausale = new AnalyseCausale(0, '', '', '', 0, [], []);
  savedAnalyseCausale: any;
  isRqualite!: boolean; 
  constructor(
    private route: ActivatedRoute,
    private causalAnalysisService: CausalAnalysisService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isRqualite = this.authService.hasRole('RQUALITE');// Vérification du rôle

    this.route.paramMap.subscribe(params => {
      const id = params.get('checklistId');
      this.checklistId = id ? +id : undefined;
      if (this.checklistId && this.checklistId > 0) {
        this.initializeAnalysis();
        this.loadCausalAnalysis();
      } else {
        console.error('ID de checklist invalide:', this.checklistId);
      }
    });
  }

  initializeAnalysis() {
    if (this.analyseCausale.methodeAnalyse === 'FIVE_WHYS') {
      this.analyseCausale.cinqPourquoi = [
        new Pourquoi(0, '', 0, ''),
        new Pourquoi(0, '', 0, ''),
        new Pourquoi(0, '', 0, ''),
        new Pourquoi(0, '', 0, ''),
        new Pourquoi(0, '', 0, '')
      ];
    }
  }

  loadCausalAnalysis() {
    if (this.checklistId !== undefined) {
      this.causalAnalysisService.getCausalAnalysisById(this.checklistId).subscribe(
        analysis => {
          this.analyseCausale = analysis;
        },
        error => {
          console.error('Erreur lors du chargement de l\'analyse causale:', error);
          if (error.status === 403) {
            // Handle the 403 error, possibly show an appropriate message to the user
          }
        }
      );
    }
  }

  saveCausalAnalysis() {
    if (this.checklistId !== undefined) {
      this.causalAnalysisService.saveCausalAnalysis(this.analyseCausale, this.checklistId).subscribe(
        result => {
          this.savedAnalyseCausale = result;
        },
        error => {
          console.error('Erreur lors de la sauvegarde de l\'analyse causale:', error);
          // Handle the error here
        }
      );
    }
  }

  addCause() {
    if (this.isRqualite) {
      this.analyseCausale.causesIshikawa.push(new CauseIshikawa(0, '', '', 0, ''));
    } else {
      console.error('Action non autorisée pour cet utilisateur.');
    }
  }
}