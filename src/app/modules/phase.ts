import { Checklist } from "./checklist";

export class Phase {
    idPh?: number;
    description: string;
    objectifs: string;
    plannedStartDate: string;  // Change to string
    plannedEndDate: string;    // Change to string
    effectiveStartDate?: string; // Optional
    effectiveEndDate?: string;   // Optional
    etat?: string;
    effortPlanifie?: number; // Ajouté
    effortActuel?: number;
    checklist: Checklist | null;
    effortVariance?: number; 
    scheduleVariance?: number;
    constructor(
        idPh: number,
        description: string,
        objectifs: string,
        plannedStartDate: string,
        plannedEndDate: string,
        checklist: Checklist | null,
        effectiveStartDate?: string,
        effectiveEndDate?: string,
        etat?: string,
        effortPlanifie?: number, // Ajouté
        effortActuel?: number,
        effortVariance?: number, // Ajoute cette propriété
  scheduleVariance?: number
    ) {
        this.idPh = idPh;
        this.description = description;
        this.objectifs = objectifs;
        this.plannedStartDate = plannedStartDate;
        this.plannedEndDate = plannedEndDate;
        this.effectiveStartDate = effectiveStartDate;
        this.effectiveEndDate = effectiveEndDate;
        this.etat = etat;
        this.effortPlanifie= effortPlanifie;
        this.effortActuel= effortActuel;
        this.checklist = checklist;
        this.effortVariance= effortVariance;
        this.scheduleVariance = scheduleVariance;
    }
}
