import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChromeDinoComponent } from './chrome-dino.component';

describe('ChromeDinoComponent', () => {
  let component: ChromeDinoComponent;
  let fixture: ComponentFixture<ChromeDinoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChromeDinoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChromeDinoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
