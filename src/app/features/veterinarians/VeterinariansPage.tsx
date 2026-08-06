import {
  Check,
  Edit3,
  LoaderCircle,
  Plus,
  Stethoscope,
  Trash2,
  X,
} from 'lucide-react'
import { type FormEvent, useState } from 'react'
import {
  type Veterinarian,
  useAppData,
} from '../../shared/app-data-context'
import { getFriendlyDataError } from '../../shared/errors'
import {
  DataError,
  DataLoading,
  EmptyState,
  FeedbackBanner,
  Field,
  PageIntro,
} from '../../shared/ui'

function clean(value: string) {
  return value.trim() || null
}

function VeterinarianForm({
  initial,
  isSaving,
  onCancel,
  onSubmit,
}: {
  initial: Veterinarian | null
  isSaving: boolean
  onCancel: () => void
  onSubmit: (input: {
    name: string
    clinicName: string | null
    phone: string | null
    whatsapp: string | null
    email: string | null
    specialty: string | null
    notes: string | null
  }) => Promise<void>
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [clinicName, setClinicName] = useState(initial?.clinicName ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [whatsapp, setWhatsapp] = useState(initial?.whatsapp ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [specialty, setSpecialty] = useState(initial?.specialty ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit({
      name: name.trim(),
      clinicName: clean(clinicName),
      phone: clean(phone),
      whatsapp: clean(whatsapp),
      email: clean(email),
      specialty: clean(specialty),
      notes: clean(notes),
    })
  }

  return (
    <form className="app-card space-y-4 p-5" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-extrabold text-slate-900">
          {initial ? 'Editar veterinário' : 'Cadastrar veterinário'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="focus-ring grid size-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700"
          aria-label="Fechar formulário"
        >
          <X className="size-4" />
        </button>
      </div>

      <Field label="Nome">
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="app-input"
          placeholder="Ex.: Dra. Ana"
        />
      </Field>

      <Field label="Clínica" hint="opcional">
        <input
          value={clinicName}
          onChange={(event) => setClinicName(event.target.value)}
          className="app-input"
          placeholder="Ex.: Clínica Amigo Pet"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Telefone" hint="opcional">
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="app-input px-3"
            inputMode="tel"
          />
        </Field>
        <Field label="WhatsApp" hint="opcional">
          <input
            value={whatsapp}
            onChange={(event) => setWhatsapp(event.target.value)}
            className="app-input px-3"
            inputMode="tel"
          />
        </Field>
      </div>

      <Field label="E-mail" hint="opcional">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="app-input"
        />
      </Field>

      <Field label="Especialidade" hint="opcional">
        <input
          value={specialty}
          onChange={(event) => setSpecialty(event.target.value)}
          className="app-input"
          placeholder="Ex.: Dermatologia, clínica geral"
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

      <button
        type="submit"
        disabled={isSaving}
        className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-4 font-bold text-white shadow-lg shadow-brand-600/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? (
          <LoaderCircle className="size-5 animate-spin" />
        ) : (
          <Check className="size-5" />
        )}
        Salvar
      </button>
    </form>
  )
}

export function VeterinariansPage() {
  const {
    veterinarians,
    isLoading,
    loadError,
    feedback,
    clearFeedback,
    refreshData,
    addVeterinarian,
    updateVeterinarian,
    deleteVeterinarian,
  } = useAppData()
  const [showForm, setShowForm] = useState(false)
  const [editingVeterinarian, setEditingVeterinarian] =
    useState<Veterinarian | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [actionError, setActionError] = useState('')

  async function handleSubmit(input: Parameters<typeof addVeterinarian>[0]) {
    if (!input.name) {
      setActionError('Informe o nome do veterinário.')
      return
    }

    setIsSaving(true)
    setActionError('')
    try {
      if (editingVeterinarian) {
        await updateVeterinarian(editingVeterinarian.id, input)
      } else {
        await addVeterinarian(input)
      }
      setEditingVeterinarian(null)
      setShowForm(false)
    } catch (error) {
      setActionError(getFriendlyDataError(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(veterinarian: Veterinarian) {
    if (!window.confirm(`Remover ${veterinarian.name} da lista ativa?`)) return

    setActionError('')
    try {
      await deleteVeterinarian(veterinarian.id)
    } catch (error) {
      setActionError(getFriendlyDataError(error))
    }
  }

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Profissionais"
        title="Veterinários"
        description="Cadastro rápido para vincular aos tratamentos."
        action={
          <button
            type="button"
            onClick={() => {
              setEditingVeterinarian(null)
              setShowForm(true)
            }}
            className="focus-ring grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
            aria-label="Cadastrar veterinário"
          >
            <Plus className="size-5" />
          </button>
        }
      />

      {feedback && <FeedbackBanner {...feedback} onDismiss={clearFeedback} />}
      {actionError && <FeedbackBanner type="error" message={actionError} />}

      {showForm && (
        <VeterinarianForm
          key={editingVeterinarian?.id ?? 'new'}
          initial={editingVeterinarian}
          isSaving={isSaving}
          onCancel={() => {
            setEditingVeterinarian(null)
            setShowForm(false)
          }}
          onSubmit={handleSubmit}
        />
      )}

      {isLoading ? (
        <DataLoading label="Carregando veterinários..." />
      ) : loadError ? (
        <DataError message={loadError} onRetry={() => void refreshData()} />
      ) : veterinarians.length === 0 ? (
        <EmptyState
          icon={<Stethoscope className="size-6" />}
          title="Nenhum veterinário"
          description="Cadastre o primeiro profissional para selecionar nos tratamentos."
        />
      ) : (
        <div className="space-y-3">
          {veterinarians.map((veterinarian) => (
            <article key={veterinarian.id} className="app-card p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                  <Stethoscope className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-extrabold text-slate-900">
                    {veterinarian.name}
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {[
                      veterinarian.clinicName,
                      veterinarian.specialty,
                    ].filter(Boolean).join(' · ') || 'Sem clínica informada'}
                  </p>
                  {(veterinarian.phone || veterinarian.whatsapp) && (
                    <p className="mt-3 text-xs text-slate-500">
                      {veterinarian.whatsapp || veterinarian.phone}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingVeterinarian(veterinarian)
                      setShowForm(true)
                    }}
                    className="focus-ring grid size-9 place-items-center rounded-xl text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                    aria-label={`Editar ${veterinarian.name}`}
                  >
                    <Edit3 className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(veterinarian)}
                    className="focus-ring grid size-9 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Remover ${veterinarian.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              {veterinarian.notes && (
                <p className="mt-4 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">
                  {veterinarian.notes}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
