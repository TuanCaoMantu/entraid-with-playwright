import { test, expect } from '@playwright/test';

test.describe('Authenticated User Tests', () => {
  test('should access protected my scope', async ({ page }) => {
    // Navigate to a protected page that requires authentication
    await page.goto('/my-scope');
  });
});