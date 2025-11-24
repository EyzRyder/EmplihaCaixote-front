import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LojaCenariosComponent } from './loja-cenarios.component';

describe('LojaCenariosComponent', () => {
  let component: LojaCenariosComponent;
  let fixture: ComponentFixture<LojaCenariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LojaCenariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LojaCenariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
