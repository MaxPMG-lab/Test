import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  readonly sortDropdown: Locator;
  readonly inventoryItems: Locator;
  readonly shoppingCartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.sortDropdown = page.getByTestId('product-sort-container');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.shoppingCartBadge = page.getByTestId('shopping-cart-badge');
  }

  async goto(): Promise<void> {
    await this.navigate('/inventory.html');
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async getItemNames(): Promise<string[]> {
    return this.inventoryItems
      .locator('[data-test="inventory-item-name"]')
      .allTextContents();
  }

  async getItemPrices(): Promise<number[]> {
    const rawPrices = await this.inventoryItems
      .locator('[data-test="inventory-item-price"]')
      .allTextContents();
    return rawPrices.map((p) => parseFloat(p.replace('$', '')));
  }

  async addItemToCartByName(itemName: string): Promise<void> {
    const normalizedId = itemName.toLowerCase().replace(/\s+/g, '-');
    await this.page.getByTestId(`add-to-cart-${normalizedId}`).click();
  }

  async removeItemFromCartByName(itemName: string): Promise<void> {
    const normalizedId = itemName.toLowerCase().replace(/\s+/g, '-');
    await this.page.getByTestId(`remove-${normalizedId}`).click();
  }

  async openItemByName(itemName: string): Promise<void> {
    await this.page.getByTestId('inventory-item-name').filter({ hasText: itemName }).click();
  }

  async expectPageVisible(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.sortDropdown).toBeVisible();
  }
}
