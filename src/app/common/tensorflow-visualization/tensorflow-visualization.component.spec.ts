import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TensorflowVisSampleComponent } from './tensorflow-visualization.component';

describe('TensorflowVisSampleComponent', () => {
  let component: TensorflowVisSampleComponent;
  let fixture: ComponentFixture<TensorflowVisSampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TensorflowVisSampleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TensorflowVisSampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
