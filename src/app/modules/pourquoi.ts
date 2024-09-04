export class Pourquoi {
    id: number;
    question: string;
    pourcentage: number;
    action: string;

    constructor(id: number, question: string, pourcentage: number, action: string) {
        this.id = id;
        this.question = question;
        this.pourcentage = pourcentage;
        this.action = action;
    }
}
