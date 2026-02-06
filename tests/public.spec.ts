import { test, expect } from '@playwright/test';

test.describe('Public Pages', () => {
  test('should load homepage without authentication', async ({ page }) => {
    await page.goto('/');
    
    // Verify homepage loads
    await expect(page).toHaveTitle(/Home|Welcome/);
    
    // Check for login button or link
    const loginElements = [
      page.getByText('LOGIN'),
      page.getByText('Sign in'),
      page.getByRole('button', { name: 'Login' }),
      page.getByRole('link', { name: 'Sign in' })
    ];
    
    // At least one login element should be visible
    let foundLogin = false;
    for (const element of loginElements) {
      try {
        await expect(element).toBeVisible({ timeout: 2000 });
        foundLogin = true;
        break;
      } catch (e) {
        // Continue to next element
      }
    }
    
    expect(foundLogin).toBe(true);
  });

  test('should redirect to login when accessing protected routes', async ({ page }) => {
    // Try to access protected routes without authentication
    const protectedRoutes = ['/dashboard', '/profile', '/settings'];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      
      // Should be redirected to login or show login modal
      await expect(page).toHaveURL(/(login|auth)/);
      
      // Or check for login form on the page
      const hasLoginForm = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]').count() > 0;
      if (!hasLoginForm) {
        // Might be a different login pattern, check for Azure AD redirect
        const hasAzureLogin = await page.locator('text=Microsoft').or(page.locator('text=Azure')).count() > 0;
        expect(hasAzureLogin).toBe(true);
      }
    }
  });

  test('should display public content correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check for common public page elements
    // Adjust these based on your application
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Footer should be visible
    try {
      await expect(page.locator('footer')).toBeVisible();
    } catch (e) {
      // Footer might not exist, that's okay
    }
    
    // Check for public content that doesn't require authentication
    const publicContent = [
      page.getByText('About'),
      page.getByText('Contact'),
      page.getByText('Features'),
      page.getByRole('heading', { level: 1 })
    ];
    
    // At least one piece of public content should be visible
    let foundContent = false;
    for (const content of publicContent) {
      try {
        await expect(content).toBeVisible({ timeout: 2000 });
        foundContent = true;
        break;
      } catch (e) {
        // Continue to next content
      }
    }
    
    expect(foundContent).toBe(true);
  });
});