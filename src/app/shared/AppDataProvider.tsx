import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useAuth } from '../features/auth/auth-context'
import {
  notificationService,
  type DoseNotificationInput,
  type NotificationScheduleResult,
} from '../features/notifications/notificationService'
import { dosesService } from '../services/dosesService'
import {
  petsService,
  type CreatePetInput,
  type UpdatePetInput,
} from '../services/petsService'
import { petPhotoService } from '../services/petPhotoService'
import {
  petVaccineService,
  type VaccineInput,
} from '../services/petVaccineService'
import {
  petWeightService,
  type CreateWeightInput,
} from '../services/petWeightService'
import {
  treatmentsService,
  type CreateTreatmentInput,
} from '../services/treatmentsService'
import { inferAnimalGroupForSpecies } from '../services/speciesOptions'
import {
  AppDataContext,
  type AppDataContextValue,
  type AppFeedback,
  type Dose,
  type DoseStatus,
  type Pet,
  type Treatment,
  type Vaccine,
  type WeightRecord,
} from './app-data-context'
import { getFriendlyDataError } from './errors'

type AppData = Pick<
  AppDataContextValue,
  'pets' | 'treatments' | 'doses' | 'history' | 'weightRecords' | 'vaccines'
  | 'agendaDoses'
> & {
  notificationDoses: Dose[]
}

const emptyData: AppData = {
  pets: [],
  treatments: [],
  doses: [],
  agendaDoses: [],
  history: [],
  weightRecords: [],
  vaccines: [],
  notificationDoses: [],
}

const demoStorageKey = 'cuidapet:demo-data'

type FutureDoseInfo = {
  id: string
  treatmentId: string
  petId: string
  scheduledAt: string
}

function buildDoseNotifications(
  futureDoses: FutureDoseInfo[],
  pets: Pet[],
  treatments: Treatment[],
): DoseNotificationInput[] {
  const petMap = new Map(pets.map((pet) => [pet.id, pet]))
  const treatmentMap = new Map(
    treatments.map((treatment) => [treatment.id, treatment]),
  )

  return futureDoses.flatMap((dose) => {
    const pet = petMap.get(dose.petId)
    const treatment = treatmentMap.get(dose.treatmentId)

    if (!pet || !treatment || treatment.status !== 'active') return []

    return [
      {
        doseScheduleId: dose.id,
        treatmentId: dose.treatmentId,
        petId: dose.petId,
        petName: pet.name,
        medicationName: treatment.medicationName,
        dose: treatment.dose,
        doseUnit: treatment.doseUnit,
        scheduledAt: dose.scheduledAt,
      },
    ]
  })
}

function webNotificationResult(): NotificationScheduleResult {
  return {
    supported: false,
    permission: 'unsupported',
    scheduled: 0,
    alreadyScheduled: 0,
    cancelled: 0,
    pending: 0,
  }
}

function treatmentNotificationFeedback(
  notificationAttempt: {
    failed: boolean
    result: NotificationScheduleResult
  },
  doseCount: number,
) {
  const doseSummary = `Tratamento criado com ${doseCount} dose(s).`
  const notificationResult = notificationAttempt.result

  if (notificationAttempt.failed) {
    return `${doseSummary} Não foi possível agendar os lembretes agora. Use “Sincronizar lembretes” no Perfil.`
  }

  if (!notificationResult.supported) {
    return `${doseSummary} Notificações reais funcionam no aplicativo instalado.`
  }

  if (notificationResult.permission !== 'granted') {
    return `${doseSummary} Ative as notificações no Perfil para receber os lembretes.`
  }

  if (notificationResult.scheduled === 0) {
    return `${doseSummary} Nenhum lembrete futuro novo foi agendado. ${notificationResult.pending} notificação(ões) pendente(s) no aparelho.`
  }

  return `${doseSummary} ${notificationResult.scheduled} lembrete(s) futuro(s) agendado(s) automaticamente. ${notificationResult.pending} notificação(ões) pendente(s) no aparelho.`
}

async function scheduleNotificationsSafely(
  doses: DoseNotificationInput[],
  requestPermission = false,
) {
  try {
    return {
      failed: false,
      result: await notificationService.scheduleTreatmentNotifications(
        doses,
        { requestPermission },
      ),
    }
  } catch {
    return {
      failed: true,
      result: {
        ...webNotificationResult(),
        supported: notificationService.isSupported(),
        permission: notificationService.isSupported()
          ? 'prompt' as const
          : 'unsupported' as const,
      },
    }
  }
}

async function cancelDoseNotificationSafely(doseScheduleId: string) {
  try {
    await notificationService.cancelDoseNotification(doseScheduleId)
  } catch {
    // A atualização da dose não deve falhar se o sistema operacional
    // não conseguir remover um lembrete local.
  }
}

async function cancelTreatmentNotificationsSafely(treatmentId: string) {
  try {
    await notificationService.cancelTreatmentNotifications(treatmentId)
  } catch {
    // O tratamento continua salvo mesmo que o Android não permita
    // alterar os lembretes naquele momento.
  }
}

function createDemoData(): AppData {
    const now = new Date()
    const morning = new Date(now)
    morning.setHours(8, 0, 0, 0)
    const evening = new Date(now)
    evening.setHours(20, 0, 0, 0)
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(20, 0, 0, 0)
    const fiveDaysAgo = new Date(now)
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
    const thirtyOneDaysAgo = new Date(now)
    thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31)

    const pets: Pet[] = [
      {
        id: 'demo-pet-luna',
        name: 'Luna',
        animalGroup: 'Cachorro/Gato',
        species: 'Cachorro',
        specificSpecies: null,
        subspeciesOrMorph: null,
        breed: 'Golden Retriever',
        sex: 'Fêmea',
        photoUrl: null,
        approximateAge: null,
        approximateAgeUnit: null,
        weightKg: 24,
        weightUnit: 'kg',
        birthDate: '2021-03-14',
        notes: 'Dados de demonstração.',
      },
      {
        id: 'demo-pet-mingau',
        name: 'Mingau',
        animalGroup: 'Cachorro/Gato',
        species: 'Gato',
        specificSpecies: null,
        subspeciesOrMorph: null,
        breed: 'SRD',
        sex: 'Macho',
        photoUrl: null,
        approximateAge: null,
        approximateAgeUnit: null,
        weightKg: 5,
        weightUnit: 'kg',
        birthDate: '2022-09-02',
        notes: null,
      },
      {
        id: 'demo-pet-sol',
        name: 'Sol',
        animalGroup: 'Réptil',
        species: 'Cobra',
        specificSpecies: 'Corn snake',
        subspeciesOrMorph: 'Amelanística',
        breed: null,
        sex: 'Fêmea',
        photoUrl: null,
        approximateAge: null,
        approximateAgeUnit: null,
        weightKg: 0.42,
        weightUnit: 'g',
        birthDate: '2023-11-10',
        notes: 'Exemplo de animal exótico com espécie específica e morfo.',
      },
    ]

    const treatments: Treatment[] = [
      {
        id: 'demo-treatment-antibiotico',
        petId: 'demo-pet-luna',
        medicationName: 'Antibiótico',
        dose: '1',
        doseUnit: 'comprimido',
        frequencyHours: 12,
        startAt: morning.toISOString(),
        endAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        instructions: 'Oferecer depois da refeição.',
        veterinarianName: 'Dra. Ana',
        status: 'active',
      },
    ]

    const baseDose = {
      treatmentId: 'demo-treatment-antibiotico',
      petId: 'demo-pet-luna',
      medicationName: 'Antibiótico',
      dose: '1',
      doseUnit: 'comprimido',
      notes: null,
    }

    const doses: Dose[] = [
      {
        ...baseDose,
        id: 'demo-dose-morning',
        scheduledAt: morning.toISOString(),
        status: 'pending',
        appliedAt: null,
      },
      {
        ...baseDose,
        id: 'demo-dose-evening',
        scheduledAt: evening.toISOString(),
        status: 'pending',
        appliedAt: null,
      },
    ]

    const history: Dose[] = [
      {
        ...baseDose,
        id: 'demo-history-yesterday',
        scheduledAt: yesterday.toISOString(),
        status: 'applied',
        appliedAt: new Date(yesterday.getTime() + 5 * 60 * 1000).toISOString(),
      },
    ]

    return {
      pets,
      treatments,
      doses,
      agendaDoses: [...doses, ...history],
      history,
      weightRecords: [
        {
          id: 'demo-weight-luna',
          petId: 'demo-pet-luna',
          weightKg: 24,
          recordedAt: fiveDaysAgo.toISOString().slice(0, 10),
          notes: 'Peso de demonstração.',
        },
        {
          id: 'demo-weight-mingau',
          petId: 'demo-pet-mingau',
          weightKg: 5,
          recordedAt: thirtyOneDaysAgo.toISOString().slice(0, 10),
          notes: null,
        },
        {
          id: 'demo-weight-sol',
          petId: 'demo-pet-sol',
          weightKg: 0.42,
          recordedAt: fiveDaysAgo.toISOString().slice(0, 10),
          notes: 'Peso em kg equivalente a 420 g.',
        },
      ],
      vaccines: [
        {
          id: 'demo-vaccine-luna',
          petId: 'demo-pet-luna',
          name: 'V10',
          appliedAt: now.toISOString().slice(0, 10),
          nextDueAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10),
          veterinarianName: 'Dra. Ana',
          clinicName: 'Clínica Amigo Pet',
          notes: null,
        },
      ],
      notificationDoses: [],
    }
}

function persistDemoData(nextData: AppData) {
  localStorage.setItem(demoStorageKey, JSON.stringify(nextData))
}

export function AppDataProvider({ children }: PropsWithChildren) {
  const { user, isDemoMode } = useAuth()
  const [data, setData] = useState<AppData>(emptyData)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [feedback, setFeedback] = useState<AppFeedback | null>(null)

  const refreshData = useCallback(async () => {
    if (!user) {
      setData(emptyData)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setLoadError('')

    if (isDemoMode) {
      try {
        const stored = localStorage.getItem(demoStorageKey)
        let nextData: AppData
        if (!stored) {
          nextData = createDemoData()
        } else {
          const parsed = JSON.parse(stored) as Partial<AppData>
          nextData = {
            pets: (parsed.pets ?? []).map((pet) => ({
              ...pet,
              animalGroup: pet.animalGroup ?? null,
              specificSpecies: pet.specificSpecies ?? null,
              subspeciesOrMorph: pet.subspeciesOrMorph ?? null,
              sex: pet.sex ?? null,
              photoUrl: pet.photoUrl ?? null,
              approximateAge: pet.approximateAge ?? null,
              approximateAgeUnit: pet.approximateAgeUnit ?? null,
              weightUnit: pet.weightUnit ?? 'kg',
            })),
            treatments: parsed.treatments ?? [],
            doses: parsed.doses ?? [],
            agendaDoses: parsed.agendaDoses ?? [
              ...(parsed.doses ?? []),
              ...(parsed.history ?? []),
            ],
            history: parsed.history ?? [],
            weightRecords: parsed.weightRecords ?? [],
            vaccines: parsed.vaccines ?? [],
            notificationDoses: parsed.notificationDoses ?? [],
          }
        }
        setData(nextData)
        void notificationService
          .syncPendingNotifications(
            buildDoseNotifications(
              nextData.notificationDoses
                .filter((dose) => dose.status === 'pending')
                .map((dose) => ({
                  id: dose.id,
                  treatmentId: dose.treatmentId,
                  petId: dose.petId,
                  scheduledAt: dose.scheduledAt,
                })),
              nextData.pets,
              nextData.treatments,
            ),
          )
          .catch(() => undefined)
      } catch {
        setData(createDemoData())
      } finally {
        setIsLoading(false)
      }
      return
    }

    try {
      const [
        petRows,
        treatmentRows,
        doseRows,
        agendaDoseRows,
        historyRows,
        weightRows,
        vaccineRows,
        futureDoseRows,
      ] = await Promise.all([
        petsService.list(user.id),
        treatmentsService.list(user.id),
        dosesService.listToday(user.id),
        dosesService.listAgenda(user.id),
        dosesService.listHistory(user.id),
        petWeightService.list(user.id),
        petVaccineService.list(user.id),
        dosesService.listFuturePending(user.id),
      ])

      const pets: Pet[] = petRows.map((pet) => ({
        id: pet.id,
        name: pet.name,
        animalGroup: pet.animal_group ?? inferAnimalGroupForSpecies(pet.species),
        species: pet.species,
        specificSpecies: pet.specific_species,
        subspeciesOrMorph: pet.subspecies_or_morph,
        breed: pet.breed,
        sex: pet.sex,
        photoUrl: pet.photo_url,
        approximateAge: pet.approximate_age,
        approximateAgeUnit:
          pet.approximate_age_unit === 'months' || pet.approximate_age_unit === 'years'
            ? pet.approximate_age_unit
            : null,
        weightKg: pet.weight_kg,
        weightUnit: pet.weight_unit,
        birthDate: pet.birth_date,
        notes: pet.notes,
      }))

      const treatments: Treatment[] = treatmentRows.map((treatment) => ({
        id: treatment.id,
        petId: treatment.pet_id,
        medicationName: treatment.medication_name,
        dose: treatment.dose,
        doseUnit: treatment.dose_unit,
        frequencyHours: treatment.frequency_hours,
        startAt: treatment.start_at,
        endAt: treatment.end_at,
        instructions: treatment.instructions,
        veterinarianName: treatment.veterinarian_name,
        status: treatment.status,
      }))

      const treatmentMap = new Map(
        treatments.map((treatment) => [treatment.id, treatment]),
      )

      const mapDose = (dose: (typeof doseRows)[number]): Dose => {
        const treatment = treatmentMap.get(dose.treatment_id)

        return {
          id: dose.id,
          treatmentId: dose.treatment_id,
          petId: dose.pet_id,
          scheduledAt: dose.scheduled_at,
          status: dose.status as DoseStatus,
          appliedAt: dose.applied_at,
          notes: dose.notes,
          medicationName: treatment?.medicationName ?? 'Tratamento removido',
          dose: treatment?.dose ?? '',
          doseUnit: treatment?.doseUnit ?? '',
        }
      }

      const nextData: AppData = {
        pets,
        treatments,
        doses: doseRows.map(mapDose),
        agendaDoses: agendaDoseRows.map(mapDose),
        history: historyRows.map(mapDose),
        weightRecords: weightRows.map((record): WeightRecord => ({
          id: record.id,
          petId: record.pet_id,
          weightKg: record.weight_kg,
          recordedAt: record.recorded_at,
          notes: record.notes,
        })),
        vaccines: vaccineRows.map((vaccine): Vaccine => ({
          id: vaccine.id,
          petId: vaccine.pet_id,
          name: vaccine.name,
          appliedAt: vaccine.applied_at,
          nextDueAt: vaccine.next_due_at,
          veterinarianName: vaccine.veterinarian_name,
          clinicName: vaccine.clinic_name,
          notes: vaccine.notes,
        })),
        notificationDoses: [],
      }
      setData(nextData)
      void notificationService
        .syncPendingNotifications(
          buildDoseNotifications(
            futureDoseRows.map((dose) => ({
              id: dose.id,
              treatmentId: dose.treatment_id,
              petId: dose.pet_id,
              scheduledAt: dose.scheduled_at,
            })),
            pets,
            treatments,
          ),
        )
        .catch(() => undefined)
    } catch (error) {
      setLoadError(getFriendlyDataError(error))
    } finally {
      setIsLoading(false)
    }
  }, [isDemoMode, user])

  useEffect(() => {
    void refreshData()
  }, [refreshData])

  const addPet = useCallback(
    async (pet: CreatePetInput) => {
      if (!user) throw new Error('Sessão expirada. Entre novamente.')

      if (isDemoMode) {
        const petId = `demo-pet-${crypto.randomUUID()}`
        const initialWeight: WeightRecord[] =
          pet.weightKg && pet.weightKg > 0
            ? [
                {
                  id: `demo-weight-${crypto.randomUUID()}`,
                  petId,
                  weightKg: pet.weightKg,
                  recordedAt: new Date().toISOString().slice(0, 10),
                  notes: 'Peso informado no cadastro do pet.',
                },
              ]
            : []
        const nextData: AppData = {
          ...data,
          pets: [
            {
              id: petId,
              name: pet.name,
              animalGroup: pet.animalGroup,
              species: pet.species,
              specificSpecies: pet.specificSpecies,
              subspeciesOrMorph: pet.subspeciesOrMorph,
              breed: pet.breed,
              sex: pet.sex,
              photoUrl: pet.photoUrl,
              approximateAge: pet.approximateAge,
              approximateAgeUnit: pet.approximateAgeUnit,
              weightKg: pet.weightKg,
              weightUnit: pet.weightUnit,
              birthDate: pet.birthDate,
              notes: pet.notes,
            },
            ...data.pets,
          ],
          weightRecords: [...initialWeight, ...data.weightRecords],
        }
        setData(nextData)
        persistDemoData(nextData)
        setFeedback({ type: 'success', message: 'Pet cadastrado no modo demo.' })
        return
      }

      const createdPet = await petsService.create(user.id, {
        ...pet,
        photoUrl: pet.photoFile ? null : pet.photoUrl,
      })
      if (pet.photoFile) {
        const photoUrl = await petPhotoService.upload(user.id, createdPet.id, pet.photoFile)
        await petsService.update(user.id, createdPet.id, {
          ...pet,
          photoUrl,
          photoFile: null,
        })
      }
      if (pet.weightKg && pet.weightKg > 0) {
        await petWeightService.create(user.id, createdPet.id, {
          weightKg: pet.weightKg,
          recordedAt: new Date().toISOString().slice(0, 10),
          notes: 'Peso informado no cadastro do pet.',
        })
      }
      await refreshData()
      setFeedback({ type: 'success', message: 'Pet cadastrado com sucesso.' })
    },
    [data, isDemoMode, refreshData, user],
  )

  const updatePet = useCallback(
    async (petId: string, pet: UpdatePetInput) => {
      if (!user) throw new Error('Sessão expirada. Entre novamente.')

      if (isDemoMode) {
        const nextData: AppData = {
          ...data,
          pets: data.pets.map((currentPet) =>
            currentPet.id === petId
              ? {
                  ...currentPet,
                  name: pet.name,
                  animalGroup: pet.animalGroup,
                  species: pet.species,
                  specificSpecies: pet.specificSpecies,
                  subspeciesOrMorph: pet.subspeciesOrMorph,
                  breed: pet.breed,
                  sex: pet.sex,
                  photoUrl: pet.photoUrl,
                  approximateAge: pet.approximateAge,
                  approximateAgeUnit: pet.approximateAgeUnit,
                  weightKg: pet.weightKg,
                  weightUnit: pet.weightUnit,
                  birthDate: pet.birthDate,
                  notes: pet.notes,
                }
              : currentPet,
          ),
        }
        setData(nextData)
        persistDemoData(nextData)
        setFeedback({ type: 'success', message: 'Dados do pet atualizados.' })
        return
      }

      const photoUrl = pet.photoFile
        ? await petPhotoService.upload(user.id, petId, pet.photoFile)
        : pet.photoUrl
      await petsService.update(user.id, petId, {
        ...pet,
        photoUrl,
        photoFile: null,
      })
      await refreshData()
      setFeedback({ type: 'success', message: 'Dados do pet atualizados.' })
    },
    [data, isDemoMode, refreshData, user],
  )

  const deletePet = useCallback(
    async (petId: string) => {
      if (!user) throw new Error('Sessão expirada. Entre novamente.')

      if (isDemoMode) {
        const treatmentIds = new Set(
          data.treatments
            .filter((treatment) => treatment.petId === petId)
            .map((treatment) => treatment.id),
        )
        const nextData: AppData = {
          pets: data.pets.filter((pet) => pet.id !== petId),
          treatments: data.treatments.filter((treatment) => treatment.petId !== petId),
          doses: data.doses.filter(
            (dose) => dose.petId !== petId && !treatmentIds.has(dose.treatmentId),
          ),
          agendaDoses: data.agendaDoses.filter(
            (dose) => dose.petId !== petId && !treatmentIds.has(dose.treatmentId),
          ),
          history: data.history.filter(
            (dose) => dose.petId !== petId && !treatmentIds.has(dose.treatmentId),
          ),
          weightRecords: data.weightRecords.filter(
            (record) => record.petId !== petId,
          ),
          vaccines: data.vaccines.filter((vaccine) => vaccine.petId !== petId),
          notificationDoses: data.notificationDoses.filter(
            (dose) => dose.petId !== petId,
          ),
        }
        setData(nextData)
        persistDemoData(nextData)
        await Promise.all(
          [...treatmentIds].map(cancelTreatmentNotificationsSafely),
        )
        setFeedback({ type: 'success', message: 'Pet excluído do modo demo.' })
        return
      }

      const treatmentIds = data.treatments
        .filter((treatment) => treatment.petId === petId)
        .map((treatment) => treatment.id)
      await petsService.remove(user.id, petId)
      await Promise.all(
        treatmentIds.map(cancelTreatmentNotificationsSafely),
      )
      await refreshData()
      setFeedback({ type: 'success', message: 'Pet excluído com sucesso.' })
    },
    [data, isDemoMode, refreshData, user],
  )

  const addTreatment = useCallback(
    async (treatment: CreateTreatmentInput) => {
      if (!user) throw new Error('Sessão expirada. Entre novamente.')

      if (isDemoMode) {
        const treatmentId = `demo-treatment-${crypto.randomUUID()}`
        const newTreatment: Treatment = {
          id: treatmentId,
          petId: treatment.petId,
          medicationName: treatment.medicationName,
          dose: treatment.dose,
          doseUnit: treatment.doseUnit,
          frequencyHours: treatment.frequencyHours,
          startAt: treatment.startAt,
          endAt: treatment.endAt,
          instructions: treatment.instructions,
          veterinarianName: treatment.veterinarianName,
          status: 'active',
        }
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        const todayEnd = new Date(todayStart)
        todayEnd.setDate(todayEnd.getDate() + 1)
        const newDoses: Dose[] = []
        const allNewDoses: Dose[] = []
        const frequencyMs = treatment.frequencyHours * 60 * 60 * 1000

        for (
          let scheduledAt = new Date(treatment.startAt).getTime();
          scheduledAt <= new Date(treatment.endAt).getTime();
          scheduledAt += frequencyMs
        ) {
          const newDose: Dose = {
            id: `demo-dose-${crypto.randomUUID()}`,
            treatmentId,
            petId: treatment.petId,
            scheduledAt: new Date(scheduledAt).toISOString(),
            status: 'pending',
            appliedAt: null,
            notes: null,
            medicationName: treatment.medicationName,
            dose: treatment.dose,
            doseUnit: treatment.doseUnit,
          }
          allNewDoses.push(newDose)

          if (scheduledAt >= todayStart.getTime() && scheduledAt < todayEnd.getTime()) {
            newDoses.push(newDose)
          }
        }

        const nextData: AppData = {
          ...data,
          treatments: [newTreatment, ...data.treatments],
          doses: [...data.doses, ...newDoses].sort((a, b) =>
            a.scheduledAt.localeCompare(b.scheduledAt),
          ),
          agendaDoses: [...data.agendaDoses, ...allNewDoses].sort((a, b) =>
            a.scheduledAt.localeCompare(b.scheduledAt),
          ),
          notificationDoses: [
            ...data.notificationDoses,
            ...allNewDoses,
          ].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
        }
        setData(nextData)
        persistDemoData(nextData)
        const pet = data.pets.find((item) => item.id === treatment.petId)
        const notificationAttempt = pet
          ? await scheduleNotificationsSafely(
              allNewDoses.map((dose) => ({
                doseScheduleId: dose.id,
                treatmentId,
                petId: dose.petId,
                petName: pet.name,
                medicationName: dose.medicationName,
                dose: dose.dose,
                doseUnit: dose.doseUnit,
                scheduledAt: dose.scheduledAt,
              })),
              true,
            )
          : { failed: false, result: webNotificationResult() }
        setFeedback({
          type: 'success',
          message: treatmentNotificationFeedback(
            notificationAttempt,
            allNewDoses.length,
          ),
        })
        return
      }

      const { schedules } = await treatmentsService.create(user.id, treatment)
      const pet = data.pets.find((item) => item.id === treatment.petId)
      const notificationAttempt = pet
        ? await scheduleNotificationsSafely(
            schedules.map((dose) => ({
              doseScheduleId: dose.id,
              treatmentId: dose.treatment_id,
              petId: dose.pet_id,
              petName: pet.name,
              medicationName: treatment.medicationName,
              dose: treatment.dose,
              doseUnit: treatment.doseUnit,
              scheduledAt: dose.scheduled_at,
            })),
            true,
        )
      : { failed: false, result: webNotificationResult() }
      await refreshData()
      setFeedback({
        type: 'success',
        message: treatmentNotificationFeedback(
          notificationAttempt,
          schedules.length,
        ),
      })
    },
    [data, isDemoMode, refreshData, user],
  )

  const addWeight = useCallback(
    async (petId: string, input: CreateWeightInput) => {
      if (!user) throw new Error('Sessão expirada. Entre novamente.')

      if (isDemoMode) {
        const record: WeightRecord = {
          id: `demo-weight-${crypto.randomUUID()}`,
          petId,
          weightKg: input.weightKg,
          recordedAt: input.recordedAt,
          notes: input.notes,
        }
        const nextData: AppData = {
          ...data,
          pets: data.pets.map((pet) =>
            pet.id === petId ? { ...pet, weightKg: input.weightKg } : pet,
          ),
          weightRecords: [record, ...data.weightRecords].sort((a, b) =>
            b.recordedAt.localeCompare(a.recordedAt),
          ),
        }
        setData(nextData)
        persistDemoData(nextData)
        setFeedback({ type: 'success', message: 'Peso registrado com sucesso.' })
        return
      }

      await petWeightService.create(user.id, petId, input)
      await refreshData()
      setFeedback({ type: 'success', message: 'Peso registrado com sucesso.' })
    },
    [data, isDemoMode, refreshData, user],
  )

  const addVaccine = useCallback(
    async (petId: string, input: VaccineInput) => {
      if (!user) throw new Error('Sessão expirada. Entre novamente.')

      if (isDemoMode) {
        const vaccine: Vaccine = {
          id: `demo-vaccine-${crypto.randomUUID()}`,
          petId,
          ...input,
        }
        const nextData = { ...data, vaccines: [vaccine, ...data.vaccines] }
        setData(nextData)
        persistDemoData(nextData)
        setFeedback({ type: 'success', message: 'Vacina cadastrada com sucesso.' })
        return
      }

      await petVaccineService.create(user.id, petId, input)
      await refreshData()
      setFeedback({ type: 'success', message: 'Vacina cadastrada com sucesso.' })
    },
    [data, isDemoMode, refreshData, user],
  )

  const updateVaccine = useCallback(
    async (vaccineId: string, input: VaccineInput) => {
      if (!user) throw new Error('Sessão expirada. Entre novamente.')

      if (isDemoMode) {
        const nextData = {
          ...data,
          vaccines: data.vaccines.map((vaccine) =>
            vaccine.id === vaccineId ? { ...vaccine, ...input } : vaccine,
          ),
        }
        setData(nextData)
        persistDemoData(nextData)
        setFeedback({ type: 'success', message: 'Vacina atualizada com sucesso.' })
        return
      }

      await petVaccineService.update(user.id, vaccineId, input)
      await refreshData()
      setFeedback({ type: 'success', message: 'Vacina atualizada com sucesso.' })
    },
    [data, isDemoMode, refreshData, user],
  )

  const deleteVaccine = useCallback(
    async (vaccineId: string) => {
      if (!user) throw new Error('Sessão expirada. Entre novamente.')

      if (isDemoMode) {
        const nextData = {
          ...data,
          vaccines: data.vaccines.filter((vaccine) => vaccine.id !== vaccineId),
        }
        setData(nextData)
        persistDemoData(nextData)
        setFeedback({ type: 'success', message: 'Vacina excluída com sucesso.' })
        return
      }

      await petVaccineService.remove(user.id, vaccineId)
      await refreshData()
      setFeedback({ type: 'success', message: 'Vacina excluída com sucesso.' })
    },
    [data, isDemoMode, refreshData, user],
  )

  const changeTreatmentStatus = useCallback(
    async (
      treatmentId: string,
      status: 'completed' | 'cancelled',
    ) => {
      if (!user) throw new Error('Sessão expirada. Entre novamente.')

      if (isDemoMode) {
        const nextData = {
          ...data,
          treatments: data.treatments.map((treatment) =>
            treatment.id === treatmentId
              ? { ...treatment, status }
              : treatment,
          ),
        }
        setData(nextData)
        persistDemoData(nextData)
      } else {
        await treatmentsService.updateStatus(user.id, treatmentId, status)
        await refreshData()
      }

      await cancelTreatmentNotificationsSafely(treatmentId)
      setFeedback({
        type: 'success',
        message:
          status === 'completed'
            ? 'Tratamento finalizado e lembretes futuros cancelados.'
            : 'Tratamento cancelado e lembretes futuros removidos.',
      })
    },
    [data, isDemoMode, refreshData, user],
  )

  const deleteTreatment = useCallback(
    async (treatmentId: string) => {
      if (!user) throw new Error('Sessão expirada. Entre novamente.')

      if (isDemoMode) {
        const nextData: AppData = {
          ...data,
          treatments: data.treatments.filter(
            (treatment) => treatment.id !== treatmentId,
          ),
          doses: data.doses.filter(
            (dose) => dose.treatmentId !== treatmentId,
          ),
          agendaDoses: data.agendaDoses.filter(
            (dose) => dose.treatmentId !== treatmentId,
          ),
          history: data.history.filter(
            (dose) => dose.treatmentId !== treatmentId,
          ),
          notificationDoses: data.notificationDoses.filter(
            (dose) => dose.treatmentId !== treatmentId,
          ),
        }
        setData(nextData)
        persistDemoData(nextData)
      } else {
        await treatmentsService.remove(user.id, treatmentId)
        await refreshData()
      }

      await cancelTreatmentNotificationsSafely(treatmentId)
      setFeedback({
        type: 'success',
        message: 'Tratamento e lembretes excluídos.',
      })
    },
    [data, isDemoMode, refreshData, user],
  )

  const updateDoseStatus = useCallback(
    async (doseId: string, status: 'applied' | 'skipped') => {
      if (!user) throw new Error('Sessão expirada. Entre novamente.')

      if (isDemoMode) {
        const currentDose = data.doses.find((dose) => dose.id === doseId)
        if (!currentDose) return

        const updatedDose: Dose = {
          ...currentDose,
          status,
          appliedAt: status === 'applied' ? new Date().toISOString() : null,
        }
        const nextData: AppData = {
          ...data,
          doses: data.doses.map((dose) => (dose.id === doseId ? updatedDose : dose)),
          agendaDoses: data.agendaDoses.map((dose) =>
            dose.id === doseId ? updatedDose : dose,
          ),
          history: [
            updatedDose,
            ...data.history.filter((dose) => dose.id !== doseId),
          ],
          notificationDoses: data.notificationDoses.map((dose) =>
            dose.id === doseId ? updatedDose : dose,
          ),
        }
        setData(nextData)
        persistDemoData(nextData)
        setFeedback({
          type: 'success',
          message:
            status === 'applied'
              ? 'Dose marcada como aplicada.'
              : 'Dose marcada como pulada.',
        })
        await cancelDoseNotificationSafely(doseId)
        return
      }

      await dosesService.updateStatus(user.id, doseId, status)
      await cancelDoseNotificationSafely(doseId)
      await refreshData()
      setFeedback({
        type: 'success',
        message:
          status === 'applied'
            ? 'Dose marcada como aplicada.'
            : 'Dose marcada como pulada.',
      })
    },
    [data, isDemoMode, refreshData, user],
  )

  const syncNotifications = useCallback(async () => {
    if (!user) throw new Error('Sessão expirada. Entre novamente.')

    if (isDemoMode) {
      return notificationService.syncPendingNotifications(
        buildDoseNotifications(
          data.notificationDoses
            .filter((dose) => dose.status === 'pending')
            .map((dose) => ({
              id: dose.id,
              treatmentId: dose.treatmentId,
              petId: dose.petId,
              scheduledAt: dose.scheduledAt,
            })),
          data.pets,
          data.treatments,
        ),
      )
    }

    const futureDoses = await dosesService.listFuturePending(user.id)
    return notificationService.syncPendingNotifications(
      buildDoseNotifications(
        futureDoses.map((dose) => ({
          id: dose.id,
          treatmentId: dose.treatment_id,
          petId: dose.pet_id,
          scheduledAt: dose.scheduled_at,
        })),
        data.pets,
        data.treatments,
      ),
    )
  }, [data, isDemoMode, user])

  const value = useMemo<AppDataContextValue>(
    () => ({
      ...data,
      isLoading,
      loadError,
      feedback,
      addPet,
      updatePet,
      deletePet,
      addWeight,
      addVaccine,
      updateVaccine,
      deleteVaccine,
      addTreatment,
      changeTreatmentStatus,
      deleteTreatment,
      updateDoseStatus,
      refreshData,
      syncNotifications,
      clearFeedback: () => setFeedback(null),
      getPet: (petId) => data.pets.find((pet) => pet.id === petId),
      getTreatment: (treatmentId) =>
        data.treatments.find((treatment) => treatment.id === treatmentId),
      getPetWeights: (petId) =>
        data.weightRecords
          .filter((record) => record.petId === petId)
          .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)),
      getPetVaccines: (petId) =>
        data.vaccines
          .filter((vaccine) => vaccine.petId === petId)
          .sort((a, b) => {
            if (!a.nextDueAt) return 1
            if (!b.nextDueAt) return -1
            return a.nextDueAt.localeCompare(b.nextDueAt)
          }),
    }),
    [
      addPet,
      addVaccine,
      addWeight,
      addTreatment,
      changeTreatmentStatus,
      data,
      deleteTreatment,
      deleteVaccine,
      deletePet,
      feedback,
      isLoading,
      loadError,
      refreshData,
      syncNotifications,
      updatePet,
      updateVaccine,
      updateDoseStatus,
    ],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}
