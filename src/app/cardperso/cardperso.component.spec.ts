import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardpersoComponent } from './cardperso.component';

describe('CardpersoComponent', () => {
  let component: CardpersoComponent;
  let fixture: ComponentFixture<CardpersoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardpersoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardpersoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
