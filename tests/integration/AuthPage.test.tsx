import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from '../../src/app/features/auth/AuthPage'
import { ForgotPasswordPage, ResetPasswordPage } from '../../src/app/features/auth/PasswordRecoveryPage'

const authMocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  requestPasswordReset: vi.fn(),
  updatePassword: vi.fn(),
  signOut: vi.fn(),
  session: null as { user: { id: string } } | null,
  isLoading: false,
}))

vi.mock('../../src/app/features/auth/auth-context', () => ({
  useAuth: () => authMocks,
}))

describe('LoginPage', () => {
  beforeEach(() => {
    authMocks.signIn.mockReset()
    authMocks.signUp.mockReset()
    authMocks.requestPasswordReset.mockReset()
    authMocks.updatePassword.mockReset()
    authMocks.signOut.mockReset()
    authMocks.signIn.mockResolvedValue(undefined)
    authMocks.requestPasswordReset.mockResolvedValue(undefined)
    authMocks.updatePassword.mockResolvedValue(undefined)
    authMocks.signOut.mockResolvedValue(undefined)
    authMocks.session = null
    authMocks.isLoading = false
  })

  it('não exibe o aviso visual de acesso demo', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.queryByText('Acesso de demonstração')).not.toBeInTheDocument()
    expect(screen.queryByText('Admin123')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Esqueci minha senha' })).toHaveAttribute(
      'href',
      '/app/forgot-password',
    )
    expect(screen.getByLabelText('E-mail')).toHaveAttribute(
      'placeholder',
      'voce@email.com',
    )
  })

  it('continua enviando as credenciais digitadas ao fluxo de login', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('E-mail'), 'Test')
    await user.type(screen.getByLabelText('Senha'), 'Admin123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(authMocks.signIn).toHaveBeenCalledWith('Test', 'Admin123')
    })
  })

  it('envia o pedido de recuperação de senha por e-mail', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('E-mail'), 'natalia@email.com')
    await user.click(screen.getByRole('button', { name: 'Enviar link' }))

    await waitFor(() => {
      expect(authMocks.requestPasswordReset).toHaveBeenCalledWith(
        'natalia@email.com',
      )
    })
    expect(
      screen.getByText(/Se o e-mail estiver cadastrado/),
    ).toBeInTheDocument()
  })

  it('salva a nova senha no fluxo de recuperação', async () => {
    authMocks.session = { user: { id: 'user-1' } }
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Nova senha'), 'NovaSenha123')
    await user.type(
      screen.getByLabelText('Confirmar nova senha'),
      'NovaSenha123',
    )
    await user.click(screen.getByRole('button', { name: 'Salvar nova senha' }))

    await waitFor(() => {
      expect(authMocks.updatePassword).toHaveBeenCalledWith('NovaSenha123')
    })
    expect(authMocks.signOut).toHaveBeenCalled()
    expect(screen.getByText(/Senha atualizada/)).toBeInTheDocument()
  })
})
