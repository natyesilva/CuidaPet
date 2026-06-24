import { createContext, useContext } from 'react'
import type { NotificationScheduleResult } from '../features/notifications/notificationService'
import type { CreatePetInput, UpdatePetInput } from '../services/petsService'
import type { CreateWeightInput } from '../services/petWeightService'
import type { VaccineInput } from '../services/petVaccineService'
import type { CreateTreatmentInput } from '../services/treatmentsService'

export type Pet = {
  id: string
  name: string
  animalGroup: string | null
  species: string
  specificSpecies: string | null
  subspeciesOrMorph: string | null
  breed: string | null
  sex: string | null
  photoUrl: string | null
  approximateAge: number | null
  approximateAgeUnit: 'months' | 'years' | null
  weightKg: number | null
  weightUnit: string | null
  birthDate: string | null
  notes: string | null
}

export type Treatment = {
  id: string
  petId: string
  medicationName: string
  dose: string
  doseUnit: string
  frequencyHours: number
  startAt: string
  endAt: string
  instructions: string | null
  veterinarianName: string | null
  status: string
}

export type WeightRecord = {
  id: string
  petId: string
  weightKg: number
  recordedAt: string
  notes: string | null
}

export type Vaccine = {
  id: string
  petId: string
  name: string
  appliedAt: string | null
  nextDueAt: string | null
  veterinarianName: string | null
  clinicName: string | null
  notes: string | null
}

export type DoseStatus = 'pending' | 'applied' | 'skipped' | 'missed'

export type Dose = {
  id: string
  treatmentId: string
  petId: string
  scheduledAt: string
  status: DoseStatus
  appliedAt: string | null
  notes: string | null
  medicationName: string
  dose: string
  doseUnit: string
}

export type AppFeedback = {
  type: 'success' | 'error'
  message: string
}

export type AppDataContextValue = {
  pets: Pet[]
  treatments: Treatment[]
  doses: Dose[]
  agendaDoses: Dose[]
  history: Dose[]
  weightRecords: WeightRecord[]
  vaccines: Vaccine[]
  isLoading: boolean
  loadError: string
  feedback: AppFeedback | null
  addPet: (pet: CreatePetInput) => Promise<void>
  updatePet: (petId: string, pet: UpdatePetInput) => Promise<void>
  deletePet: (petId: string) => Promise<void>
  addWeight: (petId: string, input: CreateWeightInput) => Promise<void>
  addVaccine: (petId: string, input: VaccineInput) => Promise<void>
  updateVaccine: (vaccineId: string, input: VaccineInput) => Promise<void>
  deleteVaccine: (vaccineId: string) => Promise<void>
  addTreatment: (treatment: CreateTreatmentInput) => Promise<void>
  changeTreatmentStatus: (
    treatmentId: string,
    status: 'completed' | 'cancelled',
  ) => Promise<void>
  deleteTreatment: (treatmentId: string) => Promise<void>
  updateDoseStatus: (
    doseId: string,
    status: 'applied' | 'skipped',
  ) => Promise<void>
  refreshData: () => Promise<void>
  syncNotifications: () => Promise<NotificationScheduleResult>
  clearFeedback: () => void
  getPet: (petId: string) => Pet | undefined
  getTreatment: (treatmentId: string) => Treatment | undefined
  getPetWeights: (petId: string) => WeightRecord[]
  getPetVaccines: (petId: string) => Vaccine[]
}

export const AppDataContext = createContext<AppDataContextValue | null>(null)

export function useAppData() {
  const context = useContext(AppDataContext)

  if (!context) {
    throw new Error('useAppData precisa ser usado dentro de AppDataProvider.')
  }

  return context
}
