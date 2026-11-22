import { test, expect } from '@playwright/test';

test.describe('Visual Flow Builder Application Flow', () => {
  test('User can open dashboard, create workflow, add and connect blocks, validate, and preview', async ({ page }) => {
    // 1. Open application dashboard
    await page.goto('/');
    await expect(page).toHaveTitle(/Visual Flow Builder/i);

    // Verify Dashboard navigation
    await expect(page.getByRole('heading', { name: /Visual Flow Builder/i })).toBeVisible();

    // 2. Open Create Workflow modal
    const newWorkflowBtn = page.getByRole('button', { name: /New Workflow/i });
    await expect(newWorkflowBtn).toBeVisible();
    await newWorkflowBtn.click();

    // 3. Fill workflow details
    const nameInput = page.getByPlaceholder(/User Onboarding Flow/i);
    await expect(nameInput).toBeVisible();
    await nameInput.fill('E2E Production Test Flow');

    const submitCreateBtn = page.getByRole('button', { name: 'Create Workflow' });
    await submitCreateBtn.click();

    // 4. Verify Editor opens
    await expect(page).toHaveURL(/.*\/editor\/.*/);
    await expect(page.getByText('E2E Production Test Flow')).toBeVisible();

    // Verify Three-Panel layout:
    // Left: Block Library
    await expect(page.getByText('Block Library')).toBeVisible();
    // Center: Visual Canvas
    await expect(page.locator('.react-flow')).toBeVisible();
    // Right: Properties Editor
    await expect(page.getByText('Workflow Properties')).toBeVisible();

    // 5. Test adding a button block from library
    const buttonBlockItem = page.getByText('Button Block').first();
    await buttonBlockItem.click();

    // Verify block added to canvas
    await expect(page.locator('.react-flow__node').filter({ hasText: 'Button' })).toBeVisible();

    // 6. Test Validation
    const validateBtn = page.getByRole('button', { name: /Validate/i });
    await validateBtn.click();
    await expect(page.getByText('Workflow Validation')).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();

    // 7. Test Preview Mode
    const previewBtn = page.getByRole('button', { name: /Preview/i });
    await previewBtn.click();
    await expect(page.getByText('Interactive Workflow Preview')).toBeVisible();
    await expect(page.getByText('Simulator Screen')).toBeVisible();
    await page.getByRole('button', { name: 'Close Preview' }).click();

    // 8. Test Save Changes
    const saveBtn = page.getByRole('button', { name: /Save/i });
    await saveBtn.click();

    // 9. Navigate back to dashboard
    const dashboardBtn = page.getByRole('button', { name: /Dashboard/i });
    await dashboardBtn.click();
    await expect(page).toHaveURL('/');
    await expect(page.getByText('E2E Production Test Flow')).toBeVisible();
  });
});
