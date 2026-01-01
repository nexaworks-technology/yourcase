import { test, expect } from '@playwright/test'

test.describe('Settings → Recent toasts export previews', () => {
  test('Preview JSON: open, copy, download', async ({ page, context }) => {
    await page.goto('/settings#recent-toasts', { waitUntil: 'networkidle' })
    // Wait for header text or preview button as a fallback
    await Promise.race([
      page.waitForSelector('text=Recent toasts'),
      page.getByRole('button', { name: 'Preview JSON' }).waitFor(),
    ])
    await page.getByRole('button', { name: 'Preview JSON' }).click()
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal.getByText('Showing a sample. Full export includes all filtered items.')).toBeVisible()

    // Copy all
    await modal.getByRole('button', { name: 'Copy all' }).click()

    // Download JSON now
    const [ download ] = await Promise.all([
      page.waitForEvent('download'),
      modal.getByRole('button', { name: 'Download now' }).click(),
    ])
    const filename = download.suggestedFilename()
    expect(filename.endsWith('.json')).toBeTruthy()
    await modal.getByRole('button', { name: 'Close' }).click()
  })

  test('Preview ZIP: toggle tabs and copy', async ({ page }) => {
    await page.goto('/settings#recent-toasts', { waitUntil: 'networkidle' })
    await Promise.race([
      page.waitForSelector('text=Recent toasts'),
      page.getByRole('button', { name: 'Preview ZIP' }).waitFor(),
    ])
    await page.getByRole('button', { name: 'Preview ZIP' }).click()
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    // Switch to CSV tab
    await modal.getByRole('button', { name: 'CSV' }).click()
    await modal.getByRole('button', { name: 'Copy all' }).click()
    await modal.getByRole('button', { name: 'Close' }).click()
  })

  test('Export chip → Preview reopens last export', async ({ page }) => {
    await page.goto('/settings#recent-toasts', { waitUntil: 'networkidle' })
    await Promise.race([
      page.waitForSelector('text=Recent toasts'),
      page.getByRole('button', { name: 'Export JSON' }).waitFor(),
    ])
    await page.getByRole('button', { name: 'Export JSON' }).click()
    const chip = page.getByText('Export').locator('..')
    await expect(chip).toBeVisible()
    await chip.getByRole('button', { name: 'Preview last export' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })
})
