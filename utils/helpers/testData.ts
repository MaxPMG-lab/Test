import { CheckoutInfo } from '@utils/pages/CheckoutStepOnePage';

const FIRST_NAMES = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve'];
const LAST_NAMES = ['Smith', 'Jones', 'Taylor', 'Brown', 'Davis'];
const POSTAL_CODES = ['10001', '90210', 'SW1A 1AA', '75001', '10115'];

export function generateCheckoutInfo(seed = 0): CheckoutInfo {
  return {
    firstName: FIRST_NAMES[seed % FIRST_NAMES.length],
    lastName: LAST_NAMES[seed % LAST_NAMES.length],
    postalCode: POSTAL_CODES[seed % POSTAL_CODES.length],
  };
}

export const DEFAULT_CHECKOUT_INFO: CheckoutInfo = {
  firstName: 'Test',
  lastName: 'User',
  postalCode: '12345',
};
