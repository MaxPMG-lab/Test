import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface OrderSummary {
  itemTotal: number;
  tax: number;
  total: number;
}

export class CheckoutStepTwoPage extends BasePage {
  readonly orderItems: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.orderItems = page.locator('[data-test="cart-list"] [data-test="inventory-item"]');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    this.cancelButton = page.getByTestId('cancel');
  }

  private parseAmount(text: string): number {
    const match = text.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  async getOrderSummary(): Promise<OrderSummary> {
    const subtotalText = (await this.subtotalLabel.textContent()) ?? '';
    const taxText = (await this.taxLabel.textContent()) ?? '';
    const totalText = (await this.totalLabel.textContent()) ?? '';

    return {
      itemTotal: this.parseAmount(subtotalText),
      tax: this.parseAmount(taxText),
      total: this.parseAmount(totalText),
    };
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
    await expect(this.page).toHaveURL(/inventory\.html/);
  }

  async expectPageVisible(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
    await expect(this.finishButton).toBeVisible();
  }
}
