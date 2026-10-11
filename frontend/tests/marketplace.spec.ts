import { test, expect } from '@playwright/test'

test.describe('Kurio marketplace', () => {
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

  test('discovers NFTs and navigates to a detail page', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /SEJA DONO/i })).toBeVisible()
    await expect(page.locator('.nft-card').first()).toBeVisible()
    await page.locator('.nft-card').first().click()
    await expect(page).toHaveURL(/\/nfts\/\d+/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('registers a collector and shows the profile', async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel('Nome de usuário*').fill('playwright-collector')
    await page.getByLabel('E-mail*').fill(`collector-${Date.now()}@example.com`)
    await page.locator('input[type="password"]').nth(0).fill('Senha123!')
    await page.locator('input[type="password"]').nth(1).fill('Senha123!')
    await page.getByRole('button', { name: 'Criar perfil' }).click()
    await expect(page).toHaveURL('/profile')
    await expect(page.getByRole('heading', { name: 'Perfil do colecionador' })).toBeVisible()
  })

  test('updates quantity optimistically and completes checkout', async ({ page }) => {
    await page.goto('/cart')
    await expect(page.getByRole('heading', { name: /Carrinho de NFTs|Resumo da carteira/ })).toBeVisible()
    await page.getByRole('button', { name: 'Aumentar quantidade' }).first().click()
    await expect(page.getByRole('status')).toContainText('Quantidade atualizada')
    await page.getByRole('link', { name: 'Conectar e finalizar' }).click()
    const checkoutField = (label: string) =>
      page.locator('form label').filter({ hasText: label }).locator('..').locator('input')
    await checkoutField('Nome de exibição').fill('Adriano Colecionador')
    await checkoutField('Nome de usuário').fill('adrianonfts')
    await checkoutField('Nome do perfil').fill('adrianonfts.eth')
    await checkoutField('Endereço da carteira').fill('0xA91F00000000000000000000000000000000E82C')
    await checkoutField('Código de indicação').fill('PLAYWRIGHT')
    await checkoutField('E-mail').fill('contato@email.com')
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await expect(page).toHaveURL('/checkout/success')
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible()
  })

  test('footer actions navigate and newsletter validates', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Carteira e segurança' }).click()
    await expect(page).toHaveURL('/wallets')
    await page.goto('/')
    await page.getByLabel('E-mail da newsletter').fill('newsletter@example.com')
    await page.getByRole('button', { name: /Enviar/ }).click()
    await expect(page.getByText('Inscrição realizada com sucesso!')).toBeVisible()
  })

  test('persists catalog search in the URL and toggles favorites', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile-chromium', 'The desktop toolbar search flow is covered in Chromium desktop')
    await page.goto('/')
    const search = page.getByRole('textbox', { name: 'Busca' })
    await search.fill('Emerald')
    await search.press('Enter')
    await expect(page).toHaveURL(/[?&]search=Emerald/)
    await page.locator('.nft-card').first().click()
    const favorite = page.getByRole('button', { name: /Favoritar|Favoritado/ })
    await favorite.click()
    await expect(favorite).toHaveAttribute('aria-pressed', 'true')
  })

  test('applies the deterministic coupon in the cart', async ({ page }) => {
    await page.goto('/cart')
    await page.getByPlaceholder('Digite o código promocional...').fill('KURIO10')
    await page.getByRole('button', { name: 'Aplicar', exact: true }).click()
    await expect(page.getByRole('status')).toContainText('Cupom aplicado')
  })
})
