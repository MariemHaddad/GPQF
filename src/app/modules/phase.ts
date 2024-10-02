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
    statusLivraisonInterne: 'C' | 'NC';
    statusLivraisonExterne: 'C' | 'NC';
    internalNCRate?: number;
    externalNCRate?:number;
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
        scheduleVariance?: number,
        statusLivraisonInterne: 'C' | 'NC' = 'C',
        statusLivraisonExterne: 'C' | 'NC' = 'C',
        internalNCRate?: number,
        externalNCRate?:number
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
        this.statusLivraisonInterne = statusLivraisonInterne;
        this.statusLivraisonExterne = statusLivraisonExterne;
        this.externalNCRate = externalNCRate;
        this.internalNCRate = internalNCRate;
        this.scheduleVariance = scheduleVariance;
    }}
