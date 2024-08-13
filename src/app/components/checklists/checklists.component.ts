import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Checklist } from 'src/app/modules/checklist';
import { ChecklistService } from 'src/app/services/checklist.service';

@Component({
  selector: 'app-checklists',
  templateUrl: './checklists.component.html',
  styleUrls: ['./checklists.component.css']
})
export class ChecklistsComponent implements OnInit {
  checklist!: Checklist;
  phaseDescription: string = '';
  NomP: string = '';

  constructor(
    private route: ActivatedRoute,
    private checklistService: ChecklistService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const phaseId = +params.get('phaseId')!;
      this.phaseDescription = this.route.snapshot.queryParamMap.get('phaseDescription') || '';
      this.NomP = this.route.snapshot.queryParamMap.get('NomP') || '';

      if (phaseId) {
        this.checklistService.getChecklistByPhase(phaseId).subscribe(
          checklist => {
            this.checklist = checklist;
          },
          error => {
            console.error('Erreur lors de la récupération de la checklist:', error);
          }
        );
      }
    });
  }
  
}