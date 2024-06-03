import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlappyBirdSupervisedComponent } from './flappy-bird-supervised.component';

describe('FlappyBirdSupervisedComponent', () => {
  let component: FlappyBirdSupervisedComponent;
  let fixture: ComponentFixture<FlappyBirdSupervisedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlappyBirdSupervisedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FlappyBirdSupervisedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
