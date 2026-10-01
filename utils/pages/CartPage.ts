import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface CartItem {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export class CartPage extends BasePage {
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = page.locator('[data-test="cart-list"] [data-test="inventory-item"]');
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
  }

  async goto(): Promise<void> {
    await this.navigate('/cart.html');
  }

  async getCartItems(): Promise<CartItem[]> {
    const count = await this.cartItems.count();
    const items: CartItem[] = [];

    for (let i = 0; i < count; i++) {
      const item = this.cartItems.nth(i);
      const name = (await item.getByTestId('inventory-item-name').textContent()) ?? '';
      const description = (await item.getByTestId('inventory-item-desc').textContent()) ?? '';
      const priceText = (await item.getByTestId('inventory-item-price').textContent()) ?? '$0';
      const qtyText = (await item.getByTestId('item-quantity').textContent()) ?? '1';

      items.push({
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(priceText.replace('$', '')),
        quantity: parseInt(qtyText, 10),
      });
    }

    return items;
  }

  async removeItemByName(itemName: string): Promise<void> {
    const normalizedId = itemName.toLowerCase().replace(/\s+/g, '-');
    await this.page.getByTestId(`remove-${normalizedId}`).click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
    await expect(this.page).toHaveURL(/checkout-step-one\.html/);
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
    await expect(this.page).toHaveURL(/inventory\.html/);
  }

  async expectPageVisible(): Promise<void> {
    await expect(this.page).toHaveURL(/cart\.html/);
    await expect(this.checkoutButton).toBeVisible();
  }

  async expectCartIsEmpty(): Promise<void> {
    await expect(this.cartItems).toHaveCount(0);
  }
}
