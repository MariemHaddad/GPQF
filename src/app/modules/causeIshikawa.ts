export class CauseIshikawa {
    id: number;
    description: string;
    categorie: string; // La catégorie sera une chaîne de caractères pour représenter l'énumération
    pourcentage: number;
    action: string;

    constructor(id: number, description: string, categorie: string, pourcentage: number, action: string) {
        this.id = id;
        this.description = description;
        this.categorie = categorie;
        this.pourcentage = pourcentage;
        this.action = action;
    }
}
