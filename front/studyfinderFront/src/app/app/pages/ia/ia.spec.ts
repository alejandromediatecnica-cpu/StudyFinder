import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IaComponent } from './ia';

describe('IaComponent', () => {
  let component: IaComponent;
  let fixture: ComponentFixture<IaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
