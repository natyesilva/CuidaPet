import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck2,
  HeartPulse,
  PawPrint,
  Plus,
  Scale,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppData } from '../../shared/app-data-context'
import { daysSince, formatRecordedAgo, formatTime } from '../../shared/date'
import { getPetEmoji } from '../../shared/pet'
import { DataError, DataLoading, PageIntro } from '../../shared/ui'
import { formatWeightKg } from '../../shared/weight'
import { useAuth } from '../auth/auth-context'

export function HomePage() {
  const { user } = useAuth()
  const {
    pets,
    treatments,
    doses,
    weightRecords,
    getPet,
    isLoading,
    loadError,
    refreshData,
  } = useAppData()
  const pendingDoses = doses.filter((dose) => dose.status === 'pending')
  const nextDose = [...pendingDoses].sort((a, b) =>
    a.scheduledAt.localeCompare(b.scheduledAt),
  )[0]
  const displayName =
    user?.user_metadata.name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'tutor'
  const petWeights = pets
    .map((pet) => ({
      pet,
      latest: weightRecords
        .filter((record) => record.petId === pet.id)
        .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0],
    }))
    .filter((item) => item.latest)

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Seu painel"
        title={`Olá, ${displayName}!`}
        description="Tudo o que seus pets precisam, sem perder nenhum cuidado."
      />

      {isLoading ? (
        <DataLoading label="Carregando seu resumo..." />
      ) : loadError ? (
        <DataError message={loadError} onRetry={() => void refreshData()} />
      ) : (
        <>
          <section className="overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-700 via-brand-600 to-cyan-500 p-6 text-white shadow-xl shadow-brand-700/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                  <Sparkles className="size-3.5" />
                  Resumo de hoje
                </span>
                <h2 className="mt-5 text-2xl font-extrabold">
                  {pendingDoses.length === 0
                    ? 'Cuidados em dia!'
                    : `${pendingDoses.length} ${pendingDoses.length === 1 ? 'cuidado pendente' : 'cuidados pendentes'}`}
                </h2>
                <p className="mt-2 max-w-xs text-sm leading-6 text-brand-50/90">
                  {nextDose
                    ? `Próximo: ${nextDose.medicationName} para ${getPet(nextDose.petId)?.name ?? 'seu pet'}, às ${formatTime(nextDose.scheduledAt)}.`
                    : 'Você concluiu toda a agenda programada para hoje.'}
                </p>
              </div>
              <CalendarCheck2 className="size-12 shrink-0 text-white/25" strokeWidth={1.5} />
            </div>
            <Link
              to="/app/today"
              className="focus-ring mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-brand-800 shadow-lg shadow-brand-900/15 transition hover:-translate-y-0.5"
            >
              Ver agenda de hoje
              <ArrowRight className="size-4" />
            </Link>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <Link to="/app/pets" className="app-card focus-ring p-4 transition hover:-translate-y-0.5">
              <span className="grid size-10 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
                <PawPrint className="size-5" />
              </span>
              <strong className="mt-5 block text-2xl font-extrabold text-slate-900">{pets.length}</strong>
              <span className="text-xs font-semibold text-slate-500">pets cadastrados</span>
            </Link>
            <Link to="/app/treatments" className="app-card focus-ring p-4 transition hover:-translate-y-0.5">
              <span className="grid size-10 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                <HeartPulse className="size-5" />
              </span>
              <strong className="mt-5 block text-2xl font-extrabold text-slate-900">
                {treatments.filter((treatment) => treatment.status === 'active').length}
              </strong>
              <span className="text-xs font-semibold text-slate-500">tratamentos ativos</span>
            </Link>
          </section>

          <section className="app-card overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                  <Scale className="size-5" />
                </span>
                <div>
                  <h2 className="font-extrabold text-slate-900">Controle de Peso</h2>
                  <p className="text-xs text-slate-500">Acompanhe as últimas medições</p>
                </div>
              </div>
              <Link
                to="/app/pets"
                className="focus-ring rounded-xl text-xs font-extrabold text-brand-700"
              >
                Ver pets
              </Link>
            </div>

            {petWeights.length === 0 ? (
              <div className="p-5 text-sm leading-6 text-slate-500">
                Nenhum peso registrado. Abra um pet para adicionar a primeira medição.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {petWeights.map(({ pet, latest }) => {
                  const isOutdated = daysSince(latest.recordedAt) > 30

                  return (
                    <Link
                      key={pet.id}
                      to={`/app/pets/${pet.id}`}
                      className="focus-ring flex items-center gap-4 p-4 transition hover:bg-brand-50/40"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-cyan-50 text-xl">
                        {getPetEmoji(pet.species)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate text-sm text-slate-900">
                          {pet.name}
                        </strong>
                        <span className="mt-1 block text-sm font-bold text-brand-700">
                          Último peso: {formatWeightKg(latest.weightKg)} kg
                        </span>
                        <span
                          className={`mt-1 flex items-center gap-1 text-xs font-semibold ${
                            isOutdated ? 'text-amber-700' : 'text-slate-400'
                          }`}
                        >
                          {isOutdated && <AlertTriangle className="size-3.5" />}
                          {formatRecordedAgo(latest.recordedAt)}
                          {isOutdated && ' · Atualização recomendada'}
                        </span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-slate-300" />
                    </Link>
                  )
                })}
              </div>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-extrabold text-slate-900">Acesso rápido</h2>
              <span className="text-xs font-semibold text-slate-400">Organize a rotina</span>
            </div>
            <div className="app-card divide-y divide-slate-100 overflow-hidden">
              <Link
                to="/app/pets/new"
                className="focus-ring flex items-center gap-4 p-4 transition hover:bg-brand-50/50"
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                  <Plus className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block text-sm text-slate-900">Cadastrar pet</strong>
                  <small className="text-slate-500">Adicione um novo companheiro</small>
                </span>
                <ArrowRight className="size-4 text-slate-300" />
              </Link>
              <Link
                to="/app/treatments/new"
                className="focus-ring flex items-center gap-4 p-4 transition hover:bg-blue-50/50"
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                  <HeartPulse className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block text-sm text-slate-900">Novo tratamento</strong>
                  <small className="text-slate-500">Programe medicação e horários</small>
                </span>
                <ArrowRight className="size-4 text-slate-300" />
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
