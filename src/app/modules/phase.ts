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
    checklist: Checklist | null;

    constructor(
        idPh: number,
        description: string,
        objectifs: string,
        plannedStartDate: string,
        plannedEndDate: string,
        checklist: Checklist | null,
        effectiveStartDate?: string,
        effectiveEndDate?: string,
        etat?: string
    ) {
        this.idPh = idPh;
        this.description = description;
        this.objectifs = objectifs;
        this.plannedStartDate = plannedStartDate;
        this.plannedEndDate = plannedEndDate;
        this.effectiveStartDate = effectiveStartDate;
        this.effectiveEndDate = effectiveEndDate;
        this.etat = etat;
        this.checklist = checklist;
    }
}
