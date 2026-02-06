import { test as base } from '@playwright/test';

// Define types for our fixtures
type AuthenticatedUser = {
  email: string;
  name: string;
};

type MyFixtures = {
  authenticatedUser: AuthenticatedUser;
};

// Extend base test with custom fixtures
export const test = base.extend<MyFixtures>({
  authenticatedUser: async ({ page }, use) => {
    // This fixture provides user information for authenticated tests
    const user = {
      email: process.env.AADUSERNAME || 'test@example.com',
      name: 'Test User'
    };
    
    await use(user);
  },
});

export { expect } from '@playwright/test';