import { ChevronRight, HeartPulse, LoaderCircle, PawPrint, Plus, ShieldPlus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppData } from '../../shared/app-data-context'
import { formatShortDate } from '../../shared/date'
import { getFriendlyDataError } from '../../shared/errors'
import { formatApproximateAge } from '../../shared/pet'
import { PetAvatar } from '../../shared/PetAvatar'
import {
  DataError,
  DataLoading,
  EmptyState,
  FeedbackBanner,
  PageIntro,
} from '../../shared/ui'
import { formatWeight } from '../../shared/weight'

export function PetsPage() {
  const {
    pets,
    treatments,
    isLoading,
    loadError,
    feedback,
    clearFeedback,
    deletePet,
    refreshData,
    getPetWeights,
    getPetVaccines,
  } = useAppData()
  const [deletingId, setDeletingId] = useState('')
  const [actionError, setActionError] = useState('')

  async function handleDelete(petId: string, petName: string) {
    const confirmed = window.confirm(
      `Excluir ${petName}? Tratamentos, vacinas, pesos e doses também serão removidos.`,
    )
    if (!confirmed) return

    setDeletingId(petId)
    setActionError('')
    try {
      await deletePet(petId)
    } catch (error) {
      setActionError(getFriendlyDataError(error))
    } finally {
      setDeletingId('')
    }
  }

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Família"
        title="Meus pets"
        description="Saúde, vacinas, peso e tratamentos de cada companheiro."
        action={
          <Link
            to="/app/pets/new"
            className="focus-ring grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
            aria-label="Cadastrar novo pet"
          >
            <Plus className="size-5" />
          </Link>
        }
      />

      {feedback && <FeedbackBanner {...feedback} onDismiss={clearFeedback} />}
      {actionError && <FeedbackBanner type="error" message={actionError} />}

      {isLoading ? (
        <DataLoading label="Carregando seus pets..." />
      ) : loadError ? (
        <DataError message={loadError} onRetry={() => void refreshData()} />
      ) : pets.length === 0 ? (
        <EmptyState
          icon={<PawPrint className="size-6" />}
          title="Nenhum pet cadastrado"
          description="Cadastre seu primeiro pet para começar a organizar os cuidados."
          action={
            <Link
              to="/app/pets/new"
              className="focus-ring inline-flex rounded-2xl bg-brand-600 px-5 py-3 text-sm font-bold text-white"
            >
              Cadastrar pet
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {pets.map((pet) => {
            const lastWeight = getPetWeights(pet.id)[0]
            const activeTreatments = treatments.filter(
              (treatment) =>
                treatment.petId === pet.id && treatment.status === 'active',
            ).length
            const nextVaccine = getPetVaccines(pet.id).find(
              (vaccine) => vaccine.nextDueAt,
            )
            const classification = [
              pet.species,
              pet.specificSpecies,
              pet.subspeciesOrMorph,
            ].filter(Boolean)
            const approximateAge = formatApproximateAge(
              pet.approximateAge,
              pet.approximateAgeUnit,
            )

            return (
              <article key={pet.id} className="app-card overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  <Link
                    to={`/app/pets/${pet.id}`}
                    className="focus-ring flex min-w-0 flex-1 items-center gap-4 rounded-2xl"
                  >
                    <PetAvatar pet={pet} size="lg" />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-lg font-extrabold text-slate-900">
                        {pet.name}
                      </h2>
                      <p className="mt-0.5 truncate text-sm text-slate-500">
                        {classification.join(' • ')}
                      </p>
                      {pet.animalGroup && (
                        <p className="mt-1 truncate text-xs font-semibold text-brand-700">
                          {pet.animalGroup}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(lastWeight || pet.weightKg !== null) && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                            {formatWeight(
                              lastWeight?.weightKg ?? pet.weightKg ?? 0,
                              pet.weightUnit,
                            )}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-600">
                          <HeartPulse className="size-3" />
                          {activeTreatments}
                        </span>
                        {approximateAge && (
                          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700">
                            {approximateAge}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="size-5 shrink-0 text-slate-300" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleDelete(pet.id, pet.name)}
                    disabled={deletingId === pet.id}
                    className="focus-ring grid size-10 shrink-0 place-items-center rounded-2xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                    aria-label={`Excluir ${pet.name}`}
                  >
                    {deletingId === pet.id ? (
                      <LoaderCircle className="size-5 animate-spin" />
                    ) : (
                      <Trash2 className="size-5" />
                    )}
                  </button>
                </div>

                <Link
                  to={`/app/pets/${pet.id}`}
                  className="focus-ring flex items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-xs font-semibold text-slate-500"
                >
                  <ShieldPlus className="size-4 text-brand-600" />
                  {nextVaccine?.nextDueAt
                    ? `Próxima vacina: ${nextVaccine.name} em ${formatShortDate(nextVaccine.nextDueAt)}`
                    : 'Nenhuma próxima vacina cadastrada'}
                </Link>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
