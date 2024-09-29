
import { Action } from './action';
import { AnalyseCausale } from './analyseCausale';

export class PlanAction {
  idPa: number;
  leconTirees: string;
  analyseCausale: AnalyseCausale;
  actions: Action[];

  constructor(
    idPa: number = 0,
    leconTirees: string = '',
    analyseCausale: AnalyseCausale = new AnalyseCausale(0, '', '', '', 0, [], []), 
    actions: Action[] = []
  ) {
    this.idPa = idPa;
    this.leconTirees = leconTirees;
    this.analyseCausale = analyseCausale;
    this.actions = actions;
  }
}
