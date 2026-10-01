import { test, expect } from '@utils/fixtures';
import { allure } from 'allure-playwright';
import {
  isSortedAtoZ,
  isSortedZtoA,
  isSortedLowToHigh,
  isSortedHighToLow,
} from '@utils/helpers/sortingUtils';
import type { SortOption } from '@utils/pages/InventoryPage';

type SortScenario = {
  option: SortOption;
  label: string;
  validate: (names: string[], prices: number[]) => boolean;
  field: 'names' | 'prices';
};

const SORT_SCENARIOS: SortScenario[] = [
  {
    option: 'az',
    label: 'Name (A to Z)',
    validate: (names) => isSortedAtoZ(names),
    field: 'names',
  },
  {
    option: 'za',
    label: 'Name (Z to A)',
    validate: (names) => isSortedZtoA(names),
    field: 'names',
  },
  {
    option: 'lohi',
    label: 'Price (low to high)',
    validate: (_, prices) => isSortedLowToHigh(prices),
    field: 'prices',
  },
  {
    option: 'hilo',
    label: 'Price (high to low)',
    validate: (_, prices) => isSortedHighToLow(prices),
    field: 'prices',
  },
];

test.describe('Inventory', () => {
  test.use({});

  test.beforeEach(async ({ authenticatedPage, inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.expectPageVisible();
  });

  // Inventory page renders
  test('displays all 6 products', async ({ inventoryPage }) => {
    await allure.feature('Inventory');
    await allure.story('Product Listing');
    await allure.severity('critical');
    await allure.description('Verifies that the inventory page renders all six expected products.');

    await test.step('Count inventory items', async () => {
      await expect(inventoryPage.inventoryItems).toHaveCount(6);
    });

    await test.step('Capture product list screenshot', async () => {
      const screenshot = await inventoryPage.page.screenshot({ fullPage: true });
      await allure.attachment('Inventory page', screenshot, 'image/png');
    });
  });

  // Data-driven sort tests
  test.describe('Sorting', () => {
    for (const scenario of SORT_SCENARIOS) {
      test(`sorts by "${scenario.label}"`, async ({ inventoryPage }) => {
        await allure.feature('Inventory');
        await allure.story('Product Sorting');
        await allure.severity('normal');
        await allure.description(
          `Applies the "${scenario.label}" sort option and verifies the resulting order.`,
        );
        await allure.parameter('sortOption', scenario.option);
        await allure.parameter('sortLabel', scenario.label);

        await test.step(`Select sort option: ${scenario.label}`, async () => {
          await inventoryPage.sortBy(scenario.option);
        });

        await test.step('Retrieve current item names and prices', async () => {
          const names = await inventoryPage.getItemNames();
          const prices = await inventoryPage.getItemPrices();

          await allure.attachment(
            'Items after sort',
            Buffer.from(
              JSON.stringify(
                names.map((name, i) => ({ name, price: prices[i] })),
                null,
                2,
              ),
            ),
            'application/json',
          );

          expect(
            scenario.validate(names, prices),
            `Expected items to be sorted by ${scenario.label}. Got: ${
              scenario.field === 'names' ? names.join(', ') : prices.join(', ')
            }`,
          ).toBe(true);
        });
      });
    }
  });

  // Add to cart from inventory
  test('adds a product to the cart from the inventory page', async ({ inventoryPage, header }) => {
    await allure.feature('Inventory');
    await allure.story('Add to Cart');
    await allure.severity('normal');
    await allure.description(
      'Verifies that clicking "Add to cart" on the inventory page increments the cart badge.',
    );

    await test.step('Add "Sauce Labs Backpack" to cart', async () => {
      await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    });

    await test.step('Verify cart badge shows 1', async () => {
      await header.expectCartCount(1);
    });

    await test.step('Remove item and verify badge disappears', async () => {
      await inventoryPage.removeItemFromCartByName('Sauce Labs Backpack');
      await header.expectCartCount(0);
    });
  });

  // Navigate to product details
  test('opens product details page from inventory', async ({
    inventoryPage,
    productDetailsPage,
  }) => {
    await allure.feature('Inventory');
    await allure.story('Product Details Navigation');
    await allure.severity('minor');
    await allure.description(
      'Verifies that clicking a product name navigates to the product details page.',
    );

    await test.step('Click on "Sauce Labs Backpack"', async () => {
      await inventoryPage.openItemByName('Sauce Labs Backpack');
    });

    await test.step('Verify product details page is displayed', async () => {
      await productDetailsPage.expectPageVisible();
      const details = await productDetailsPage.getProductDetails();
      expect(details.name).toBe('Sauce Labs Backpack');
      expect(details.price).toBeGreaterThan(0);
    });
  });
});
