import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useAuth } from '../features/auth/auth-context'
import { dosesService } from '../services/dosesService'
import { petsService, type CreatePetInput } from '../services/petsService'
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
>

const emptyData: AppData = {
  pets: [],
  treatments: [],
  doses: [],
  history: [],
  weightRecords: [],
  vaccines: [],
}

const demoStorageKey = 'cuidapet:demo-data'

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
        species: 'Cachorro',
        breed: 'Golden Retriever',
        weightKg: 24,
        birthDate: '2021-03-14',
        notes: 'Dados de demonstração.',
      },
      {
        id: 'demo-pet-mingau',
        name: 'Mingau',
        species: 'Gato',
        breed: 'SRD',
        weightKg: 5,
        birthDate: '2022-09-02',
        notes: null,
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

    return {
      pets,
      treatments,
      doses: [
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
      ],
      history: [
        {
          ...baseDose,
          id: 'demo-history-yesterday',
          scheduledAt: yesterday.toISOString(),
          status: 'applied',
          appliedAt: new Date(yesterday.getTime() + 5 * 60 * 1000).toISOString(),
        },
      ],
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
        if (!stored) {
          setData(createDemoData())
        } else {
          const parsed = JSON.parse(stored) as Partial<AppData>
          setData({
            pets: parsed.pets ?? [],
            treatments: parsed.treatments ?? [],
            doses: parsed.doses ?? [],
            history: parsed.history ?? [],
            weightRecords: parsed.weightRecords ?? [],
            vaccines: parsed.vaccines ?? [],
          })
        }
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
        historyRows,
        weightRows,
        vaccineRows,
      ] = await Promise.all([
        petsService.list(user.id),
        treatmentsService.list(user.id),
        dosesService.listToday(user.id),
        dosesService.listHistory(user.id),
        petWeightService.list(user.id),
        petVaccineService.list(user.id),
      ])

      const pets: Pet[] = petRows.map((pet) => ({
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        weightKg: pet.weight_kg,
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

      setData({
        pets,
        treatments,
        doses: doseRows.map(mapDose),
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
      })
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
              species: pet.species,
              breed: pet.breed,
              weightKg: pet.weightKg,
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

      const createdPet = await petsService.create(user.id, pet)
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
          history: data.history.filter(
            (dose) => dose.petId !== petId && !treatmentIds.has(dose.treatmentId),
          ),
          weightRecords: data.weightRecords.filter(
            (record) => record.petId !== petId,
          ),
          vaccines: data.vaccines.filter((vaccine) => vaccine.petId !== petId),
        }
        setData(nextData)
        persistDemoData(nextData)
        setFeedback({ type: 'success', message: 'Pet excluído do modo demo.' })
        return
      }

      await petsService.remove(user.id, petId)
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
        const frequencyMs = treatment.frequencyHours * 60 * 60 * 1000

        for (
          let scheduledAt = new Date(treatment.startAt).getTime();
          scheduledAt <= new Date(treatment.endAt).getTime();
          scheduledAt += frequencyMs
        ) {
          if (scheduledAt >= todayStart.getTime() && scheduledAt < todayEnd.getTime()) {
            newDoses.push({
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
            })
          }
        }

        const nextData: AppData = {
          ...data,
          treatments: [newTreatment, ...data.treatments],
          doses: [...data.doses, ...newDoses].sort((a, b) =>
            a.scheduledAt.localeCompare(b.scheduledAt),
          ),
        }
        setData(nextData)
        persistDemoData(nextData)
        setFeedback({
          type: 'success',
          message: 'Tratamento criado no modo demo.',
        })
        return
      }

      await treatmentsService.create(user.id, treatment)
      await refreshData()
      setFeedback({
        type: 'success',
        message: 'Tratamento e agenda de doses criados com sucesso.',
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
          history: [
            updatedDose,
            ...data.history.filter((dose) => dose.id !== doseId),
          ],
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
        return
      }

      await dosesService.updateStatus(user.id, doseId, status)
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

  const value = useMemo<AppDataContextValue>(
    () => ({
      ...data,
      isLoading,
      loadError,
      feedback,
      addPet,
      deletePet,
      addWeight,
      addVaccine,
      updateVaccine,
      deleteVaccine,
      addTreatment,
      updateDoseStatus,
      refreshData,
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
      data,
      deleteVaccine,
      deletePet,
      feedback,
      isLoading,
      loadError,
      refreshData,
      updateVaccine,
      updateDoseStatus,
    ],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}
