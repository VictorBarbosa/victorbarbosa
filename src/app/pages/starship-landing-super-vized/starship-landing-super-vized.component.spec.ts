import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarShipLandingSuperVizedComponent } from './starship-landing-super-vized.component';

describe('StarShipLandingSuperVizedComponent', () => {
  let component: StarShipLandingSuperVizedComponent;
  let fixture: ComponentFixture<StarShipLandingSuperVizedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarShipLandingSuperVizedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StarShipLandingSuperVizedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
