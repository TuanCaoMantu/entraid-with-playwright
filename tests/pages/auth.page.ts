import { Page, expect } from '@playwright/test';

/**
 * Page Object Model for Authentication-related actions
 */
export class AuthPage {
  constructor(private page: Page) {}

  async login(username: string, password: string) {
    // Click login button to open Azure AD popup
    const dialogPromise = this.page.waitForEvent('popup');
    await this.page.getByText('LOGIN').click();
    const dialog = await dialogPromise;

    // Fill in credentials
    await dialog.getByPlaceholder('Email, phone, or Skype').fill(username);
    await dialog.getByRole('button', { name: 'Next' }).click();
    await dialog.getByPlaceholder('Password').fill(password);
    await dialog.getByRole('button', { name: 'Sign in' }).click();

    // Handle "Stay signed in?" prompt
    try {
      await dialog.getByRole('button', { name: 'No' }).click();
    } catch (e) {
      // Prompt may not appear
    }

    // Handle consent dialog
    try {
      await dialog.waitForURL('**/Consent/**', { timeout: 5000 });
      await dialog.getByRole('button', { name: 'Yes' }).click();
    } catch (e) {
      // Consent dialog may not appear
    }

    // Wait for login to complete
    await this.page.waitForLoadState('networkidle');
  }

  async logout() {
    const logoutButton = this.page.getByText('Sign out').or(this.page.getByText('Logout'));
    await logoutButton.click();
    
    // Handle confirmation if present
    try {
      await this.page.getByRole('button', { name: 'Confirm' }).click({ timeout: 2000 });
    } catch (e) {
      // No confirmation dialog
    }
  }

  async verifyLoggedIn() {
    // Check for user menu or logout button
    const userIndicators = [
      this.page.getByTestId('user-menu'),
      this.page.getByText('Sign out'),
      this.page.getByText('Logout')
    ];

    let found = false;
    for (const indicator of userIndicators) {
      try {
        await expect(indicator).toBeVisible({ timeout: 2000 });
        found = true;
        break;
      } catch (e) {
        continue;
      }
    }

    if (!found) {
      throw new Error('Could not verify user is logged in');
    }
  }

  async verifyLoggedOut() {
    // Should see login button or be on login page
    const loginIndicators = [
      this.page.getByText('LOGIN'),
      this.page.getByText('Sign in'),
      this.page.getByRole('button', { name: 'Login' })
    ];

    let found = false;
    for (const indicator of loginIndicators) {
      try {
        await expect(indicator).toBeVisible({ timeout: 2000 });
        found = true;
        break;
      } catch (e) {
        continue;
      }
    }

    if (!found) {
      // Check if we're on login page by URL
      expect(this.page.url()).toMatch(/(login|auth|signin)/);
    }
  }
}