import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from '../../src/app/features/auth/AuthPage'
import { ForgotPasswordPage } from '../../src/app/features/auth/PasswordRecoveryPage'

const authMocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  requestPasswordReset: vi.fn(),
  verifyRecoveryCode: vi.fn(),
}))

vi.mock('../../src/app/features/auth/auth-context', () => ({
  useAuth: () => authMocks,
}))

function renderForgotPassword() {
  render(
    <MemoryRouter initialEntries={['/app/forgot-password']}>
      <Routes>
        <Route path="/app/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/app/reset-password" element={<p>Tela de nova senha</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Recuperação de senha', () => {
  beforeEach(() => {
    Object.values(authMocks).forEach((mock) => mock.mockReset())
    authMocks.requestPasswordReset.mockResolvedValue(undefined)
    authMocks.verifyRecoveryCode.mockResolvedValue(undefined)
  })

  it('exibe o link de esqueci a senha no login', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Esqueci minha senha' })).toHaveAttribute(
      'href',
      '/app/forgot-password',
    )
  })

  it('solicita o e-mail e valida o código antes de abrir a nova senha', async () => {
    const user = userEvent.setup()
    renderForgotPassword()

    await user.type(screen.getByLabelText('E-mail'), 'tutora@email.com')
    await user.click(screen.getByRole('button', { name: 'Enviar instruções' }))

    expect(authMocks.requestPasswordReset).toHaveBeenCalledWith('tutora@email.com')

    await user.type(await screen.findByLabelText('Código do e-mail'), '123456')
    await user.click(screen.getByRole('button', { name: 'Validar código' }))

    await waitFor(() => {
      expect(authMocks.verifyRecoveryCode).toHaveBeenCalledWith('tutora@email.com', '123456')
    })
    expect(await screen.findByText('Tela de nova senha')).toBeInTheDocument()
  })

  it('mostra erro amigável quando o código expirou', async () => {
    const user = userEvent.setup()
    authMocks.verifyRecoveryCode.mockRejectedValue(new Error('Token has expired or is invalid'))
    renderForgotPassword()

    await user.type(screen.getByLabelText('E-mail'), 'tutora@email.com')
    await user.click(screen.getByRole('button', { name: 'Enviar instruções' }))
    await user.type(await screen.findByLabelText('Código do e-mail'), '123456')
    await user.click(screen.getByRole('button', { name: 'Validar código' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('inválido ou expirado')
  })
})
