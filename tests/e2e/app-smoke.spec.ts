import { expect, test } from '@playwright/test'

test('landing page continua funcionando na rota inicial', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveURL('/')
  await expect(page.getByRole('banner').getByText('CuidaPet')).toBeVisible()
  await expect(
    page.getByRole('heading', {
      name: /nunca mais se perca na rotina/i,
    }),
  ).toBeVisible()
})

test('login master entra no app sem aviso visual de demo', async ({ page }) => {
  await page.route('**/auth/v1/logout', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{}',
    })
  })

  await page.goto('/app/login')

  await expect(page.getByText('Acesso de demonstração')).toHaveCount(0)
  await expect(page.getByText('Admin123')).toHaveCount(0)

  await page.getByLabel('E-mail').fill('Test')
  await page.locator('input[autocomplete="current-password"]').fill('Admin123')
  await page.getByRole('button', { name: 'Entrar' }).click()

  await expect(page).toHaveURL(/\/app\/home/)
  await expect(
    page.getByRole('heading', { name: /olá,\s*test!/i }),
  ).toBeVisible()
  await expect(page.getByText('Resumo de hoje')).toBeVisible()
})
