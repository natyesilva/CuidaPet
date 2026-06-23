export function getFriendlyDataError(error: unknown) {
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof error.message === 'string'
        ? error.message
        : ''
  const message = rawMessage.toLowerCase()

  if (
    (message.includes('relation') && message.includes('does not exist')) ||
    message.includes('schema cache') ||
    message.includes('could not find the table')
  ) {
    return 'As tabelas do aplicativo ainda não foram criadas no Supabase.'
  }
  if (message.includes('row-level security') || message.includes('permission denied')) {
    return 'Você não tem permissão para acessar estes dados. Entre novamente.'
  }
  if (message.includes('failed to fetch') || message.includes('network')) {
    return 'Não foi possível conectar ao Supabase. Verifique sua internet.'
  }
  if (message.includes('sessão expirada')) {
    return 'Sua sessão expirou. Entre novamente.'
  }

  return 'Não foi possível concluir a operação. Tente novamente em alguns instantes.'
}
