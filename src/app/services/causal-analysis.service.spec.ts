import { TestBed } from '@angular/core/testing';

import { CausalAnalysisService } from './causal-analysis.service';

describe('CausalAnalysisService', () => {
  let service: CausalAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CausalAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
