import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LojaPoderesComponent } from './loja-poderes.component';

describe('LojaPoderesComponent', () => {
  let component: LojaPoderesComponent;
  let fixture: ComponentFixture<LojaPoderesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LojaPoderesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LojaPoderesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
