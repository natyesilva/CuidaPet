import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Edit3,
  HeartPulse,
  LoaderCircle,
  PawPrint,
  Plus,
  Scale,
  ShieldPlus,
  Stethoscope,
  Trash2,
} from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { CreatePetInput } from '../../services/petsService'
import type { Vaccine } from '../../shared/app-data-context'
import { useAppData } from '../../shared/app-data-context'
import { formatDaysAgo, formatShortDate } from '../../shared/date'
import { getFriendlyDataError } from '../../shared/errors'
import {
  DataError,
  DataLoading,
  EmptyState,
  FeedbackBanner,
  Field,
  PageIntro,
} from '../../shared/ui'
import { formatWeight, parseWeightInput } from '../../shared/weight'
import { PetForm } from './PetForm'

type DetailTab = 'general' | 'treatments' | 'vaccines' | 'weight'

const tabs: Array<{ id: DetailTab; label: string }> = [
  { id: 'general', label: 'Dados gerais' },
  { id: 'treatments', label: 'Tratamentos' },
  { id: 'vaccines', label: 'Vacinas' },
  { id: 'weight', label: 'Peso' },
]

function localDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function VaccineForm({
  initial,
  isSaving,
  onCancel,
  onSubmit,
}: {
  initial: Vaccine | null
  isSaving: boolean
  onCancel: () => void
  onSubmit: (input: {
    name: string
    appliedAt: string | null
    nextDueAt: string | null
    veterinarianName: string | null
    clinicName: string | null
    notes: string | null
  }) => Promise<void>
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [appliedAt, setAppliedAt] = useState(initial?.appliedAt ?? '')
  const [nextDueAt, setNextDueAt] = useState(initial?.nextDueAt ?? '')
  const [veterinarianName, setVeterinarianName] = useState(
    initial?.veterinarianName ?? '',
  )
  const [clinicName, setClinicName] = useState(initial?.clinicName ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit({
      name: name.trim(),
      appliedAt: appliedAt || null,
      nextDueAt: nextDueAt || null,
      veterinarianName: veterinarianName.trim() || null,
      clinicName: clinicName.trim() || null,
      notes: notes.trim() || null,
    })
  }

  return (
    <form className="app-card space-y-4 p-5" onSubmit={handleSubmit}>
      <h3 className="font-extrabold text-slate-900">
        {initial ? 'Editar vacina' : 'Cadastrar vacina'}
      </h3>
      <Field label="Nome da vacina">
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="app-input"
          placeholder="Ex.: V10, antirrábica"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Aplicada em" hint="opcional">
          <input
            type="date"
            value={appliedAt}
            onChange={(event) => setAppliedAt(event.target.value)}
            className="app-input px-3"
          />
        </Field>
        <Field label="Próxima dose" hint="opcional">
          <input
            type="date"
            value={nextDueAt}
            onChange={(event) => setNextDueAt(event.target.value)}
            className="app-input px-3"
          />
        </Field>
      </div>
      <Field label="Veterinário(a)" hint="opcional">
        <input
          value={veterinarianName}
          onChange={(event) => setVeterinarianName(event.target.value)}
          className="app-input"
        />
      </Field>
      <Field label="Clínica" hint="opcional">
        <input
          value={clinicName}
          onChange={(event) => setClinicName(event.target.value)}
          className="app-input"
        />
      </Field>
      <Field label="Observações" hint="opcional">
        <textarea
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="app-input resize-none"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="focus-ring rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}
          Salvar
        </button>
      </div>
    </form>
  )
}

export function PetDetailPage() {
  const { petId = '' } = useParams()
  const {
    getPet,
    getPetWeights,
    getPetVaccines,
    treatments,
    isLoading,
    loadError,
    feedback,
    clearFeedback,
    refreshData,
    updatePet,
    addWeight,
    addVaccine,
    updateVaccine,
    deleteVaccine,
  } = useAppData()
  const [activeTab, setActiveTab] = useState<DetailTab>('general')
  const [isEditingPet, setIsEditingPet] = useState(false)
  const [showWeightForm, setShowWeightForm] = useState(false)
  const [showVaccineForm, setShowVaccineForm] = useState(false)
  const [editingVaccine, setEditingVaccine] = useState<Vaccine | null>(null)
  const [weight, setWeight] = useState('')
  const [weightDate, setWeightDate] = useState(localDate())
  const [weightNotes, setWeightNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [actionError, setActionError] = useState('')

  const pet = getPet(petId)
  const weights = getPetWeights(petId)
  const vaccines = getPetVaccines(petId)
  const petTreatments = treatments.filter((treatment) => treatment.petId === petId)
  const today = localDate()
  const petClassification = pet
    ? [
        pet.species,
        pet.specificSpecies,
        pet.subspeciesOrMorph,
      ].filter(Boolean)
    : []

  async function handlePetSubmit(input: CreatePetInput) {
    setIsSaving(true)
    setActionError('')
    try {
      await updatePet(petId, input)
      setIsEditingPet(false)
    } catch (error) {
      setActionError(getFriendlyDataError(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleWeightSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = parseWeightInput(weight)
    if (!Number.isFinite(value) || value <= 0) {
      setActionError('O peso precisa ser maior que zero.')
      return
    }

    setIsSaving(true)
    setActionError('')
    try {
      await addWeight(petId, {
        weightKg: value,
        recordedAt: weightDate,
        notes: weightNotes.trim() || null,
      })
      setWeight('')
      setWeightNotes('')
      setShowWeightForm(false)
    } catch (error) {
      setActionError(getFriendlyDataError(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleVaccineSubmit(input: Parameters<typeof addVaccine>[1]) {
    if (!input.name) {
      setActionError('Informe o nome da vacina.')
      return
    }

    setIsSaving(true)
    setActionError('')
    try {
      if (editingVaccine) {
        await updateVaccine(editingVaccine.id, input)
      } else {
        await addVaccine(petId, input)
      }
      setEditingVaccine(null)
      setShowVaccineForm(false)
    } catch (error) {
      setActionError(getFriendlyDataError(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteVaccine(vaccine: Vaccine) {
    if (!window.confirm(`Excluir a vacina ${vaccine.name}?`)) return
    setActionError('')
    try {
      await deleteVaccine(vaccine.id)
    } catch (error) {
      setActionError(getFriendlyDataError(error))
    }
  }

  if (isLoading) return <DataLoading label="Carregando detalhes do pet..." />
  if (loadError) {
    return <DataError message={loadError} onRetry={() => void refreshData()} />
  }
  if (!pet) {
    return (
      <EmptyState
        icon={<PawPrint className="size-6" />}
        title="Pet não encontrado"
        description="Este pet não existe ou não pertence à sua conta."
        action={
          <Link to="/app/pets" className="font-bold text-brand-700">
            Voltar para pets
          </Link>
        }
      />
    )
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
        eyebrow={pet.animalGroup || pet.species}
        title={pet.name}
        description={
          petClassification.length > 0
            ? petClassification.join(' • ')
            : pet.breed || 'Companheiro cadastrado no CuidaPet'
        }
      />

      {feedback && <FeedbackBanner {...feedback} onDismiss={clearFeedback} />}
      {actionError && <FeedbackBanner type="error" message={actionError} />}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`focus-ring shrink-0 rounded-full px-4 py-2.5 text-xs font-extrabold transition ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white'
                : 'border border-slate-200 bg-white text-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="space-y-4">
          {isEditingPet ? (
            <PetForm
              initialPet={pet}
              isSaving={isSaving}
              submitLabel="Salvar alterações"
              savingLabel="Atualizando..."
              onSubmit={handlePetSubmit}
              onCancel={() => setIsEditingPet(false)}
            />
          ) : (
            <>
              <section className="app-card divide-y divide-slate-100 overflow-hidden">
                {[
                  ['Grupo do animal', pet.animalGroup || 'Não informado'],
                  ['Espécie popular', pet.species],
                  ['Espécie específica', pet.specificSpecies || 'Não informada'],
                  ['Subespécie / morfo', pet.subspeciesOrMorph || 'Não informado'],
                  ['Raça ou tipo', pet.breed || 'Não informada'],
                  ['Sexo', pet.sex || 'Não informado'],
                  [
                    'Nascimento',
                    pet.birthDate ? formatShortDate(pet.birthDate) : 'Não informado',
                  ],
                  [
                    'Último peso',
                    weights[0]
                      ? formatWeight(weights[0].weightKg, pet.weightUnit)
                      : pet.weightKg
                        ? formatWeight(pet.weightKg, pet.weightUnit)
                        : 'Não informado',
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 px-5 py-4">
                    <span className="text-sm font-semibold text-slate-500">{label}</span>
                    <strong className="text-right text-sm text-slate-800">{value}</strong>
                  </div>
                ))}
                {pet.notes && (
                  <div className="px-5 py-4">
                    <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
                      Observações
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{pet.notes}</p>
                  </div>
                )}
              </section>

              <button
                type="button"
                onClick={() => setIsEditingPet(true)}
                className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-200 bg-white px-4 py-3 text-sm font-bold text-brand-700 shadow-sm"
              >
                <Edit3 className="size-4" />
                Editar dados do pet
              </button>
            </>
          )}
        </div>
      )}

      {activeTab === 'treatments' && (
        <div className="space-y-3">
          {petTreatments.length === 0 ? (
            <EmptyState
              icon={<HeartPulse className="size-6" />}
              title="Nenhum tratamento"
              description="Este pet ainda não possui tratamentos cadastrados."
              action={
                <Link to="/app/treatments/new" className="font-bold text-brand-700">
                  Cadastrar tratamento
                </Link>
              }
            />
          ) : (
            petTreatments.map((treatment) => (
              <article key={treatment.id} className="app-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900">
                      {treatment.medicationName}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-brand-700">
                      {treatment.dose} {treatment.doseUnit} · a cada{' '}
                      {treatment.frequencyHours}h
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-extrabold uppercase text-brand-700">
                    {treatment.status}
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {formatShortDate(treatment.startAt)} até{' '}
                  {formatShortDate(treatment.endAt)}
                </p>
              </article>
            ))
          )}
        </div>
      )}

      {activeTab === 'vaccines' && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
            <Stethoscope className="mt-0.5 size-5 shrink-0" />
            <p className="text-sm leading-6">
              O CuidaPet ajuda na organização das vacinas, mas o calendário ideal deve ser definido por um veterinário.
            </p>
          </div>

          {!showVaccineForm && (
            <button
              type="button"
              onClick={() => {
                setEditingVaccine(null)
                setShowVaccineForm(true)
              }}
              className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 font-bold text-white"
            >
              <Plus className="size-5" />
              Cadastrar vacina
            </button>
          )}

          {showVaccineForm && (
            <VaccineForm
              key={editingVaccine?.id ?? 'new'}
              initial={editingVaccine}
              isSaving={isSaving}
              onCancel={() => {
                setEditingVaccine(null)
                setShowVaccineForm(false)
              }}
              onSubmit={handleVaccineSubmit}
            />
          )}

          {vaccines.length === 0 ? (
            <EmptyState
              icon={<ShieldPlus className="size-6" />}
              title="Nenhuma vacina"
              description="Cadastre as vacinas e acompanhe as próximas doses."
            />
          ) : (
            vaccines.map((vaccine) => {
              const isOverdue = Boolean(vaccine.nextDueAt && vaccine.nextDueAt < today)
              return (
                <article
                  key={vaccine.id}
                  className={`app-card p-5 ${isOverdue ? 'border-rose-200' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
                        isOverdue ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      {isOverdue ? <AlertTriangle className="size-5" /> : <ShieldPlus className="size-5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-slate-900">{vaccine.name}</h3>
                      <p className={`mt-1 text-xs font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>
                        {vaccine.nextDueAt
                          ? `${isOverdue ? 'Atrasada' : 'Próxima'}: ${formatShortDate(vaccine.nextDueAt)}`
                          : 'Sem próxima dose definida'}
                      </p>
                      {vaccine.appliedAt && (
                        <p className="mt-2 text-xs text-slate-400">
                          Aplicada em {formatShortDate(vaccine.appliedAt)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingVaccine(vaccine)
                          setShowVaccineForm(true)
                        }}
                        className="focus-ring grid size-9 place-items-center rounded-xl text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                        aria-label={`Editar ${vaccine.name}`}
                      >
                        <Edit3 className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteVaccine(vaccine)}
                        className="focus-ring grid size-9 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        aria-label={`Excluir ${vaccine.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </div>
      )}

      {activeTab === 'weight' && (
        <div className="space-y-4">
          {weights[0] && (
            <section className="overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-700 to-cyan-500 p-6 text-white shadow-lg shadow-brand-700/15">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-50/80">
                    Último peso registrado
                  </p>
                  <strong className="mt-3 block text-4xl font-extrabold">
                    {formatWeight(weights[0].weightKg, pet.weightUnit)}
                  </strong>
                  <p className="mt-2 text-sm font-semibold text-brand-50/90">
                    {formatDaysAgo(weights[0].recordedAt)}
                  </p>
                </div>
                <span className="grid size-12 place-items-center rounded-2xl bg-white/15">
                  <Scale className="size-6" />
                </span>
              </div>
            </section>
          )}

          {!showWeightForm ? (
            <button
              type="button"
              onClick={() => setShowWeightForm(true)}
              className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 font-bold text-white"
            >
              <Plus className="size-5" />
              Registrar novo peso
            </button>
          ) : (
            <form className="app-card space-y-4 p-5" onSubmit={handleWeightSubmit}>
              <h3 className="font-extrabold text-slate-900">Novo peso</h3>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Peso (kg)">
                  <input
                    required
                    type="text"
                    inputMode="decimal"
                    value={weight}
                    onChange={(event) => setWeight(event.target.value)}
                    className="app-input"
                    placeholder="Ex.: 12,4"
                  />
                </Field>
                <Field label="Data">
                  <input
                    required
                    type="date"
                    value={weightDate}
                    onChange={(event) => setWeightDate(event.target.value)}
                    className="app-input px-3"
                  />
                </Field>
              </div>
              <Field label="Observação" hint="opcional">
                <textarea
                  rows={2}
                  value={weightNotes}
                  onChange={(event) => setWeightNotes(event.target.value)}
                  className="app-input resize-none"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowWeightForm(false)}
                  className="focus-ring rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : <Scale className="size-4" />}
                  Registrar
                </button>
              </div>
            </form>
          )}

          {weights.length === 0 ? (
            <EmptyState
              icon={<Scale className="size-6" />}
              title="Nenhum peso registrado"
              description="Registre o peso para acompanhar a evolução deste pet."
            />
          ) : (
            <section className="app-card p-5">
              <div className="mb-5">
                <h3 className="font-extrabold text-slate-900">Evolução do peso</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Histórico preparado para receber um gráfico futuramente.
                </p>
              </div>
              <div className="relative">
                <span
                  className="absolute bottom-4 left-[0.4375rem] top-4 w-px bg-brand-100"
                  aria-hidden="true"
                />
                <div className="space-y-6">
                  {weights.map((record) => (
                    <article key={record.id} className="relative flex gap-4">
                      <span className="relative z-10 mt-1 size-3.5 shrink-0 rounded-full border-4 border-brand-100 bg-brand-600" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                          <strong className="text-lg text-slate-900">
                            {formatWeight(record.weightKg, pet.weightUnit)}
                          </strong>
                          <span className="text-xs font-extrabold text-brand-700">
                            {formatDaysAgo(record.recordedAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          {formatShortDate(record.recordedAt)}
                        </p>
                        {record.notes && (
                          <p className="mt-2 text-sm leading-5 text-slate-500">
                            {record.notes}
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
