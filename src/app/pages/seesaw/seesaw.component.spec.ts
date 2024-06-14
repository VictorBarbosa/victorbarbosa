import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeesawComponent } from './seesaw.component';

describe('SeesawComponent', () => {
  let component: SeesawComponent;
  let fixture: ComponentFixture<SeesawComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeesawComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SeesawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
