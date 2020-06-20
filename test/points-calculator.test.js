import { expect } from 'chai';
import { getNumberOfDaysToPayFor } from '../src/services/points-calculator';

describe('points calculator', () => {
  it('should not use points if below minimum', (done) => {
    const result = getNumberOfDaysToPayFor(10, true, 1);

    expect(result).to.eql({
      paidByBonusPointsDays: 0,
      paidByCurrencyDays: 1,
      pointsUsed: 0,
      pointsRemaining: 10
    });
    done();
  });

  it('should not use points if not asked', (done) => {
    const result = getNumberOfDaysToPayFor(30, false, 1);

    expect(result).to.eql({
      paidByBonusPointsDays: 0,
      paidByCurrencyDays: 1,
      pointsUsed: 0,
      pointsRemaining: 30
    });
    done();
  });

  it('should use points if available to pay for all days', (done) => {
    const result = getNumberOfDaysToPayFor(30, true, 1);

    expect(result).to.eql({
      paidByBonusPointsDays: 1,
      paidByCurrencyDays: 0,
      pointsUsed: 25,
      pointsRemaining: 5
    });
    done();
  });

  it('should not use points if available to pay partially', (done) => {
    const result = getNumberOfDaysToPayFor(30, true, 2);

    expect(result).to.eql({
      paidByBonusPointsDays: 1,
      paidByCurrencyDays: 1,
      pointsUsed: 25,
      pointsRemaining: 5
    });
    done();
  });

  it('should not use points if available to pay for more than days asked', (done) => {
    const result = getNumberOfDaysToPayFor(60, true, 1);

    expect(result).to.eql({
      paidByBonusPointsDays: 1,
      paidByCurrencyDays: 0,
      pointsUsed: 25,
      pointsRemaining: 35
    });
    done();
  });
});
