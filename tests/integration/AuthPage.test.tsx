import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from '../../src/app/features/auth/AuthPage'

const authMocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}))

vi.mock('../../src/app/features/auth/auth-context', () => ({
  useAuth: () => authMocks,
}))

describe('LoginPage', () => {
  beforeEach(() => {
    authMocks.signIn.mockReset()
    authMocks.signUp.mockReset()
    authMocks.signIn.mockResolvedValue(undefined)
  })

  it('não exibe o aviso visual de acesso demo', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.queryByText('Acesso de demonstração')).not.toBeInTheDocument()
    expect(screen.queryByText('Admin123')).not.toBeInTheDocument()
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
})

