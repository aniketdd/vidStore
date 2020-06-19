export default function PriceCalculator(fixedRentAmount, fixedRentAmountDays, perDayRate) {
  this.fixedRentAmount = fixedRentAmount;
  this.fixedRentAmountDays = fixedRentAmountDays;
  this.perDayRate = perDayRate;
}

PriceCalculator.prototype.calculatePrice = function calculatePrice(days) {
  return (days <= this.fixedRentAmountDays)
    ? this.fixedRentAmount
    : ((days - this.fixedRentAmountDays) * this.perDayRate) + this.fixedRentAmount;
};
