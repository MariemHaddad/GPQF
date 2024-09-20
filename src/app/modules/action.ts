import { PlanAction } from './planAction';

export class Action {
  id: number;
  description: string;
  type: string;
  responsable: string;
  datePlanification: Date;
  dateRealisation: Date;
  critereEfficacite: string;
  efficace: boolean;
  commentaire: string;
  planAction: PlanAction;

  constructor(
    id: number = 0,
    description: string = '',
    type: string = '',
    responsable: string = '',
    datePlanification: Date = new Date(),
    dateRealisation: Date = new Date(),
    critereEfficacite: string = '',
    efficace: boolean = false,
    commentaire: string = '',
    planAction: PlanAction = new PlanAction()
  ) {
    this.id = id;
    this.description = description;
    this.type = type;
    this.responsable = responsable;
    this.datePlanification = datePlanification;
    this.dateRealisation = dateRealisation;
    this.critereEfficacite = critereEfficacite;
    this.efficace = efficace;
    this.commentaire = commentaire;
    this.planAction = planAction;
  }
}
