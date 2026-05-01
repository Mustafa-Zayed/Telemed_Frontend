import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientConsultationHistory } from './patient-consultation-history';

describe('PatientConsultationHistory', () => {
  let component: PatientConsultationHistory;
  let fixture: ComponentFixture<PatientConsultationHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientConsultationHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientConsultationHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
