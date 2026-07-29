import { test as base, expect, Page, BrowserContext } from '@playwright/test';

/**
 * Shared fixtures for all E2E tests.
 *
 * `authedPage` - A page that has already passed the profile-selection screen.
 * We select the first available profile automatically so tests start from
 * the shopping list view directly.
 */

export type TestFixtures = {
  authedPage: Page;
};

export const test = base.extend<TestFixtures>({
  authedPage: async ({ page }, use) => {
    await page.goto('/');

    // Wait for the AnonSessionProvider to finish (it blocks render until auth)
    // and for the profile list to appear.
    await page.waitForSelector('[data-testid="profile-selector"]', {
      timeout: 15_000,
    });

    // Click the first available profile button
    const profileBtn = page.locator('[data-testid="profile-btn"]').first();
    await profileBtn.click();

    // Wait until we are on the shopping list view
    await page.waitForSelector('[data-testid="shopping-list"]', {
      timeout: 10_000,
    });

    await use(page);
  },
});

export { expect };

/**
 * Helper: go offline in a given context.
 */
export async function goOffline(context: BrowserContext) {
  await context.setOffline(true);
}

/**
 * Helper: go back online in a given context.
 */
export async function goOnline(context: BrowserContext) {
  await context.setOffline(false);
}
