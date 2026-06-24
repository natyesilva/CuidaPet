import { useState } from 'react'
import type { Pet } from './app-data-context'
import { getPetEmoji } from './pet'

type PetAvatarProps = {
  pet: Pick<Pet, 'name' | 'species' | 'photoUrl'>
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'size-10 rounded-2xl text-xl',
  md: 'size-12 rounded-2xl text-2xl',
  lg: 'size-16 rounded-[1.35rem] text-3xl',
  xl: 'size-20 rounded-[1.65rem] text-4xl',
}

export function PetAvatar({ pet, size = 'md', className = '' }: PetAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(pet.photoUrl && !imageFailed)

  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden bg-gradient-to-br from-brand-50 to-cyan-100 text-slate-700 shadow-sm ${sizeClasses[size]} ${className}`}
      aria-hidden={!showImage}
    >
      {showImage ? (
        <img
          src={pet.photoUrl ?? ''}
          alt={`Foto de ${pet.name}`}
          className="size-full object-cover"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span aria-label={pet.name}>{getPetEmoji(pet.species)}</span>
      )}
    </span>
  )
}
