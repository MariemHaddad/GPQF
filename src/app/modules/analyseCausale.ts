import { Pourquoi } from "./pourquoi";
import { CauseIshikawa } from "./causeIshikawa";
import { PlanAction } from "./planAction";

export class AnalyseCausale {
    idAN: number;
    typeProbleme: string;
    identificationProbleme: string;
    methodeAnalyse: string;
    checklistId: number;
    cinqPourquoi: Pourquoi[];
    causesIshikawa: CauseIshikawa[];
   
    constructor(
        idAN: number,
        typeProbleme: string,
        identificationProbleme: string,
        methodeAnalyse: string,
        checklistId: number,
        cinqPourquoi: Pourquoi[],
        causesIshikawa: CauseIshikawa[]
        
    ) {
        this.idAN = idAN;
        this.typeProbleme = typeProbleme;
        this.identificationProbleme = identificationProbleme;
        this.methodeAnalyse = methodeAnalyse;
        this.checklistId = checklistId;
        this.cinqPourquoi = cinqPourquoi;
        this.causesIshikawa = causesIshikawa;
        
    }
}
