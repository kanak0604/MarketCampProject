import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bulkupload } from './bulkupload';

describe('Bulkupload', () => {
  let component: Bulkupload;
  let fixture: ComponentFixture<Bulkupload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bulkupload]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bulkupload);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
