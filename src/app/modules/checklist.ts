import { ChecklistItem } from "./checklistItem";
import { Phase } from "./phase";

export class Checklist {
    idCh?: number;
    phase?: Phase; // Changer ici pour rendre phase optionnelle
    status: string;
    remarque: string;
    items: ChecklistItem[];

    constructor(
        idCh: number,
        status: string,
        remarque: string,
        items: ChecklistItem[],
        phase?: Phase // Changer ici pour rendre phase optionnelle
    ){
        this.idCh = idCh;
        this.status = status;
        this.remarque = remarque;
        this.items = items;
        this.phase = phase;
    }
}
