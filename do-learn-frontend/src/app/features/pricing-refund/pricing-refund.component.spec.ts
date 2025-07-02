import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingRefundComponent } from './pricing-refund.component';

describe('PricingRefundComponent', () => {
  let component: PricingRefundComponent;
  let fixture: ComponentFixture<PricingRefundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingRefundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PricingRefundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
