import { test, expect, type Page } from '@playwright/test'

test.describe('visual regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(async () => {
      await fetch('/__mock/reset', { method: 'POST' })
      sessionStorage.clear()
    })
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('contato@email.com')
    await page.locator('input[type="password"]').fill('123456')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL('/profile')
  })

  for (const route of ['/', '/cart', '/checkout']) {
    test(`${route} matches the desktop baseline`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'chromium', 'Desktop baselines run in Chromium desktop only')
      await page.goto(route)
      await waitForRoute(page, route)
      await expect(page).toHaveScreenshot(`${route === '/' ? 'home' : route.slice(1)}-desktop.png`, { fullPage: true })
    })
  }

  test('home matches the mobile baseline', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-chromium', 'Mobile baseline runs in Pixel 5 only')
    await page.goto('/')
    await waitForRoute(page, '/')
    await expect(page).toHaveScreenshot('home-mobile.png', { fullPage: true })
  })
})

async function waitForRoute(page: Page, route: string) {
  const heading = route === '/'
    ? /SEJA DONO/i
    : route === '/cart'
      ? /Carrinho de NFTs|Resumo da carteira/
      : 'Perfil do colecionador'
  await expect(page.getByRole('heading', { name: heading })).toBeVisible()
  if (route === '/') await expect(page.locator('.nft-card').first()).toBeVisible()
  if (route === '/cart') await expect(page.getByRole('button', { name: 'Aumentar quantidade' }).first()).toBeVisible()
  if (route === '/checkout') await expect(page.locator('form img').first()).toBeVisible()
}
