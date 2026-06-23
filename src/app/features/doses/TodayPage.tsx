import { Check, CheckCircle2, Clock3, LoaderCircle, Pill, RotateCcw, X } from 'lucide-react'
import { useState } from 'react'
import { useAppData, type Dose } from '../../shared/app-data-context'
import { formatTime } from '../../shared/date'
import { getFriendlyDataError } from '../../shared/errors'
import {
  DataError,
  DataLoading,
  EmptyState,
  FeedbackBanner,
  PageIntro,
} from '../../shared/ui'

function DoseCard({
  dose,
  updatingId,
  onUpdate,
}: {
  dose: Dose
  updatingId: string
  onUpdate: (doseId: string, status: 'applied' | 'skipped') => Promise<void>
}) {
  const { getPet } = useAppData()
  const pet = getPet(dose.petId)
  const isCompleted = dose.status !== 'pending'
  const isUpdating = updatingId === dose.id

  return (
    <article
      className={`app-card overflow-hidden transition ${
        dose.status === 'applied'
          ? 'border-brand-200 bg-brand-50/30'
          : dose.status === 'skipped' || dose.status === 'missed'
            ? 'border-slate-200 opacity-75'
            : ''
      }`}
    >
      <div className="flex gap-4 p-5">
        <div className="text-center">
          <span className="block text-lg font-extrabold text-slate-900">
            {formatTime(dose.scheduledAt)}
          </span>
          <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            horário
          </span>
        </div>
        <div className="h-12 w-px bg-slate-100" />
        <span
          className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
            dose.status === 'applied'
              ? 'bg-brand-100 text-brand-700'
              : 'bg-blue-50 text-blue-600'
          }`}
        >
          {dose.status === 'applied' ? (
            <CheckCircle2 className="size-6" />
          ) : (
            <Pill className="size-5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-extrabold text-slate-900">
            {dose.medicationName}
          </h2>
          <p className="mt-1 text-sm font-semibold text-brand-700">
            {pet?.name ?? 'Pet'} · {dose.dose} {dose.doseUnit}
          </p>
          {isCompleted && (
            <p className="mt-2 text-xs font-bold text-slate-400">
              {dose.status === 'applied'
                ? 'Dose aplicada'
                : dose.status === 'skipped'
                  ? 'Dose pulada'
                  : 'Dose não registrada'}
            </p>
          )}
        </div>
      </div>

      {dose.status === 'pending' ? (
        <div className="grid grid-cols-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => void onUpdate(dose.id, 'skipped')}
            disabled={isUpdating}
            className="focus-ring inline-flex items-center justify-center gap-2 border-r border-slate-100 px-4 py-3 text-xs font-bold text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {isUpdating ? <LoaderCircle className="size-4 animate-spin" /> : <X className="size-4" />}
            Pular
          </button>
          <button
            type="button"
            onClick={() => void onUpdate(dose.id, 'applied')}
            disabled={isUpdating}
            className="focus-ring inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-brand-700 transition hover:bg-brand-50 disabled:opacity-50"
          >
            {isUpdating ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}
            Marcar aplicada
          </button>
        </div>
      ) : (
        <div className="inline-flex w-full items-center justify-center gap-2 border-t border-slate-100 px-4 py-3 text-xs font-bold text-slate-400">
          <RotateCcw className="size-3.5" />
          Registro salvo no histórico
        </div>
      )}
    </article>
  )
}

export function TodayPage() {
  const {
    doses,
    isLoading,
    loadError,
    feedback,
    clearFeedback,
    updateDoseStatus,
    refreshData,
  } = useAppData()
  const [updatingId, setUpdatingId] = useState('')
  const [actionError, setActionError] = useState('')
  const completed = doses.filter((dose) => dose.status !== 'pending').length
  const dateLabel = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(new Date())

  async function handleUpdate(
    doseId: string,
    status: 'applied' | 'skipped',
  ) {
    setUpdatingId(doseId)
    setActionError('')
    try {
      await updateDoseStatus(doseId, status)
    } catch (error) {
      setActionError(getFriendlyDataError(error))
    } finally {
      setUpdatingId('')
    }
  }

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Agenda diária"
        title="Cuidados de hoje"
        description={dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}
      />

      {feedback && <FeedbackBanner {...feedback} onDismiss={clearFeedback} />}
      {actionError && <FeedbackBanner type="error" message={actionError} />}

      {isLoading ? (
        <DataLoading label="Carregando doses de hoje..." />
      ) : loadError ? (
        <DataError message={loadError} onRetry={() => void refreshData()} />
      ) : (
        <>
          {doses.length > 0 && (
            <section className="app-card flex items-center gap-4 p-4">
              <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                <Clock3 className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3 text-xs font-bold">
                  <span className="text-slate-700">Progresso do dia</span>
                  <span className="text-brand-700">
                    {completed} de {doses.length}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400 transition-all"
                    style={{ width: `${(completed / doses.length) * 100}%` }}
                  />
                </div>
              </div>
            </section>
          )}

          {doses.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="size-6" />}
              title="Agenda livre"
              description="Nenhuma dose ou cuidado foi programado para hoje."
            />
          ) : (
            <div className="space-y-3">
              {doses.map((dose) => (
                <DoseCard
                  key={dose.id}
                  dose={dose}
                  updatingId={updatingId}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
