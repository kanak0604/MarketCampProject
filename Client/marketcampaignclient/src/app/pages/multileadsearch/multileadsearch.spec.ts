import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Multileadsearch } from './multileadsearch';

describe('Multileadsearch', () => {
  let component: Multileadsearch;
  let fixture: ComponentFixture<Multileadsearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Multileadsearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Multileadsearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
