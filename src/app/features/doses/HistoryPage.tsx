import { CheckCircle2, Clock3, XCircle } from 'lucide-react'
import { useAppData } from '../../shared/app-data-context'
import { formatDateTime } from '../../shared/date'
import {
  DataError,
  DataLoading,
  EmptyState,
  PageIntro,
} from '../../shared/ui'

export function HistoryPage() {
  const { history, getPet, isLoading, loadError, refreshData } = useAppData()

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Acompanhamento"
        title="Histórico"
        description="Veja as doses aplicadas e puladas, da mais recente para a mais antiga."
      />

      {isLoading ? (
        <DataLoading label="Carregando histórico..." />
      ) : loadError ? (
        <DataError message={loadError} onRetry={() => void refreshData()} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="app-card p-4">
              <strong className="text-2xl font-extrabold text-brand-700">
                {history.filter((item) => item.status === 'applied').length}
              </strong>
              <p className="mt-1 text-xs font-semibold text-slate-500">doses aplicadas</p>
            </div>
            <div className="app-card p-4">
              <strong className="text-2xl font-extrabold text-slate-500">
                {history.filter((item) => item.status === 'skipped').length}
              </strong>
              <p className="mt-1 text-xs font-semibold text-slate-500">doses puladas</p>
            </div>
          </div>

          {history.length === 0 ? (
            <EmptyState
              icon={<Clock3 className="size-6" />}
              title="Histórico vazio"
              description="As doses aplicadas ou puladas aparecerão aqui."
            />
          ) : (
            <div className="app-card divide-y divide-slate-100 overflow-hidden">
              {history.map((item) => {
                const isApplied = item.status === 'applied'

                return (
                  <article key={item.id} className="flex items-start gap-4 p-4">
                    <span
                      className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
                        isApplied ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isApplied ? <CheckCircle2 className="size-5" /> : <XCircle className="size-5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-sm font-extrabold text-slate-900">
                        {item.medicationName}
                      </h2>
                      <p className="mt-1 truncate text-xs font-medium text-slate-500">
                        {getPet(item.petId)?.name ?? 'Pet'} · {item.dose} {item.doseUnit}
                      </p>
                      <dl className="mt-3 grid gap-1 text-[11px] text-slate-500">
                        <div className="flex gap-1">
                          <dt className="font-bold">Prevista:</dt>
                          <dd>{formatDateTime(item.scheduledAt)}</dd>
                        </div>
                        <div className="flex gap-1">
                          <dt className="font-bold">Aplicada:</dt>
                          <dd>{formatDateTime(item.appliedAt)}</dd>
                        </div>
                      </dl>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-extrabold uppercase ${
                        isApplied
                          ? 'bg-brand-50 text-brand-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isApplied ? 'Aplicada' : 'Pulada'}
                    </span>
                  </article>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
