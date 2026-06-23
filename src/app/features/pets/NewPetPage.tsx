import { ArrowLeft, Check, LoaderCircle, PawPrint } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppData } from '../../shared/app-data-context'
import { getFriendlyDataError } from '../../shared/errors'
import { FeedbackBanner, Field, PageIntro } from '../../shared/ui'
import { parseWeightInput } from '../../shared/weight'
import { SpeciesCombobox } from './SpeciesCombobox'

export function NewPetPage() {
  const navigate = useNavigate()
  const { addPet } = useAppData()
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('')
  const [breed, setBreed] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (!name.trim() || !species.trim()) {
      setErrorMessage('Informe o nome e a espécie do pet.')
      return
    }
    const parsedWeight = parseWeightInput(weight)
    const weightKg = weight ? parsedWeight : null
    if (weight && (!Number.isFinite(parsedWeight) || parsedWeight <= 0)) {
      setErrorMessage('O peso precisa ser maior que zero.')
      return
    }

    setIsSaving(true)
    try {
      await addPet({
        name: name.trim(),
        species: species.trim(),
        breed: breed.trim() || null,
        birthDate: birthDate || null,
        weightKg,
        notes: notes.trim() || null,
      })
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
        description="Cadastre animais comuns ou exóticos domesticados com liberdade."
      />

      <form className="app-card space-y-5 p-5" onSubmit={handleSubmit}>
        <div className="flex items-center gap-3 rounded-2xl bg-brand-50 p-4">
          <span className="grid size-11 place-items-center rounded-2xl bg-white text-brand-700 shadow-sm">
            <PawPrint className="size-5" />
          </span>
          <p className="text-sm leading-6 text-brand-900">
            Esses dados ajudam a organizar tratamentos, vacinas e peso.
          </p>
        </div>

        {errorMessage && <FeedbackBanner type="error" message={errorMessage} />}

        <Field label="Nome do pet">
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="app-input"
            placeholder="Ex.: Luna"
          />
        </Field>

        <Field label="Espécie">
          <SpeciesCombobox value={species} onChange={setSpecies} />
        </Field>

        <Field label="Raça" hint="opcional">
          <input
            value={breed}
            onChange={(event) => setBreed(event.target.value)}
            className="app-input"
            placeholder="Ex.: Golden Retriever ou SRD"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Nascimento" hint="opcional">
            <input
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
              className="app-input"
            />
          </Field>
          <Field label="Peso atual (kg)" hint="opcional">
            <input
              type="text"
              inputMode="decimal"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              className="app-input"
              placeholder="Ex.: 12,4"
            />
          </Field>
        </div>

        <Field label="Observações" hint="opcional">
          <textarea
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="app-input resize-none"
            placeholder="Alergias, preferências ou informações importantes"
          />
        </Field>

        <button
          type="submit"
          disabled={isSaving}
          className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-4 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? <LoaderCircle className="size-5 animate-spin" /> : <Check className="size-5" />}
          {isSaving ? 'Salvando...' : 'Salvar pet'}
        </button>
      </form>
    </div>
  )
}
