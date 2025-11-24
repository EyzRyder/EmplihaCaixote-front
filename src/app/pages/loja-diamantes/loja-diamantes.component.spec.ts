import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LojaDiamantesComponent } from './loja-diamantes.component';

describe('LojaDiamantesComponent', () => {
  let component: LojaDiamantesComponent;
  let fixture: ComponentFixture<LojaDiamantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LojaDiamantesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LojaDiamantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
