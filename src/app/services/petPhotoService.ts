import { supabase } from '../../lib/supabase'

export const petPhotoBucketName = 'pet-photos'

function extensionFromFile(file: File) {
  const byName = file.name.split('.').pop()?.toLowerCase()
  if (byName && /^[a-z0-9]+$/.test(byName)) return byName

  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpg'
}

function toPetPhotoUploadError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof error.message === 'string'
        ? error.message
        : ''
  const normalizedMessage = message.toLowerCase()

  if (
    normalizedMessage.includes('bucket') &&
    normalizedMessage.includes('not found')
  ) {
    return new Error('pet_photo_bucket_missing')
  }

  if (
    normalizedMessage.includes('row-level security') ||
    normalizedMessage.includes('permission denied') ||
    normalizedMessage.includes('unauthorized')
  ) {
    return new Error('pet_photo_storage_permission_denied')
  }

  if (
    normalizedMessage.includes('payload too large') ||
    normalizedMessage.includes('file size') ||
    normalizedMessage.includes('exceeded')
  ) {
    return new Error('pet_photo_file_too_large')
  }

  return new Error('pet_photo_upload_failed')
}

export const petPhotoService = {
  async upload(userId: string, petId: string, file: File): Promise<string> {
    const extension = extensionFromFile(file)
    const path = `${userId}/${petId}/${crypto.randomUUID()}.${extension}`

    const { error } = await supabase.storage
      .from(petPhotoBucketName)
      .upload(path, file, {
        cacheControl: '3600',
        contentType: file.type || 'image/jpeg',
        upsert: false,
      })

    if (error) throw toPetPhotoUploadError(error)

    const { data } = supabase.storage
      .from(petPhotoBucketName)
      .getPublicUrl(path)

    return data.publicUrl
  },
}
