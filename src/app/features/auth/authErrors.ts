export function getFriendlyAuthError(message: string) {
  const normalized = message.toLowerCase()

  if (normalized.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos.'
  }
  if (normalized.includes('user already registered')) {
    return 'Este e-mail já possui uma conta.'
  }
  if (normalized.includes('different from the old password')) {
    return 'A nova senha precisa ser diferente da senha atual.'
  }
  if (normalized.includes('password should be')) {
    return 'A senha precisa ter pelo menos 6 caracteres.'
  }
  if (normalized.includes('expired') || normalized.includes('invalid')) {
    return 'Código ou link inválido ou expirado. Solicite uma nova recuperação de senha.'
  }
  if (
    normalized.includes('rate limit') ||
    normalized.includes('for security purposes')
  ) {
    return 'Muitas tentativas seguidas. Aguarde um pouco e tente novamente.'
  }

  return 'Não foi possível concluir agora. Revise os dados e tente novamente.'
}
