export const getNumberOfDaysToPayFor = (totalPoints, useBonuspoints, numOfDays) => {
  if (useBonuspoints && totalPoints > 25) {
    const numOfDaysPayableByBonuspoints = parseInt(totalPoints / 25, 10);
    if (numOfDaysPayableByBonuspoints >= numOfDays) {
      return {
        paidByBonusPointsDays: Math.min(numOfDays, numOfDaysPayableByBonuspoints),
        paidByCurrencyDays: 0,
        pointsUsed: numOfDays * 25,
        pointsRemaining: totalPoints - (numOfDays * 25)
      };
    }
    return {
      paidByBonusPointsDays: numOfDaysPayableByBonuspoints,
      paidByCurrencyDays: numOfDays - numOfDaysPayableByBonuspoints,
      pointsUsed: numOfDaysPayableByBonuspoints * 25,
      pointsRemaining: totalPoints - (numOfDaysPayableByBonuspoints * 25)
    };
  }
  return {
    paidByBonusPointsDays: 0,
    paidByCurrencyDays: numOfDays,
    pointsUsed: 0,
    pointsRemaining: totalPoints
  };
};
