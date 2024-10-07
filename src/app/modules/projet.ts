export class Projet {
    nomP: string;
    idP: number;
    descriptionP: string;
    datedebutP: string;
    datefinP: string;
    methodologie: string;
    objectifs: string;
    typeprojet: string;
    responsableQualiteNom: string;
    chefDeProjetNom: string;
    satisfactionClient?: string; // Add this property if necessary
    valeurSatisfaction?: number; 
    defautInternes ?: number; // DI
    defautTotaux?:number; 
    nombreRuns?:number;
    nbr8DRealises?: number;
    nbrRetoursCritiques?: number;
    constructor(
        nomP: string = '',
        idP: number = 0,
        descriptionP: string = '',
        datedebutP: string = '',
        datefinP: string = '',
        methodologie: string = '',
        objectifs: string = '',
        typeprojet: string = '',
        responsableQualiteNom: string = '',
        chefDeProjetNom: string= '',
        satisfactionClient: string = '', // Add this to the constructor
        valeurSatisfaction: number = 0 ,
        defautInternes :number = 0, // DI
        defautTotaux:number =0,
        nombreRuns:number=0,
        nbr8DRealises: number = 0,
        nbrRetoursCritiques: number = 0

    ) {
        this.nomP = nomP;
        this.idP = idP;
        this.descriptionP = descriptionP;
        this.datedebutP = datedebutP;
        this.datefinP = datefinP;
        this.methodologie = methodologie;
        this.objectifs = objectifs;
        this.typeprojet = typeprojet;
        this.chefDeProjetNom= chefDeProjetNom;
        this.responsableQualiteNom= responsableQualiteNom;
        this.satisfactionClient = satisfactionClient; // Initialize
        this.valeurSatisfaction = valeurSatisfaction;
        this.defautInternes = defautInternes;
        this.defautTotaux = defautTotaux;
        this.nombreRuns = nombreRuns;
        this.nbr8DRealises = nbr8DRealises;
        this.nbrRetoursCritiques = nbrRetoursCritiques;
    }
}
