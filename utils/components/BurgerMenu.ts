import { Page, Locator, expect } from '@playwright/test';

export class BurgerMenu {
  readonly openButton: Locator;
  readonly closeButton: Locator;
  readonly allItemsLink: Locator;
  readonly logoutLink: Locator;

  constructor(private readonly page: Page) {
    this.openButton = page.getByRole('button', { name: 'Open Menu' });
    this.closeButton = page.getByTestId('close-menu');
    this.allItemsLink = page.getByTestId('inventory-sidebar-link');
    this.logoutLink = page.getByTestId('logout-sidebar-link');
  }

  async open(): Promise<void> {
    await this.openButton.click();
    await expect(this.closeButton).toBeVisible();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    await expect(this.closeButton).toBeHidden();
  }

  async logout(): Promise<void> {
    await this.open();
    await this.logoutLink.click();
    await expect(this.page).toHaveURL('/');
  }

  async goToAllItems(): Promise<void> {
    await this.open();
    await this.allItemsLink.click();
    await expect(this.page).toHaveURL(/inventory\.html/);
  }
}
