import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LojaSkinsComponent } from './loja-skins.component';

describe('LojaSkinsComponent', () => {
  let component: LojaSkinsComponent;
  let fixture: ComponentFixture<LojaSkinsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LojaSkinsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LojaSkinsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
