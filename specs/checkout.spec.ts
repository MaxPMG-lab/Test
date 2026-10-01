import { test, expect } from '@utils/fixtures';
import { allure } from 'allure-playwright';
import { DEFAULT_CHECKOUT_INFO, generateCheckoutInfo } from '@utils/helpers/testData';
import { verifyOrderTotal, sumPrices } from '@utils/helpers/priceUtils';

test.describe('Checkout', () => {
  test.beforeEach(async ({ authenticatedPage, inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.expectPageVisible();
  });

  // Happy path: complete order
  test('completes a full order end-to-end', async ({
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
    header,
  }) => {
    await allure.feature('Checkout');
    await allure.story('Complete Order');
    await allure.severity('blocker');
    await allure.description(
      'Verifies the full happy-path checkout flow: add items → cart → checkout info → ' +
        'order review → order confirmation.',
    );

    const itemsToOrder = ['Sauce Labs Backpack', 'Sauce Labs Fleece Jacket'];

    await test.step('Add items to cart', async () => {
      for (const item of itemsToOrder) {
        await inventoryPage.addItemToCartByName(item);
      }
      await header.expectCartCount(itemsToOrder.length);
    });

    await test.step('Open cart and proceed to checkout', async () => {
      await header.goToCart();
      const cartItems = await cartPage.getCartItems();

      await allure.attachment(
        'Cart contents at checkout',
        Buffer.from(JSON.stringify(cartItems, null, 2)),
        'application/json',
      );

      await cartPage.proceedToCheckout();
    });

    await test.step('Fill in checkout information', async () => {
      await checkoutStepOnePage.expectPageVisible();
      await checkoutStepOnePage.fillInfoAndContinue(DEFAULT_CHECKOUT_INFO);
    });

    await test.step('Review order summary and verify totals', async () => {
      await checkoutStepTwoPage.expectPageVisible();
      const summary = await checkoutStepTwoPage.getOrderSummary();

      await allure.attachment(
        'Order summary',
        Buffer.from(JSON.stringify(summary, null, 2)),
        'application/json',
      );

      expect(summary.itemTotal).toBeGreaterThan(0);
      expect(summary.tax).toBeGreaterThan(0);
      expect(
        verifyOrderTotal(summary.itemTotal, summary.tax, summary.total),
        `Expected ${summary.itemTotal} + ${summary.tax} = ${summary.total}`,
      ).toBe(true);
    });

    await test.step('Finish the order', async () => {
      await checkoutStepTwoPage.finish();
    });

    await test.step('Verify order confirmation page', async () => {
      await checkoutCompletePage.expectOrderComplete();
      const header_text = await checkoutCompletePage.getConfirmationHeader();
      expect(header_text).toBe('Thank you for your order!');

      const screenshot = await checkoutCompletePage.page.screenshot();
      await allure.attachment('Order confirmation', screenshot, 'image/png');
    });

    await test.step('Return to inventory and verify cart is cleared', async () => {
      await checkoutCompletePage.backToHome();
      await header.expectCartCount(0);
    });
  });

  // Order summary math
  test('order summary totals match the individual item prices', async ({
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    header,
  }) => {
    await allure.feature('Checkout');
    await allure.story('Order Summary Accuracy');
    await allure.severity('critical');
    await allure.description(
      'Adds all 6 products and verifies the checkout summary subtotal matches the sum of individual prices.',
    );

    const allProducts = [
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt',
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Onesie',
      'Test.allTheThings() T-Shirt (Red)',
    ];

    await test.step('Add all products to cart', async () => {
      for (const product of allProducts) {
        await inventoryPage.addItemToCartByName(product);
      }
    });

    let expectedSubtotal = 0;

    await test.step('Capture cart prices before proceeding', async () => {
      await header.goToCart();
      // Wait for all 6 items to be present before reading prices
      await expect(cartPage.cartItems).toHaveCount(6);
      const cartItems = await cartPage.getCartItems();
      expectedSubtotal = sumPrices(cartItems.map((i) => i.price));

      await allure.attachment(
        'Cart items with prices',
        Buffer.from(JSON.stringify(cartItems, null, 2)),
        'application/json',
      );

      await cartPage.proceedToCheckout();
    });

    await test.step('Fill checkout info', async () => {
      await checkoutStepOnePage.fillInfoAndContinue(generateCheckoutInfo(1));
    });

    await test.step('Compare summary subtotal to expected', async () => {
      const summary = await checkoutStepTwoPage.getOrderSummary();
      expect(summary.itemTotal).toBe(expectedSubtotal);
    });
  });

  // Validation: missing checkout info
  test.describe('Checkout info validation', () => {
    const validationCases = [
      {
        info: { firstName: '', lastName: 'User', postalCode: '12345' },
        expectedError: 'First Name is required',
      },
      {
        info: { firstName: 'Test', lastName: '', postalCode: '12345' },
        expectedError: 'Last Name is required',
      },
      {
        info: { firstName: 'Test', lastName: 'User', postalCode: '' },
        expectedError: 'Postal Code is required',
      },
    ];

    for (const scenario of validationCases) {
      test(`shows validation error when ${
        !scenario.info.firstName
          ? 'first name'
          : !scenario.info.lastName
            ? 'last name'
            : 'postal code'
      } is missing`, async ({ inventoryPage, cartPage, checkoutStepOnePage, header }) => {
        await allure.feature('Checkout');
        await allure.story('Checkout Validation');
        await allure.severity('normal');
        await allure.description(
          `Verifies that submitting checkout info without required fields shows "${scenario.expectedError}".`,
        );

        await test.step('Add an item and reach checkout step one', async () => {
          await inventoryPage.addItemToCartByName('Sauce Labs Onesie');
          await header.goToCart();
          await cartPage.proceedToCheckout();
        });

        await test.step('Submit incomplete form', async () => {
          await checkoutStepOnePage.fillInfo(scenario.info);
          await checkoutStepOnePage.continueButton.click();
        });

        await test.step('Verify validation error', async () => {
          const error = await checkoutStepOnePage.getErrorMessage();
          expect(error).toContain(scenario.expectedError);
        });
      });
    }
  });

  // Cancel checkout
  test('cancelling checkout step one returns to cart', async ({
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    header,
  }) => {
    await allure.feature('Checkout');
    await allure.story('Cancel Checkout');
    await allure.severity('minor');
    await allure.description(
      'Verifies that cancelling on checkout step one navigates back to the cart.',
    );

    await test.step('Add item and navigate to checkout step one', async () => {
      await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
      await header.goToCart();
      await cartPage.proceedToCheckout();
    });

    await test.step('Cancel on step one', async () => {
      await checkoutStepOnePage.cancel();
    });

    await test.step('Verify return to cart with item still present', async () => {
      await cartPage.expectPageVisible();
      await expect(cartPage.cartItems).toHaveCount(1);
    });
  });

  // Cancel on order review
  test('cancelling checkout step two returns to inventory', async ({
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    header,
  }) => {
    await allure.feature('Checkout');
    await allure.story('Cancel Checkout');
    await allure.severity('minor');
    await allure.description(
      'Verifies that cancelling on the order review page navigates back to the inventory.',
    );

    await test.step('Navigate through to step two', async () => {
      await inventoryPage.addItemToCartByName('Sauce Labs Bolt T-Shirt');
      await header.goToCart();
      await cartPage.proceedToCheckout();
      await checkoutStepOnePage.fillInfoAndContinue(DEFAULT_CHECKOUT_INFO);
    });

    await test.step('Cancel on step two', async () => {
      await checkoutStepTwoPage.cancel();
    });

    await test.step('Verify redirect to inventory page', async () => {
      await expect(inventoryPage.page).toHaveURL(/inventory\.html/);
    });
  });
});
