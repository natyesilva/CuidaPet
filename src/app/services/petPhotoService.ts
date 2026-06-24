import { supabase } from '../../lib/supabase'

export const petPhotoBucketName = 'pet-photos'

function extensionFromFile(file: File) {
  const byName = file.name.split('.').pop()?.toLowerCase()
  if (byName && /^[a-z0-9]+$/.test(byName)) return byName

  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpg'
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

    if (error) throw error

    const { data } = supabase.storage
      .from(petPhotoBucketName)
      .getPublicUrl(path)

    return data.publicUrl
  },
}
