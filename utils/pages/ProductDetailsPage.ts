import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface ProductDetails {
  name: string;
  description: string;
  price: number;
}

export class ProductDetailsPage extends BasePage {
  readonly productName: Locator;
  readonly productDescription: Locator;
  readonly productPrice: Locator;

  constructor(page: Page) {
    super(page);
    this.productName = page.getByTestId('inventory-item-name');
    this.productDescription = page.getByTestId('inventory-item-desc');
    this.productPrice = page.getByTestId('inventory-item-price');
  }

  async getProductDetails(): Promise<ProductDetails> {
    const name = (await this.productName.first().textContent()) ?? '';
    const description = (await this.productDescription.first().textContent()) ?? '';
    const priceText = (await this.productPrice.first().textContent()) ?? '$0';
    const price = parseFloat(priceText.replace('$', ''));
    return { name: name.trim(), description: description.trim(), price };
  }

  async expectPageVisible(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory-item\.html/);
    await expect(this.productName.first()).toBeVisible();
  }
}
