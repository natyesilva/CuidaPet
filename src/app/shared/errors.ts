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

  if (message.includes('pet_photo_bucket_missing')) {
    return 'O bucket de fotos ainda não foi criado no Supabase. Execute o schema atualizado ou crie o bucket pet-photos no Storage.'
  }
  if (message.includes('pet_photo_storage_permission_denied')) {
    return 'O bucket de fotos está sem permissão para envio. Verifique as policies do Supabase Storage para o bucket pet-photos.'
  }
  if (message.includes('pet_photo_file_too_large')) {
    return 'A foto está muito grande para envio. Tente escolher uma imagem menor.'
  }
  if (message.includes('pet_photo_upload_failed')) {
    return 'Não foi possível enviar a foto do pet. Verifique o Supabase Storage e tente novamente.'
  }
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
