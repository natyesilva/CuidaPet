import { expect, test } from '@playwright/test'

function fakeJwt() {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString('base64url')
  const exp = Math.floor(Date.now() / 1000) + 3600
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: 'user-1', exp, role: 'authenticated' })}.assinatura`
}

const user = {
  id: 'user-1',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'tutora@email.com',
  app_metadata: {},
  user_metadata: { name: 'Tutora' },
  created_at: '2026-01-01T00:00:00Z',
}

test('link de recuperação na raiz abre a tela de nova senha e salva', async ({ page }) => {
  let updatedPassword = ''

  await page.route('**/auth/v1/user', async (route) => {
    if (route.request().method() === 'PUT') {
      updatedPassword = route.request().postDataJSON().password
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(user) })
  })
  await page.route('**/rest/v1/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })

  await page.goto(`/#access_token=${fakeJwt()}&refresh_token=refresh&expires_in=3600&token_type=bearer&type=recovery`)

  await expect(page).toHaveURL('/app/reset-password')
  await page.getByLabel('Nova senha', { exact: true }).fill('novaSenha123')
  await page.getByLabel('Confirme a nova senha').fill('novaSenha123')
  await page.getByRole('button', { name: 'Salvar nova senha' }).click()

  await expect(page.getByRole('heading', { name: 'Senha alterada' })).toBeVisible()
  expect(updatedPassword).toBe('novaSenha123')
})

test('link expirado mostra opção de solicitar novamente', async ({ page }) => {
  await page.goto('/app/reset-password#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired')

  await expect(page.getByRole('heading', { name: 'Não foi possível validar' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Solicitar novamente' })).toBeVisible()
})
