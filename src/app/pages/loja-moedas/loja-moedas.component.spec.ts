import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LojaMoedasComponent } from './loja-moedas.component';

describe('LojaMoedasComponent', () => {
  let component: LojaMoedasComponent;
  let fixture: ComponentFixture<LojaMoedasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LojaMoedasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LojaMoedasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
