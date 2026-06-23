import { CalendarDays, Clock3, HeartPulse, Plus, Stethoscope } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppData } from '../../shared/app-data-context'
import { formatShortDate, formatTime } from '../../shared/date'
import {
  DataError,
  DataLoading,
  EmptyState,
  FeedbackBanner,
  PageIntro,
} from '../../shared/ui'

const statusLabels: Record<string, string> = {
  active: 'Ativo',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
}

export function TreatmentsPage() {
  const {
    treatments,
    getPet,
    isLoading,
    loadError,
    feedback,
    clearFeedback,
    refreshData,
  } = useAppData()

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Rotina de saúde"
        title="Tratamentos"
        description="Medicamentos, horários e orientações organizados por pet."
        action={
          <Link
            to="/app/treatments/new"
            className="focus-ring grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
            aria-label="Cadastrar novo tratamento"
          >
            <Plus className="size-5" />
          </Link>
        }
      />

      {feedback && <FeedbackBanner {...feedback} onDismiss={clearFeedback} />}

      {isLoading ? (
        <DataLoading label="Carregando tratamentos..." />
      ) : loadError ? (
        <DataError message={loadError} onRetry={() => void refreshData()} />
      ) : treatments.length === 0 ? (
        <EmptyState
          icon={<HeartPulse className="size-6" />}
          title="Nenhum tratamento"
          description="Adicione o primeiro tratamento para montar a agenda de doses."
          action={
            <Link
              to="/app/treatments/new"
              className="focus-ring inline-flex rounded-2xl bg-brand-600 px-5 py-3 text-sm font-bold text-white"
            >
              Novo tratamento
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {treatments.map((treatment) => {
            const pet = getPet(treatment.petId)

            return (
              <article key={treatment.id} className="app-card overflow-hidden">
                <div className="flex items-start gap-4 p-5">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                    <HeartPulse className="size-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-extrabold text-slate-900">
                          {treatment.medicationName}
                        </h2>
                        <p className="mt-1 text-sm font-semibold text-brand-700">
                          {pet?.name ?? 'Pet'} · {treatment.dose} {treatment.doseUnit}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
                          treatment.status === 'active'
                            ? 'bg-brand-50 text-brand-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {statusLabels[treatment.status] ?? treatment.status}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-2 text-xs font-medium text-slate-500">
                      <p className="flex items-center gap-2">
                        <Clock3 className="size-4 text-slate-400" />
                        A cada {treatment.frequencyHours} horas · início às{' '}
                        {formatTime(treatment.startAt)}
                      </p>
                      <p className="flex items-center gap-2">
                        <CalendarDays className="size-4 text-slate-400" />
                        {formatShortDate(treatment.startAt)} até{' '}
                        {formatShortDate(treatment.endAt)}
                      </p>
                      {treatment.veterinarianName && (
                        <p className="flex items-center gap-2">
                          <Stethoscope className="size-4 text-slate-400" />
                          {treatment.veterinarianName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {treatment.instructions && (
                  <p className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs leading-5 text-slate-500">
                    {treatment.instructions}
                  </p>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
