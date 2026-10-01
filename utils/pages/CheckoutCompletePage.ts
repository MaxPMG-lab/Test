import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutCompletePage extends BasePage {
  readonly confirmationHeader: Locator;
  readonly backHomeButton: Locator;
  readonly ponyExpressImage: Locator;

  constructor(page: Page) {
    super(page);
    this.confirmationHeader = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
    this.ponyExpressImage = page.locator('[data-test="pony-express"]');
  }

  async getConfirmationHeader(): Promise<string> {
    return (await this.confirmationHeader.textContent()) ?? '';
  }

  async backToHome(): Promise<void> {
    await this.backHomeButton.click();
    await expect(this.page).toHaveURL(/inventory\.html/);
  }

  async expectOrderComplete(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
    await expect(this.confirmationHeader).toBeVisible();
    await expect(this.confirmationHeader).toHaveText('Thank you for your order!');
    await expect(this.ponyExpressImage).toBeVisible();
  }
}
