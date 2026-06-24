import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppData } from '../../shared/app-data-context'
import { getFriendlyDataError } from '../../shared/errors'
import { FeedbackBanner, PageIntro } from '../../shared/ui'
import { PetForm } from './PetForm'
import type { CreatePetInput } from '../../services/petsService'

export function NewPetPage() {
  const navigate = useNavigate()
  const { addPet } = useAppData()
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(pet: CreatePetInput) {
    setErrorMessage('')
    setIsSaving(true)

    try {
      await addPet(pet)
      navigate('/app/pets', { replace: true })
    } catch (error) {
      setErrorMessage(getFriendlyDataError(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Link
        to="/app/pets"
        className="focus-ring inline-flex items-center gap-2 rounded-xl text-sm font-bold text-slate-500 hover:text-brand-700"
      >
        <ArrowLeft className="size-4" />
        Voltar para pets
      </Link>

      <PageIntro
        eyebrow="Novo companheiro"
        title="Cadastrar pet"
        description="Cadastre animais comuns, répteis e exóticos com espécie, morfo e variação."
      />

      {errorMessage && <FeedbackBanner type="error" message={errorMessage} />}

      <PetForm
        isSaving={isSaving}
        submitLabel="Salvar pet"
        onSubmit={handleSubmit}
      />
    </div>
  )
}
