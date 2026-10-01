import { test, expect } from '@utils/fixtures';
import { allure } from 'allure-playwright';

test.describe('Cart', () => {
  test.beforeEach(async ({ authenticatedPage, inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.expectPageVisible();
  });

  // Empty cart
  test('cart is empty on a fresh session', async ({ cartPage, header }) => {
    await allure.feature('Cart');
    await allure.story('Empty Cart');
    await allure.severity('normal');
    await allure.description('Verifies the cart badge is absent and the cart page shows no items.');

    await test.step('Confirm no badge on header', async () => {
      await header.expectCartCount(0);
    });

    await test.step('Navigate to cart', async () => {
      await cartPage.goto();
      await cartPage.expectPageVisible();
    });

    await test.step('Confirm cart is empty', async () => {
      await cartPage.expectCartIsEmpty();
    });
  });

  // Add multiple items
  test('reflects all items added from the inventory', async ({
    inventoryPage,
    cartPage,
    header,
  }) => {
    await allure.feature('Cart');
    await allure.story('Add Multiple Items');
    await allure.severity('critical');
    await allure.description(
      'Adds two products from the inventory page and verifies they appear correctly in the cart.',
    );

    const itemsToAdd = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];

    await test.step('Add two items to cart', async () => {
      for (const item of itemsToAdd) {
        await inventoryPage.addItemToCartByName(item);
      }
    });

    await test.step('Verify cart badge shows 2', async () => {
      await header.expectCartCount(2);
    });

    await test.step('Open cart and verify items', async () => {
      await header.goToCart();
      await cartPage.expectPageVisible();
      await expect(cartPage.cartItems).toHaveCount(2);
      const cartItems = await cartPage.getCartItems();

      await allure.attachment(
        'Cart contents',
        Buffer.from(JSON.stringify(cartItems, null, 2)),
        'application/json',
      );

      expect(cartItems).toHaveLength(2);
      const names = cartItems.map((i) => i.name);
      expect(names).toContain('Sauce Labs Backpack');
      expect(names).toContain('Sauce Labs Bike Light');
    });

    await test.step('Verify each cart item has a positive price and quantity of 1', async () => {
      const cartItems = await cartPage.getCartItems();
      for (const item of cartItems) {
        expect(item.price).toBeGreaterThan(0);
        expect(item.quantity).toBe(1);
      }
    });
  });

  // Remove item from cart
  test('removes an item directly from the cart page', async ({
    inventoryPage,
    cartPage,
    header,
  }) => {
    await allure.feature('Cart');
    await allure.story('Remove Item from Cart');
    await allure.severity('normal');
    await allure.description(
      'Adds two items, navigates to cart, removes one, and verifies only one remains.',
    );

    await test.step('Add two items from inventory', async () => {
      await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
      await inventoryPage.addItemToCartByName('Sauce Labs Bike Light');
    });

    await test.step('Navigate to cart', async () => {
      await header.goToCart();
    });

    await test.step('Remove "Sauce Labs Backpack"', async () => {
      await cartPage.removeItemByName('Sauce Labs Backpack');
    });

    await test.step('Verify only one item remains', async () => {
      await expect(cartPage.cartItems).toHaveCount(1);
      const remaining = await cartPage.getCartItems();
      expect(remaining[0].name).toBe('Sauce Labs Bike Light');
    });

    await test.step('Verify header badge updated to 1', async () => {
      await header.expectCartCount(1);
    });
  });

  // Continue shopping
  test('"Continue Shopping" returns to inventory without losing cart', async ({
    inventoryPage,
    cartPage,
    header,
  }) => {
    await allure.feature('Cart');
    await allure.story('Continue Shopping');
    await allure.severity('minor');
    await allure.description(
      'Verifies that "Continue Shopping" returns to inventory and the cart item count is preserved.',
    );

    await test.step('Add one item and open cart', async () => {
      await inventoryPage.addItemToCartByName('Sauce Labs Onesie');
      await header.goToCart();
    });

    await test.step('Click "Continue Shopping"', async () => {
      await cartPage.continueShopping();
    });

    await test.step('Verify cart badge still shows 1', async () => {
      await header.expectCartCount(1);
    });
  });
});
