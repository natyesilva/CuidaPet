import { describe, expect, it } from 'vitest'
import {
  getPasswordResetRedirectUrl,
  isRecoveryRedirect,
  parseRecoveryUrl,
} from '../../src/app/features/auth/passwordRecovery'

describe('parseRecoveryUrl', () => {
  it('lê os tokens do hash no fluxo implícito', () => {
    expect(
      parseRecoveryUrl('', '#access_token=abc&refresh_token=def&type=recovery'),
    ).toEqual({ kind: 'tokens', accessToken: 'abc', refreshToken: 'def' })
  })

  it('lê o token_hash da query', () => {
    expect(parseRecoveryUrl('?token_hash=xyz&type=recovery', '')).toEqual({
      kind: 'tokenHash',
      tokenHash: 'xyz',
    })
  })

  it('retorna erro quando o Supabase informa link expirado', () => {
    expect(
      parseRecoveryUrl('', '#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired'),
    ).toEqual({ kind: 'error', message: 'Email link is invalid or has expired' })
  })

  it('ignora tokens que não são de recuperação', () => {
    expect(
      parseRecoveryUrl('', '#access_token=abc&refresh_token=def&type=signup'),
    ).toEqual({ kind: 'none' })
    expect(isRecoveryRedirect('', '#access_token=abc&refresh_token=def&type=signup')).toBe(false)
    expect(isRecoveryRedirect('', '#access_token=abc&refresh_token=def&type=recovery')).toBe(true)
  })
})

describe('getPasswordResetRedirectUrl', () => {
  it('usa a origem atual no web', () => {
    expect(getPasswordResetRedirectUrl('https://cuidapet.app', false)).toBe(
      'https://cuidapet.app/app/reset-password',
    )
  })

  it('prioriza a URL pública configurada', () => {
    expect(
      getPasswordResetRedirectUrl('https://localhost', true, 'https://cuidapet.app/'),
    ).toBe('https://cuidapet.app/app/reset-password')
  })

  it('não usa a origem local do APK', () => {
    expect(getPasswordResetRedirectUrl('https://localhost', true)).toBeUndefined()
  })
})
