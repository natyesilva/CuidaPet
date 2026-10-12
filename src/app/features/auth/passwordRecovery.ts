export type RecoveryUrlParams =
  | { kind: 'tokens'; accessToken: string; refreshToken: string }
  | { kind: 'tokenHash'; tokenHash: string }
  | { kind: 'error'; message: string }
  | { kind: 'none' }

export const passwordResetPath = '/app/reset-password'

function toParams(value: string) {
  return new URLSearchParams(value.replace(/^[?#]/, ''))
}

// O Supabase devolve os tokens de recuperação no hash (fluxo implícito)
// ou como token_hash na query, quando o template de e-mail é customizado.
export function parseRecoveryUrl(search: string, hash: string): RecoveryUrlParams {
  const query = toParams(search)
  const fragment = toParams(hash)

  const errorDescription =
    fragment.get('error_description') ?? query.get('error_description')
  if (errorDescription || fragment.get('error') || query.get('error')) {
    return { kind: 'error', message: errorDescription ?? 'Link inválido.' }
  }

  const accessToken = fragment.get('access_token')
  const refreshToken = fragment.get('refresh_token')
  if (fragment.get('type') === 'recovery' && accessToken && refreshToken) {
    return { kind: 'tokens', accessToken, refreshToken }
  }

  const tokenHash = query.get('token_hash')
  if (query.get('type') === 'recovery' && tokenHash) {
    return { kind: 'tokenHash', tokenHash }
  }

  return { kind: 'none' }
}

export function isRecoveryRedirect(search: string, hash: string) {
  const params = parseRecoveryUrl(search, hash)
  return params.kind === 'tokens' || params.kind === 'tokenHash'
}

// No APK a origem é https://localhost, que não abre fora do app; nesse caso
// usa a URL pública configurada ou deixa o Supabase cair no Site URL.
export function getPasswordResetRedirectUrl(
  origin: string,
  isNative: boolean,
  publicSiteUrl?: string,
) {
  const baseUrl = publicSiteUrl?.trim() || (isNative ? '' : origin)
  if (!baseUrl) return undefined

  return `${baseUrl.replace(/\/+$/, '')}${passwordResetPath}`
}
