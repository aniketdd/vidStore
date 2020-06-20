import { expect } from 'chai';
import PriceCalculator from '../src/services/price-calculator';

describe('price calculator', () => {
  it('calculate price for New releases', (done) => {
    const priceCalculator = new PriceCalculator(40, 1, 40);
    expect(priceCalculator.calculatePrice(1)).to.equal(40);
    expect(priceCalculator.calculatePrice(2)).to.equal(80);
    done();
  });

  it('calculate price for Regular films', (done) => {
    const priceCalculator = new PriceCalculator(30, 3, 30);
    expect(priceCalculator.calculatePrice(1)).to.equal(30);
    expect(priceCalculator.calculatePrice(2)).to.equal(30);
    expect(priceCalculator.calculatePrice(3)).to.equal(30);
    expect(priceCalculator.calculatePrice(4)).to.equal(60);
    expect(priceCalculator.calculatePrice(5)).to.equal(90);
    done();
  });

  it('calculate price for Old films', (done) => {
    const priceCalculator = new PriceCalculator(30, 5, 30);
    expect(priceCalculator.calculatePrice(1)).to.equal(30);
    expect(priceCalculator.calculatePrice(2)).to.equal(30);
    expect(priceCalculator.calculatePrice(3)).to.equal(30);
    expect(priceCalculator.calculatePrice(4)).to.equal(30);
    expect(priceCalculator.calculatePrice(5)).to.equal(30);
    expect(priceCalculator.calculatePrice(6)).to.equal(60);
    expect(priceCalculator.calculatePrice(7)).to.equal(90);
    done();
  });
});
