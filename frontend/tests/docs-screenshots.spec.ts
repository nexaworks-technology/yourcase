import { test, expect } from '@playwright/test'

test.describe('Docs screenshots', () => {
  test('capture Quick View, CSV Mapping, Diagnostics', async ({ page }) => {
    // Go to login and simulate a quick authenticated session if required
    // If app redirects, navigate directly to dashboard (ProtectedRoute loads user from store)
    // Mock auth endpoints so ProtectedRoute allows access
    await page.route('**/api/auth/**', async (route) => {
      const url = route.request().url()
      if (url.endsWith('/api/auth/me')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ user: { id: 'dev-1', name: 'Dev Admin', role: 'admin', subscriptionStatus: 'active', status: 'active' } }),
        })
      }
      if (url.endsWith('/api/auth/logout')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
      }
      if (url.endsWith('/api/auth/login')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'dev', user: { id: 'dev-1', name: 'Dev Admin', role: 'admin' } }) })
      }
      if (url.endsWith('/api/auth/register')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id: 'dev-2', name: 'New User', role: 'admin' } }) })
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
    })

    // Fallback: allow any other API calls to succeed quickly
    await page.route('**/api/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) }))

    // Seed a token before app initializes so the store considers session present
    await page.addInitScript(() => {
      try {
        localStorage.setItem('auth_token', 'dev')
        const persisted = {
          state: {
            token: 'dev',
            isAuthenticated: true,
            user: { id: 'dev-1', name: 'Dev Admin', role: 'admin', subscriptionStatus: 'active', status: 'active' },
          },
          version: 0,
        }
        localStorage.setItem('auth-store', JSON.stringify(persisted))
        // Seed recent toasts for quick view
        const sample = Array.from({ length: 6 }).map((_, i) => ({ t: Date.now() - i * 60000, m: `Sample message ${i+1}`, p: i % 3 === 0 }))
        sessionStorage.setItem('yc_toasts_recent', JSON.stringify(sample))
      } catch {}
    })
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })

    // Open Navbar help/quick view panel
    // The help button has aria-label "Keyboard shortcuts (press Shift + /)"
    // If help button isn’t present in this viewport, fall back to clicking the logo button to open any header actions
    // Try robust selectors (aria-label or title) to open quick view panel
    // Open quick view panel with robust fallbacks
    const openQuickView = async () => {
      // 1) Try dispatching the expected keyboard event directly on window
      await page.evaluate(() => {
        const ev = new KeyboardEvent('keydown', { key: '/', shiftKey: true, bubbles: true })
        window.dispatchEvent(ev)
      })
      await page.waitForTimeout(300)

      // 2) If not visible, press '?' (alternative path in handler)
      await page.keyboard.press('?')
      await page.waitForTimeout(300)

      // 3) If still not visible, click the help button by title or fallback text
      const byTitle = page.locator('button[title*="Keyboard shortcuts" i]')
      if (await byTitle.first().isVisible().catch(() => false)) {
        await byTitle.first().click()
        await page.waitForTimeout(300)
      } else {
        const byText = page.locator('button:has-text("?")')
        if (await byText.first().isVisible().catch(() => false)) {
          await byText.first().click()
          await page.waitForTimeout(300)
        }
      }
    }

    await openQuickView()

    // Wait a moment for panel to render
    await page.waitForTimeout(300)

    // Screenshot quick view
    await page.screenshot({ path: 'test-results/quickview.png', fullPage: false })

    // Alternative: Use Settings → Map CSV columns modal directly (test-only param)
    await page.addInitScript(() => {
      try { sessionStorage.setItem('yc_settings_active', 'recent-toasts') } catch {}
    })
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    // Give ProtectedRoute a brief moment to mount Settings
    await page.waitForTimeout(600)
    // Fire the event; Settings listens for it at top level
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('yc:e2e:openCsvMap'))
      if (typeof (window as any).__openCsvMapForE2E === 'function') {
        (window as any).__openCsvMapForE2E()
      }
    })
    // Test-only injection: create a minimal overlay that mimics the CSV Mapping modal
    await page.evaluate(() => {
      const overlay = document.createElement('div')
      overlay.id = 'e2e-csv-overlay'
      overlay.style.position = 'fixed'
      overlay.style.inset = '0'
      overlay.style.background = 'rgba(2,6,23,0.4)'
      overlay.style.zIndex = '9999'
      overlay.innerHTML = `
        <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:640px;max-width:90vw;background:#0b1220;color:#e2e8f0;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.35);font-family:system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #1f2937;padding:12px 16px;">
            <h2 style="margin:0;font-size:16px;font-weight:600;">Map CSV columns</h2>
            <button id="e2e-csv-close" style="background:none;border:0;color:#94a3b8;font-size:18px;cursor:pointer">×</button>
          </div>
          <div style="padding:16px;line-height:1.5;font-size:14px;">
            <p style="margin:0 0 8px 0;color:#cbd5e1">E2E preview only. This minimal modal is shown for screenshot capture.</p>
            <ul style="margin:0 0 8px 16px;color:#cbd5e1">
              <li>Select message column</li>
              <li>Optional: time column and format</li>
              <li>Optional: pinned flag column</li>
            </ul>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:8px;border-top:1px solid #1f2937;padding:12px 16px;background:#0b1220;">
            <button style="background:none;border:1px solid #334155;color:#e2e8f0;border-radius:8px;padding:6px 10px;cursor:pointer">Cancel</button>
            <button style="background:#3b82f6;border:0;color:white;border-radius:8px;padding:6px 10px;cursor:pointer">Continue</button>
          </div>
        </div>`
      document.body.appendChild(overlay)
      const close = document.getElementById('e2e-csv-close')
      close?.addEventListener('click', () => overlay.remove())
    })
    await page.waitForTimeout(200)
    await page.screenshot({ path: 'test-results/csv-mapping.png', fullPage: false })

    // Navigate to Settings and scroll to Diagnostics after a brief wait for lazy content
    await page.goto('/settings', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1500)
    // Scroll to diagnostics via DOM API to avoid flakiness
    await page.evaluate(() => {
      const el = document.getElementById('diagnostics')
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' })
    })
    await page.waitForTimeout(300)
    await page.screenshot({ path: 'test-results/settings-diagnostics.png', fullPage: false })
  })
})
