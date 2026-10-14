import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { MensajesComponent } from './mensajes';

describe('MensajesComponent', () => {
  let component: MensajesComponent;
  let fixture: ComponentFixture<MensajesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MensajesComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MensajesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
