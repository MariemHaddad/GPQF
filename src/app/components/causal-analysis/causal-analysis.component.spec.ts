import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CausalAnalysisComponent } from './causal-analysis.component';

describe('CausalAnalysisComponent', () => {
  let component: CausalAnalysisComponent;
  let fixture: ComponentFixture<CausalAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CausalAnalysisComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CausalAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
