import PriceCalculator from '../services/price-calculator';
import settings from '.';

const { regularFee, premiumFee } = settings;

export default {
  NEW_RELEASE: {
    displayName: 'New releases',
    priceCalculator: new PriceCalculator(premiumFee, 1, premiumFee),
    keyName: 'NEW_RELEASE',
    bonuspointsEarned: 2
  },
  REGULAR_FILM: {
    displayName: 'Regular films',
    priceCalculator: new PriceCalculator(regularFee, 3, regularFee),
    keyName: 'REGULAR_FILM',
    bonuspointsEarned: 1
  },
  OLD_FILM: {
    displayName: 'Old films',
    priceCalculator: new PriceCalculator(regularFee, 5, regularFee),
    keyName: 'OLD_FILM',
    bonuspointsEarned: 1
  }
};
