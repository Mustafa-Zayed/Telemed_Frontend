import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateDoctorProfile } from './update-doctor-profile';

describe('UpdateDoctorProfile', () => {
  let component: UpdateDoctorProfile;
  let fixture: ComponentFixture<UpdateDoctorProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateDoctorProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateDoctorProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
