import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  Check,
  LoaderCircle,
  Plus,
  Trash2,
} from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAppData } from '../../shared/app-data-context'
import { getFriendlyDataError } from '../../shared/errors'
import { normalizeScheduleTimes } from '../../shared/treatmentSchedule'
import {
  DataError,
  DataLoading,
  EmptyState,
  FeedbackBanner,
  Field,
  PageIntro,
} from '../../shared/ui'

type FrequencyOption = {
  id: string
  label: string
  frequencyHours: number
  times: string[]
}

const frequencyOptions: FrequencyOption[] = [
  { id: 'daily', label: 'Uma vez ao dia', frequencyHours: 24, times: ['08:00'] },
  { id: '24h', label: 'A cada 24 horas', frequencyHours: 24, times: ['08:00'] },
  { id: '12h', label: 'A cada 12 horas', frequencyHours: 12, times: ['08:00', '20:00'] },
  { id: '8h', label: 'A cada 8 horas', frequencyHours: 8, times: ['06:00', '14:00', '22:00'] },
  { id: '6h', label: 'A cada 6 horas', frequencyHours: 6, times: ['06:00', '12:00', '18:00', '00:00'] },
  { id: '4h', label: 'A cada 4 horas', frequencyHours: 4, times: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'] },
  { id: '2h', label: 'A cada 2 horas', frequencyHours: 2, times: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'] },
  { id: 'twice-day', label: '2 vezes ao dia', frequencyHours: 12, times: ['08:00', '20:00'] },
  { id: 'three-day', label: '3 vezes ao dia', frequencyHours: 8, times: ['06:00', '14:00', '22:00'] },
  { id: 'morning', label: 'De manhã', frequencyHours: 24, times: ['08:00'] },
  { id: 'afternoon', label: 'À tarde', frequencyHours: 24, times: ['14:00'] },
  { id: 'night', label: 'À noite', frequencyHours: 24, times: ['20:00'] },
  { id: 'morning-night', label: 'Manhã e noite', frequencyHours: 12, times: ['08:00', '20:00'] },
  { id: 'before-meals', label: 'Antes das refeições', frequencyHours: 8, times: ['07:30', '11:30', '18:30'] },
  { id: 'after-meals', label: 'Após as refeições', frequencyHours: 8, times: ['08:30', '12:30', '19:30'] },
  { id: 'vet-guidance', label: 'Conforme orientação veterinária', frequencyHours: 24, times: ['08:00'] },
  { id: 'custom', label: 'Personalizado', frequencyHours: 24, times: ['08:00'] },
]

const defaultFrequency = frequencyOptions.find((option) => option.id === '12h') ?? frequencyOptions[0]

const doseSuggestions = [
  { label: '1 comprimido', dose: '1', doseUnit: 'comprimido' },
  { label: '1/2 comprimido', dose: '1/2', doseUnit: 'comprimido' },
  { label: '5 ml', dose: '5', doseUnit: 'ml' },
  { label: '10 gotas', dose: '10', doseUnit: 'gota(s)' },
  { label: '1 aplicação', dose: '1', doseUnit: 'aplicação' },
  {
    label: 'Conforme orientação veterinária',
    dose: 'Conforme orientação veterinária',
    doseUnit: '',
  },
]

function toDateTimeLocal(date: Date) {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16)
}

function getNextDateTimeForTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)

  if (date.getTime() <= Date.now() + 60_000) {
    date.setDate(date.getDate() + 1)
  }

  return toDateTimeLocal(date)
}

function getInitialStart() {
  return getNextDateTimeForTime(defaultFrequency.times[0])
}

function getInitialEnd(startAt = getInitialStart()) {
  const date = new Date(startAt)
  date.setDate(date.getDate() + 7)
  return toDateTimeLocal(date)
}

function nextTimeAfter(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(hours + 1, minutes, 0, 0)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function frequencyHoursForSubmit(option: FrequencyOption, times: string[]) {
  if (option.id !== 'custom') return option.frequencyHours
  return Math.max(1, Math.round(24 / Math.max(times.length, 1)))
}

function frequencyLabelForSubmit(option: FrequencyOption, times: string[]) {
  if (times.length === 0) return option.label
  if (times.length > 4) return `${option.label} (${times.length} horários/dia)`
  return `${option.label} (${times.join(', ')})`
}

export function NewTreatmentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const {
    pets,
    veterinarians,
    addTreatment,
    isLoading,
    loadError,
    refreshData,
  } = useAppData()
  const [petIds, setPetIds] = useState<string[]>([])
  const [medicationName, setMedicationName] = useState('')
  const [dose, setDose] = useState('')
  const [doseUnit, setDoseUnit] = useState('')
  const [frequencyOptionId, setFrequencyOptionId] = useState(defaultFrequency.id)
  const [doseTimes, setDoseTimes] = useState(defaultFrequency.times)
  const [startAt, setStartAt] = useState(getInitialStart)
  const [endAt, setEndAt] = useState(() => getInitialEnd())
  const [instructions, setInstructions] = useState('')
  const [veterinarianId, setVeterinarianId] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const selectedFrequency =
    frequencyOptions.find((option) => option.id === frequencyOptionId) ?? defaultFrequency

  useEffect(() => {
    if (petIds.length > 0 || pets.length === 0) return

    const requestedPetId = searchParams.get('petId')
    const initialPet = pets.find((pet) => pet.id === requestedPetId) ?? pets[0]
    setPetIds([initialPet.id])
  }, [petIds.length, pets, searchParams])

  function togglePet(petId: string) {
    setPetIds((current) =>
      current.includes(petId)
        ? current.filter((item) => item !== petId)
        : [...current, petId],
    )
  }

  function handleFrequencyChange(optionId: string) {
    const option =
      frequencyOptions.find((item) => item.id === optionId) ?? defaultFrequency
    const nextStart = getNextDateTimeForTime(option.times[0])

    setFrequencyOptionId(option.id)
    setDoseTimes(option.times)
    setStartAt(nextStart)
    setEndAt(getInitialEnd(nextStart))
  }

  function updateDoseTime(index: number, value: string) {
    setDoseTimes((current) =>
      current.map((time, currentIndex) =>
        currentIndex === index ? value : time,
      ),
    )
  }

  function addDoseTime() {
    setDoseTimes((current) => [
      ...current,
      nextTimeAfter(current[current.length - 1] ?? selectedFrequency.times[0]),
    ])
  }

  function removeDoseTime(index: number) {
    setDoseTimes((current) =>
      current.length <= 1
        ? current
        : current.filter((_, currentIndex) => currentIndex !== index),
    )
  }

  function applyDoseSuggestion(suggestion: (typeof doseSuggestions)[number]) {
    setDose(suggestion.dose)
    setDoseUnit(suggestion.doseUnit)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    const start = new Date(startAt)
    const end = new Date(endAt)
    const normalizedTimes = normalizeScheduleTimes(doseTimes)
    const frequency = frequencyHoursForSubmit(selectedFrequency, normalizedTimes)

    if (petIds.length === 0) {
      setErrorMessage('Selecione pelo menos um pet para o tratamento.')
      return
    }
    if (!medicationName.trim() || !dose.trim()) {
      setErrorMessage('Informe medicamento e dose.')
      return
    }
    if (!Number.isFinite(frequency) || frequency <= 0) {
      setErrorMessage('A frequência precisa ser maior que zero.')
      return
    }
    if (normalizedTimes.length === 0) {
      setErrorMessage('Informe pelo menos um horário para a dose.')
      return
    }
    if (end <= start) {
      setErrorMessage('A data final precisa ser maior que a data inicial.')
      return
    }

    setIsSaving(true)
    try {
      const selectedVeterinarian =
        veterinarians.find((item) => item.id === veterinarianId) ?? null
      await addTreatment({
        petIds,
        medicationName: medicationName.trim(),
        dose: dose.trim(),
        doseUnit: doseUnit.trim(),
        frequencyHours: frequency,
        frequencyLabel: frequencyLabelForSubmit(selectedFrequency, normalizedTimes),
        scheduleTimes: normalizedTimes,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        instructions: instructions.trim() || null,
        veterinarianId: selectedVeterinarian?.id ?? null,
        veterinarianName: selectedVeterinarian?.name ?? null,
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
          description="Todo tratamento precisa estar associado a pelo menos um pet."
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
        description="Informe a prescrição para gerar a agenda de doses."
      />

      <form className="app-card space-y-5 p-5" onSubmit={handleSubmit}>
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <p className="text-sm leading-6">
            O CuidaPet não substitui orientação veterinária. Cadastre as informações conforme a prescrição recebida.
          </p>
        </div>

        {errorMessage && <FeedbackBanner type="error" message={errorMessage} />}

        <div>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm font-bold text-slate-700">
            <span>Pets</span>
            <small className="font-medium text-slate-400">
              {petIds.length} selecionado(s)
            </small>
          </div>
          <div className="grid gap-2">
            {pets.map((pet) => {
              const isSelected = petIds.includes(pet.id)
              return (
                <label
                  key={pet.id}
                  className={`focus-within:ring-brand-500/40 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold transition focus-within:ring-2 ${
                    isSelected
                      ? 'border-brand-300 bg-brand-50 text-brand-800'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => togglePet(pet.id)}
                    className="size-4 accent-brand-600"
                  />
                  <span>{pet.name}</span>
                </label>
              )
            })}
          </div>
        </div>

        <Field label="Medicamento">
          <input
            required
            value={medicationName}
            onChange={(event) => setMedicationName(event.target.value)}
            className="app-input"
            placeholder="Ex.: Antibiótico"
          />
        </Field>

        <div className="space-y-3">
          <div className="grid grid-cols-[1fr_130px] gap-3">
            <Field label="Dose">
              <input
                required
                value={dose}
                onChange={(event) => setDose(event.target.value)}
                className="app-input"
                placeholder="Ex.: 1 comprimido, 5 ml, 10 gotas"
              />
            </Field>
            <Field label="Unidade" hint="opcional">
              <select
                value={doseUnit}
                onChange={(event) => setDoseUnit(event.target.value)}
                className="app-input px-3"
              >
                <option value="">Sem unidade</option>
                <option value="comprimido">comprimido</option>
                <option value="ml">ml</option>
                <option value="mg">mg</option>
                <option value="gota(s)">gota(s)</option>
                <option value="dose">dose</option>
                <option value="aplicação">aplicação</option>
                <option value="sachê">sachê</option>
              </select>
            </Field>
          </div>
          <div className="flex flex-wrap gap-2">
            {doseSuggestions.map((suggestion) => (
              <button
                key={suggestion.label}
                type="button"
                onClick={() => applyDoseSuggestion(suggestion)}
                className="focus-ring rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        </div>

        <Field label="Frequência">
          <select
            required
            value={frequencyOptionId}
            onChange={(event) => handleFrequencyChange(event.target.value)}
            className="app-input px-3"
          >
            {frequencyOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm font-bold text-slate-700">
            <span>Horários</span>
            <button
              type="button"
              onClick={addDoseTime}
              className="focus-ring inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-extrabold text-brand-700"
            >
              <Plus className="size-3.5" />
              Adicionar
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {doseTimes.map((time, index) => (
              <div key={`${time}-${index}`} className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(event) => updateDoseTime(index, event.target.value)}
                  className="app-input px-3"
                  aria-label={`Horário ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeDoseTime(index)}
                  disabled={doseTimes.length <= 1}
                  className="focus-ring grid size-11 place-items-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                  aria-label={`Remover horário ${index + 1}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

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

        <div>
          <Field label="Veterinário(a)" hint="opcional">
            <select
              value={veterinarianId}
              onChange={(event) => setVeterinarianId(event.target.value)}
              className="app-input"
            >
              <option value="">Sem veterinário vinculado</option>
              {veterinarians.map((veterinarian) => (
                <option key={veterinarian.id} value={veterinarian.id}>
                  {veterinarian.name}
                  {veterinarian.clinicName ? ` · ${veterinarian.clinicName}` : ''}
                </option>
              ))}
            </select>
          </Field>
          {veterinarians.length === 0 && (
            <Link
              to="/app/veterinarians"
              className="mt-2 inline-flex text-xs font-bold text-brand-700"
            >
              Cadastrar veterinário
            </Link>
          )}
        </div>

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
          {isSaving
            ? 'Criando agenda...'
            : petIds.length > 1
              ? 'Salvar tratamentos'
              : 'Salvar tratamento'}
        </button>
      </form>
    </div>
  )
}
