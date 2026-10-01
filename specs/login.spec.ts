import { test, expect } from '@utils/fixtures';
import { allure } from 'allure-playwright';
import { VALID_USERS, INVALID_USERS, USERS } from '@utils/helpers/users';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.expectLoginPageVisible();
  });

  // All users that should successfully log in
  test.describe('Successful login', () => {
    for (const user of VALID_USERS) {
      test(`logs in as ${user.username}`, async ({ loginPage }) => {
        await allure.feature('Authentication');
        await allure.story('Successful Login');
        await allure.severity('critical');
        await allure.description(
          `Verifies that ${user.description} can authenticate and reaches the inventory page.`,
        );
        await allure.parameter('username', user.username);

        await test.step('Enter credentials and submit', async () => {
          await loginPage.login(user.username, user.password);
        });

        await test.step('Verify redirect to inventory page', async () => {
          await expect(loginPage.page).toHaveURL(/inventory\.html/);
        });
      });
    }
  });

  // Invalid credentials show the correct error
  test.describe('Failed login', () => {
    for (const scenario of INVALID_USERS) {
      test(`shows error for "${scenario.username || '(empty)'}" / "${scenario.password || '(empty)'}"`, async ({
        loginPage,
      }) => {
        await allure.feature('Authentication');
        await allure.story('Failed Login');
        await allure.severity('normal');
        await allure.description(
          `Verifies the correct error message is shown when login fails.`,
        );
        await allure.parameter('username', scenario.username || '(empty)');
        await allure.parameter('password', scenario.password ? '***' : '(empty)');
        await allure.parameter('expectedError', scenario.expectedError);

        await test.step('Submit invalid credentials', async () => {
          await loginPage.login(scenario.username, scenario.password);
        });

        await test.step('Verify error message content', async () => {
          const errorText = await loginPage.getErrorMessage();
          expect(errorText).toContain(scenario.expectedError);
        });

        await test.step('Verify error can be dismissed', async () => {
          await loginPage.dismissError();
        });
      });
    }
  });

  // Locked-out user
  test('locked-out user cannot reach inventory', async ({ loginPage }) => {
    await allure.feature('Authentication');
    await allure.story('Locked Out User');
    await allure.severity('critical');
    await allure.description(
      'Verifies that a locked-out user is blocked and stays on the login page.',
    );

    await test.step('Attempt login with locked-out credentials', async () => {
      await loginPage.login(USERS.lockedOut.username, USERS.lockedOut.password);
    });

    await test.step('Confirm the user remains on the login page', async () => {
      await expect(loginPage.page).toHaveURL('/');
      await expect(loginPage.errorMessage).toBeVisible();
    });

    await test.step('Capture screenshot of error state', async () => {
      const screenshot = await loginPage.page.screenshot();
      await allure.attachment('Login error screenshot', screenshot, 'image/png');
    });
  });

  // ─── Logout flow ──────────────────────────────────────────────────────────
  test('standard user can log out', async ({ loginPage, burgerMenu }) => {
    await allure.feature('Authentication');
    await allure.story('Logout');
    await allure.severity('normal');
    await allure.description('Verifies that a logged-in user can log out via the burger menu.');

    await test.step('Log in as standard user', async () => {
      await loginPage.login(USERS.standard.username, USERS.standard.password);
      await expect(loginPage.page).toHaveURL(/inventory\.html/);
    });

    await test.step('Log out via burger menu', async () => {
      await burgerMenu.logout();
    });

    await test.step('Verify redirect back to login page', async () => {
      await loginPage.expectLoginPageVisible();
    });
  });
});
