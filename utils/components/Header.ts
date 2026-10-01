import { Page, Locator, expect } from '@playwright/test';

export class Header {
  readonly shoppingCartLink: Locator;
  readonly shoppingCartBadge: Locator;

  constructor(private readonly page: Page) {
    this.shoppingCartLink = page.getByTestId('shopping-cart-link');
    this.shoppingCartBadge = page.getByTestId('shopping-cart-badge');
  }

  async goToCart(): Promise<void> {
    await this.shoppingCartLink.click();
    await expect(this.page).toHaveURL(/cart\.html/);
  }

  async expectCartCount(expected: number): Promise<void> {
    if (expected === 0) {
      await expect(this.shoppingCartBadge).not.toBeVisible();
    } else {
      await expect(this.shoppingCartBadge).toHaveText(String(expected));
    }
  }
}
