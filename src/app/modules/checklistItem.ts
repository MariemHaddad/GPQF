export class ChecklistItem {
    idCi?: number;
    description: string;
    resultat: string;
    commentaire: string;

    constructor(
        idCi: number = 0,
        description: string = '',
        resultat: string = '',
        commentaire: string = ''
    ) {
        this.idCi = idCi;
        this.description = description;
        this.resultat = resultat;
        this.commentaire = commentaire;
    }
}