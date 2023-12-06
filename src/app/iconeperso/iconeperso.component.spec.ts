import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconepersoComponent } from './iconeperso.component';

describe('IconepersoComponent', () => {
  let component: IconepersoComponent;
  let fixture: ComponentFixture<IconepersoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IconepersoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconepersoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
