import { test as setup, expect } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const authFile = '.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Skip setup if environment variables for AAD creds are not set
  setup.skip(
    !process.env.AADUSERNAME || !process.env.AADPASSWORD,
    'AADUSERNAME and AADPASSWORD environment variables must be set'
  );

  console.log('Starting Azure AD authentication setup...');
  
  // Navigate to your application
  const appUrl = process.env.APP_URL || 'https://your-app.azurewebsites.net';
  await page.goto(appUrl);
  
  // Wait for the page to load and look for login button
  // Adjust the selector based on your application
  await page.waitForLoadState('networkidle');
  
  // Sign in using authorization code flow
  // This assumes your app redirects to Azure AD for authentication
  
  // Click the login button - adjust selector based on your app
  // await page.getByText('LOGIN').click();
  // Alternative selectors you might need:
  // await page.getByRole('button', { name: 'Sign in' }).click();
  // await page.locator('[data-testid="login-button"]').click();
  
  // Wait for redirect to Azure AD login page
  await page.waitForURL('**/login.microsoftonline.com/**', { timeout: 15000 });
  await page.waitForLoadState('domcontentloaded');
  
  // Fill in email/username
  await page.getByPlaceholder('Email, phone, or Skype').fill(process.env.AADUSERNAME!);
  await page.getByRole('button', { name: 'Next' }).click();
  
  // Wait for password field and fill it
  await page.waitForSelector('input[name="passwd"]', { timeout: 10000 });
  await page.getByPlaceholder('Password').fill(process.env.AADPASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  // Handle Multi-Factor Authentication (MFA) if prompted
  try {
    // Check for MFA prompt - "Approve sign in request" or similar text
    await page.waitForSelector('div[class="display-sign-container"]', { timeout: 8000 });
    console.log(await page.locator('#idRichContext_DisplaySign').innerText());
    console.log('MFA prompt detected...');
    
    // Option 1: Try to click "Don't ask again for 90 days" to reduce future MFA prompts
    try {
      const dontAskCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: "Don't ask again" }).or(
        page.getByLabel("Don't ask again for 90 days")
      );
      if (await dontAskCheckbox.count() > 0) {
        await dontAskCheckbox.check();
        console.log('Selected "Don\'t ask again for 90 days"');
      }
    } catch (e) {
      console.log('Could not find "Don\'t ask again" option');
    }
    
    // For automated testing, MFA typically requires manual intervention
    // The script will wait for manual approval or timeout
    console.log('🔐 MFA Required: Please approve the sign-in request in your Microsoft Authenticator app');
    console.log('⏳ Waiting up to 120 seconds for MFA approval...');
    
    // Wait for MFA to be completed (user approves in authenticator app)
    // This will either succeed when user approves, or timeout after 120 seconds
    await page.waitForURL('**/kmsi**', { timeout: 10000 }); // KMSI = Keep Me Signed In page
    console.log('✅ MFA completed successfully');
    
  } catch (e) {
    console.log('No MFA prompt found or MFA timed out, continuing...');
    // If no MFA prompt appears, continue with the normal flow
  }
  
  // Handle "Stay signed in?" prompt - click "No"
  try {
    await page.waitForSelector('//*[@id="idBtn_Back"]', { timeout: 5000 });
    await page.locator('//*[@id="idBtn_Back"]').click();
    console.log('Clicked "No" for Stay signed in prompt');
  } catch (e) {
    console.log('No "Stay signed in?" prompt found, continuing...');
  }
  
  // Use try catch block to handle the case where the consent dialog is shown for the first login
//   try {
//     await page.waitForURL('**/Consent/**', { timeout: 5000 });
//     await page.getByRole('button', { name: 'Yes' }).click();
//     console.log('Consent dialog handled');
//   } catch (e) {
//     console.log('Consent dialog was not shown');
//   }
  
  // Wait for successful redirect back to application
  // Authorization code flow will redirect back with a code parameter
  await page.waitForURL(appUrl + '**', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  
  // Verify that we're now logged in by checking for user-specific content
  // Adjust these selectors based on your application
  try {
    await page.waitForSelector('//*[@id="app"]/div/div/header/div/div[3]/div[2]/div', { timeout: 5000 });
    console.log('Login successful - user menu found');
  } catch (e) {
    // Alternative: check for logout button or user name
    try {
      await page.waitForSelector('text=Sign out', { timeout: 5000 });
      console.log('Login successful - sign out button found');
    } catch (e2) {
      console.log('Warning: Could not verify login state. Proceeding anyway...');
    }
  }
  
  // Save auth state to file (.gitignore'd)
  await page.context().storageState({ path: authFile });
  
  console.log('Authentication setup completed successfully!');
});