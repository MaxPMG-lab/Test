# Sauce Demo — Playwright Test Automation Framework

A UI test automation framework for [Sauce Demo](https://www.saucedemo.com/) built with **Playwright** and **TypeScript**.

---

## Tech stack

| Tool | Purpose |
|---|---|
| [@playwright/test](https://playwright.dev) | Test runner and browser automation |
| [TypeScript](https://www.typescriptlang.org/) | Type safety and IDE support |
| [allure-playwright](https://www.npmjs.com/package/allure-playwright) | Allure integration for Playwright |
| [Allure CLI](https://docs.qameta.io/allure/) | Test report generation and serving |

---

## Project structure

```text
.
├── specs/
│   ├── cart.spec.ts                 # Cart management suite
│   ├── checkout.spec.ts             # Full checkout flow and validation
│   ├── inventory.spec.ts            # Product listing and sorting
│   └── login.spec.ts                # Authentication suite
│
├── utils/
│   ├── components/
│   │   ├── BurgerMenu.ts            # Side navigation and logout
│   │   └── Header.ts                # Header and cart functionality
│   │
│   ├── fixtures/
│   │   └── index.ts                 # Custom Playwright fixtures
│   │
│   ├── helpers/
│   │   ├── priceUtils.ts            # Price calculations and total validation
│   │   ├── sortingUtils.ts          # Product sorting validation
│   │   ├── testData.ts              # Checkout test data
│   │   └── users.ts                 # Test user credentials and scenarios
│   │
│   └── pages/
│       ├── BasePage.ts
│       ├── CartPage.ts
│       ├── CheckoutCompletePage.ts
│       ├── CheckoutStepOnePage.ts
│       ├── CheckoutStepTwoPage.ts
│       ├── InventoryPage.ts
│       ├── LoginPage.ts
│       └── ProductDetailsPage.ts
│
├── .gitignore
├── package.json
├── playwright.config.ts
├── README.md
└── tsconfig.json
```

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Allure CLI** for report generation

```bash
# macOS
brew install allure

# npm
npm install -g allure-commandline
```

---

## Setup

```bash
npm install
npx playwright install --with-deps
```

---

## Running the tests

| Command | Description |
|---|---|
| `npm test` | Run all tests |
| `npm run test:headed` | Run in headed mode |
| `npm run test:debug` | Run with Playwright Inspector |
| `npm run test:login` | Login suite only |
| `npm run test:inventory` | Inventory suite only |
| `npm run test:cart` | Cart suite only |
| `npm run test:checkout` | Checkout suite only |

---

## Allure report

```bash
npm run report          # generate and open in one step

npm run allure:generate # generate from allure-results/
npm run allure:open     # open generated report
npm run allure:serve    # live-serve allure-results/
```

> Allure CLI must be on your system `PATH`.

---

## Framework design

### Page Object Model

Each page is represented by a dedicated class extending `BasePage`, located in `utils/pages/`. Page objects expose locators, action methods, and page-specific assertions. All assertions use Playwright's web-first `expect(locator).*` API.

### Shared components

`Header` and `BurgerMenu` are shared across multiple pages and live in `utils/components/`.

### Custom fixtures

`utils/fixtures/index.ts` exports a custom `test` object via `test.extend()` that injects all page objects and components automatically. It also provides an `authenticatedPage` fixture — a pre-logged-in session ready for tests that don't need to test the login flow itself.

### Helpers

| File | Responsibility |
|---|---|
| `priceUtils.ts` | Price calculations and order total validation |
| `sortingUtils.ts` | A→Z, Z→A, low→high, high→low sort validation |
| `testData.ts` | Checkout form data |
| `users.ts` | User credentials and login test scenarios |

### Data-driven tests

Login and sorting tests are parameterised — each dataset entry generates an independent test case, keeping the test logic in one place.
