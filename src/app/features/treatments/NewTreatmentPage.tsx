import { AlertTriangle, ArrowLeft, CalendarClock, Check, LoaderCircle } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppData } from '../../shared/app-data-context'
import { getFriendlyDataError } from '../../shared/errors'
import {
  DataError,
  DataLoading,
  EmptyState,
  FeedbackBanner,
  Field,
  PageIntro,
} from '../../shared/ui'

function toDateTimeLocal(date: Date) {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16)
}

function getInitialStart() {
  const date = new Date()
  date.setMinutes(0, 0, 0)
  date.setHours(date.getHours() + 1)
  return toDateTimeLocal(date)
}

function getInitialEnd() {
  const date = new Date(getInitialStart())
  date.setDate(date.getDate() + 7)
  return toDateTimeLocal(date)
}

export function NewTreatmentPage() {
  const navigate = useNavigate()
  const { pets, addTreatment, isLoading, loadError, refreshData } = useAppData()
  const [petId, setPetId] = useState('')
  const [medicationName, setMedicationName] = useState('')
  const [dose, setDose] = useState('')
  const [doseUnit, setDoseUnit] = useState('')
  const [frequencyHours, setFrequencyHours] = useState('12')
  const [startAt, setStartAt] = useState(getInitialStart)
  const [endAt, setEndAt] = useState(getInitialEnd)
  const [instructions, setInstructions] = useState('')
  const [veterinarianName, setVeterinarianName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!petId && pets[0]) setPetId(pets[0].id)
  }, [petId, pets])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    const frequency = Number(frequencyHours)
    const start = new Date(startAt)
    const end = new Date(endAt)

    if (!petId) {
      setErrorMessage('Selecione um pet para o tratamento.')
      return
    }
    if (!medicationName.trim() || !dose.trim() || !doseUnit.trim()) {
      setErrorMessage('Informe medicamento, dose e unidade.')
      return
    }
    if (!Number.isFinite(frequency) || frequency <= 0) {
      setErrorMessage('A frequência precisa ser maior que zero.')
      return
    }
    if (end <= start) {
      setErrorMessage('A data final precisa ser maior que a data inicial.')
      return
    }

    setIsSaving(true)
    try {
      await addTreatment({
        petId,
        medicationName: medicationName.trim(),
        dose: dose.trim(),
        doseUnit: doseUnit.trim(),
        frequencyHours: frequency,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        instructions: instructions.trim() || null,
        veterinarianName: veterinarianName.trim() || null,
      })
      navigate('/app/treatments', { replace: true })
    } catch (error) {
      setErrorMessage(getFriendlyDataError(error))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <DataLoading label="Carregando seus pets..." />
  }

  if (loadError) {
    return <DataError message={loadError} onRetry={() => void refreshData()} />
  }

  if (pets.length === 0) {
    return (
      <div className="space-y-6">
        <Link
          to="/app/treatments"
          className="focus-ring inline-flex items-center gap-2 rounded-xl text-sm font-bold text-slate-500 hover:text-brand-700"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Link>
        <EmptyState
          icon={<CalendarClock className="size-6" />}
          title="Cadastre um pet primeiro"
          description="Todo tratamento precisa estar associado a um pet."
          action={
            <Link
              to="/app/pets/new"
              className="focus-ring inline-flex rounded-2xl bg-brand-600 px-5 py-3 text-sm font-bold text-white"
            >
              Cadastrar pet
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        to="/app/treatments"
        className="focus-ring inline-flex items-center gap-2 rounded-xl text-sm font-bold text-slate-500 hover:text-brand-700"
      >
        <ArrowLeft className="size-4" />
        Voltar para tratamentos
      </Link>

      <PageIntro
        eyebrow="Nova rotina"
        title="Cadastrar tratamento"
        description="Informe a prescrição para gerar automaticamente a agenda de doses."
      />

      <form className="app-card space-y-5 p-5" onSubmit={handleSubmit}>
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <p className="text-sm leading-6">
            O CuidaPet não substitui orientação veterinária. Cadastre as informações conforme a prescrição recebida.
          </p>
        </div>

        {errorMessage && <FeedbackBanner type="error" message={errorMessage} />}

        <Field label="Pet">
          <select
            required
            value={petId}
            onChange={(event) => setPetId(event.target.value)}
            className="app-input"
          >
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Medicamento">
          <input
            required
            value={medicationName}
            onChange={(event) => setMedicationName(event.target.value)}
            className="app-input"
            placeholder="Ex.: Antibiótico"
          />
        </Field>

        <div className="grid grid-cols-[1fr_130px] gap-3">
          <Field label="Dose">
            <input
              required
              value={dose}
              onChange={(event) => setDose(event.target.value)}
              className="app-input"
              placeholder="Ex.: 1 ou 2,5"
            />
          </Field>
          <Field label="Unidade">
            <select
              required
              value={doseUnit}
              onChange={(event) => setDoseUnit(event.target.value)}
              className="app-input px-3"
            >
              <option value="" disabled>Selecione</option>
              <option value="comprimido">comprimido</option>
              <option value="ml">ml</option>
              <option value="mg">mg</option>
              <option value="gota(s)">gota(s)</option>
              <option value="dose(s)">dose(s)</option>
              <option value="sachê">sachê</option>
            </select>
          </Field>
        </div>

        <Field label="Frequência em horas">
          <input
            required
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={frequencyHours}
            onChange={(event) => setFrequencyHours(event.target.value)}
            className="app-input"
            placeholder="Ex.: 12"
          />
        </Field>

        <Field label="Início do tratamento">
          <input
            required
            type="datetime-local"
            value={startAt}
            onChange={(event) => setStartAt(event.target.value)}
            className="app-input"
          />
        </Field>

        <Field label="Fim do tratamento">
          <input
            required
            type="datetime-local"
            min={startAt}
            value={endAt}
            onChange={(event) => setEndAt(event.target.value)}
            className="app-input"
          />
        </Field>

        <Field label="Veterinário(a)" hint="opcional">
          <input
            value={veterinarianName}
            onChange={(event) => setVeterinarianName(event.target.value)}
            className="app-input"
            placeholder="Nome do profissional responsável"
          />
        </Field>

        <Field label="Orientações" hint="opcional">
          <textarea
            rows={3}
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            className="app-input resize-none"
            placeholder="Ex.: oferecer depois da refeição"
          />
        </Field>

        <button
          type="submit"
          disabled={isSaving}
          className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-4 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? <LoaderCircle className="size-5 animate-spin" /> : <Check className="size-5" />}
          {isSaving ? 'Criando agenda...' : 'Salvar tratamento'}
        </button>
      </form>
    </div>
  )
}
