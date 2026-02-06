# Playwright Azure AD Authentication Example

This project demonstrates how to handle Azure AD (Entra ID) authentication in Playwright tests, following the best practices outlined in [Marcus Felling's tutorial](https://marcusfelling.com/blog/2023/handling-azure-ad-authentication-with-playwright/).

## Features

- ✅ Azure AD authentication setup with environment variables
- ✅ Reusable authentication state across tests
- ✅ Separate test projects for authenticated and non-authenticated tests
- ✅ GitHub Actions CI/CD pipeline
- ✅ Comprehensive test examples
- ✅ Security best practices with .env files

## Prerequisites

1. **Node.js** (version 18 or later)
2. **Azure AD tenant** with a test application configured
3. **Test user account** in Azure AD with appropriate permissions
4. **Application under test** that uses Azure AD authentication

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd playwright-azure-ad-example
npm install
npx playwright install
```

### 2. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```bash
# Azure AD Credentials
AADUSERNAME=your-test-user@yourdomain.com
AADPASSWORD=your-test-password

# Application URL
APP_URL=https://your-app.azurewebsites.net

# Optional: Azure AD Tenant settings
TENANT_ID=your-tenant-id
CLIENT_ID=your-client-id
```

### 3. Run Tests

```bash
# Run all tests
npm test

# Run only authenticated tests
npm run test:authenticated

# Run tests in headed mode (visible browser)
npm run test:headed

# Open Playwright UI for debugging
npm run test:ui
```

## Project Structure

```
playwright-azure-ad-example/
├── .auth/                          # Authentication state storage (gitignored)
├── .github/workflows/              # GitHub Actions CI/CD
│   └── playwright.yml
├── tests/                          # Test files
│   ├── auth.setup.ts              # Authentication setup script
│   ├── authenticated.auth.spec.ts # Tests requiring authentication
│   └── public.spec.ts             # Tests for public pages
├── .env                           # Environment variables (gitignored)
├── .env.example                   # Environment template
├── .gitignore                     # Git ignore rules
├── package.json                   # Dependencies and scripts
├── playwright.config.ts           # Playwright configuration
└── README.md                      # This file
```

## How It Works

### Authentication Flow

1. **Setup Phase**: The `auth.setup.ts` script runs first and:
   - Navigates to your application
   - Clicks the login button to open Azure AD popup
   - Fills in credentials from environment variables
   - Handles consent dialogs and "stay signed in" prompts
   - Saves the authenticated state to `.auth/user.json`

2. **Test Execution**: Authenticated tests automatically:
   - Load the saved authentication state
   - Skip the login process
   - Run with full user context

### Test Projects

The project is configured with multiple test projects:

- **setup**: Runs authentication setup before other tests
- **authenticated**: Tests that require user authentication
- **chromium/firefox/webkit**: Tests for public pages across browsers

## Configuration

### Playwright Config

The [playwright.config.ts](playwright.config.ts) file includes:

- Project dependencies to ensure setup runs first
- Storage state configuration for authenticated tests
- Environment variable support
- Reporter configuration for CI/CD

### Authentication Setup

The [tests/auth.setup.ts](tests/auth.setup.ts) file handles:

- Environment variable validation
- Azure AD login flow automation
- Consent dialog handling
- Authentication state persistence

## Customization

### Adapting to Your Application

You'll need to modify these selectors based on your application:

```typescript
// In auth.setup.ts - adjust login button selector
await page.getByText('LOGIN').click();
// Alternatives:
// await page.getByRole('button', { name: 'Sign in' }).click();
// await page.locator('[data-testid="login-button"]').click();

// In test files - adjust authentication verification
await expect(page.getByTestId('user-menu')).toBeVisible();
// Or check for logout button:
// await expect(page.getByText('Sign out')).toBeVisible();
```

### Adding New Tests

1. **For authenticated tests**: Create files ending with `.auth.spec.ts`
2. **For public tests**: Create files ending with `.spec.ts` (not `.auth.spec.ts`)

Example authenticated test:

```typescript
import { test, expect } from '@playwright/test';

test('should access user dashboard', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
```

## CI/CD with GitHub Actions

### Setting Up Secrets

In your GitHub repository, go to Settings > Secrets and variables > Actions, and add:

- `AADUSERNAME`: Your test user email
- `AADPASSWORD`: Your test user password
- `APP_URL`: Your application URL
- `TENANT_ID`: (Optional) Your Azure AD tenant ID
- `CLIENT_ID`: (Optional) Your application client ID

### Workflow Features

The GitHub Actions workflow:

- Runs on push and pull requests
- Sets up Node.js and installs dependencies
- Installs Playwright browsers
- Runs all tests with proper environment variables
- Uploads test reports and artifacts

## Best Practices

### Security

- ✅ Store credentials in environment variables, never in code
- ✅ Use `.env` files for local development
- ✅ Add `.env` and `.auth/` to `.gitignore`
- ✅ Use GitHub Secrets for CI/CD
- ✅ Create dedicated test accounts with minimal permissions

### Azure AD Setup

- ✅ Create a separate Azure AD tenant for testing
- ✅ Disable MFA and security defaults for test accounts (recommended)
- ⚠️ **If MFA is required**: The script supports MFA but requires manual approval during test execution
- ✅ Consider conditional access policies to bypass login in test environments
- ✅ Grant application permissions to test users ahead of time

### MFA (Multi-Factor Authentication) Considerations

**Recommended Approach**: Disable MFA for test accounts to enable fully automated testing.

**If MFA must be enabled**:
- The auth script will detect MFA prompts and wait for manual approval
- Tests will pause for up to 2 minutes waiting for you to approve the sign-in request
- Consider using "Don't ask again for 90 days" option to reduce MFA frequency
- Run tests in headed mode (`npm run test:headed`) to see MFA prompts

### Test Organization

- ✅ Use project dependencies to ensure setup runs first
- ✅ Separate authenticated and public tests
- ✅ Reuse authentication state across tests
- ✅ Use descriptive test and file names

## Troubleshooting

### Common Issues

**Authentication fails with "credentials not found"**
- Verify environment variables are set correctly
- Check that `.env` file exists and is not committed to git

**Login popup doesn't appear**
- Verify the login button selector matches your application
- Check if your app uses a different authentication flow

**Consent dialog not handled**
- First-time login requires manual consent or modify the script
- Consider pre-granting permissions in Azure AD

**Tests fail in CI but pass locally**
- Verify GitHub Secrets are configured correctly
- Check that the application URL is accessible from GitHub Actions runners

### Debugging

Use these commands for debugging:

```bash
# Run tests in debug mode
npm run test:debug

# Run with visible browser
npm run test:headed

# Generate test code using codegen
npm run codegen
```

### Useful Playwright Commands

```bash
# Show test report
npm run report

# Update Playwright
npm update @playwright/test

# Install specific browser
npx playwright install chromium
```

## Advanced Configuration

### Multiple Environments

You can create different environment files:

```bash
# Development
.env.dev

# Staging  
.env.staging

# Production
.env.prod
```

Load them conditionally:

```typescript
import * as dotenv from 'dotenv';

const environment = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${environment}` });
```

### Custom Authentication Flow

For complex authentication flows, extend the setup script:

```typescript
// Handle custom forms or additional steps
await dialog.getByLabel('Department').selectOption('IT');
await dialog.getByLabel('Access Level').selectOption('Admin');
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Azure AD Authentication Guide](https://docs.microsoft.com/en-us/azure/active-directory/)
- [Original Tutorial by Marcus Felling](https://marcusfelling.com/blog/2023/handling-azure-ad-authentication-with-playwright/)
- [Playwright Authentication Docs](https://playwright.dev/docs/auth)

## License

MIT License - see LICENSE file for details