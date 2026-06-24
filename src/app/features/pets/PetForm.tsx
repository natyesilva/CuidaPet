import { Check, LoaderCircle, PawPrint } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import {
  animalGroupOptions,
  findKnownOption,
  getAnimalGroupOptions,
  getMorphGroupsForSpecies,
  getSpeciesGroupsForAnimalGroup,
  getSpecificSpeciesGroupsForSpecies,
  inferAnimalGroupForSpecies,
  isOtherOption,
  sexOptions,
} from '../../services/speciesOptions'
import type { CreatePetInput } from '../../services/petsService'
import type { Pet } from '../../shared/app-data-context'
import { FeedbackBanner, Field } from '../../shared/ui'
import {
  formatWeightKg,
  parseWeightInput,
  weightFromKg,
  weightToKg,
} from '../../shared/weight'
import { SpeciesCombobox } from './SpeciesCombobox'

type PetFormProps = {
  initialPet?: Pet
  isSaving: boolean
  submitLabel: string
  savingLabel?: string
  onSubmit: (pet: CreatePetInput) => Promise<void>
  onCancel?: () => void
}

export function PetForm({
  initialPet,
  isSaving,
  submitLabel,
  savingLabel = 'Salvando...',
  onSubmit,
  onCancel,
}: PetFormProps) {
  const resolvedInitialAnimalGroup =
    initialPet?.animalGroup ?? inferAnimalGroupForSpecies(initialPet?.species ?? '') ?? ''
  const initialSpeciesGroups = getSpeciesGroupsForAnimalGroup(
    resolvedInitialAnimalGroup,
  )
  const initialSpeciesOptions = initialSpeciesGroups.flatMap(
    (group) => group.options,
  )
  const initialSpecificSpeciesGroups = getSpecificSpeciesGroupsForSpecies(
    initialPet?.species ?? '',
  )
  const initialSpecificSpeciesOptions = initialSpecificSpeciesGroups.flatMap(
    (group) => group.options,
  )
  const initialMorphGroups = getMorphGroupsForSpecies(
    initialPet?.species ?? '',
    resolvedInitialAnimalGroup,
  )
  const initialMorphOptions = initialMorphGroups.flatMap((group) => group.options)

  const [name, setName] = useState(initialPet?.name ?? '')
  const [animalGroup, setAnimalGroup] = useState(resolvedInitialAnimalGroup)
  const [isCustomAnimalGroupMode, setIsCustomAnimalGroupMode] = useState(
    () =>
      Boolean(
        initialPet?.animalGroup &&
          !findKnownOption(initialPet.animalGroup, getAnimalGroupOptions()),
      ),
  )
  const [isCustomSpeciesMode, setIsCustomSpeciesMode] = useState(
    () =>
      Boolean(
        initialPet?.species &&
          !findKnownOption(initialPet.species, initialSpeciesOptions),
      ) || isOtherOption(initialPet?.species),
  )
  const [isCustomSpecificSpeciesMode, setIsCustomSpecificSpeciesMode] = useState(
    () =>
      Boolean(
        initialPet?.specificSpecies &&
          !findKnownOption(initialPet.specificSpecies, initialSpecificSpeciesOptions),
      ) || isOtherOption(initialPet?.specificSpecies),
  )
  const [isCustomMorphMode, setIsCustomMorphMode] = useState(
    () =>
      Boolean(
        initialPet?.subspeciesOrMorph &&
          !findKnownOption(initialPet.subspeciesOrMorph, initialMorphOptions),
      ) || isOtherOption(initialPet?.subspeciesOrMorph),
  )
  const [species, setSpecies] = useState(initialPet?.species ?? '')
  const [specificSpecies, setSpecificSpecies] = useState(
    initialPet?.specificSpecies ?? '',
  )
  const [subspeciesOrMorph, setSubspeciesOrMorph] = useState(
    initialPet?.subspeciesOrMorph ?? '',
  )
  const [breed, setBreed] = useState(initialPet?.breed ?? '')
  const [sex, setSex] = useState(initialPet?.sex ?? '')
  const [birthDate, setBirthDate] = useState(initialPet?.birthDate ?? '')
  const [weightUnit, setWeightUnit] = useState(
    initialPet?.weightUnit === 'g' ? 'g' : 'kg',
  )
  const [weight, setWeight] = useState(() => {
    if (!initialPet?.weightKg) return ''
    return formatWeightKg(weightFromKg(initialPet.weightKg, initialPet.weightUnit))
  })
  const [notes, setNotes] = useState(initialPet?.notes ?? '')
  const [errorMessage, setErrorMessage] = useState('')
  const animalGroupValues = getAnimalGroupOptions()
  const knownAnimalGroup = findKnownOption(animalGroup, animalGroupValues)
  const speciesGroups = getSpeciesGroupsForAnimalGroup(animalGroup)
  const speciesOptions = speciesGroups.flatMap((group) => group.options)
  const knownSpecies = findKnownOption(species, speciesOptions)
  const isCustomAnimalGroup = isOtherOption(knownAnimalGroup ?? animalGroup)
  const isCustomSpecies = isOtherOption(knownSpecies ?? species)
  const specificSpeciesGroups = getSpecificSpeciesGroupsForSpecies(species)
  const specificSpeciesOptions = specificSpeciesGroups.flatMap(
    (group) => group.options,
  )
  const knownSpecificSpecies = findKnownOption(
    specificSpecies,
    specificSpeciesOptions,
  )
  const isCustomSpecificSpecies = isOtherOption(
    knownSpecificSpecies ?? specificSpecies,
  )
  const morphGroups = getMorphGroupsForSpecies(species, animalGroup)
  const morphOptions = morphGroups.flatMap((group) => group.options)
  const knownMorph = findKnownOption(subspeciesOrMorph, morphOptions)
  const isCustomMorph = isOtherOption(knownMorph ?? subspeciesOrMorph)
  const canTypeCustomSpecies =
    isCustomAnimalGroup ||
    isCustomSpecies ||
    isCustomAnimalGroupMode ||
    isCustomSpeciesMode
  const canTypeCustomSpecificSpecies =
    isCustomAnimalGroup ||
    isCustomSpecies ||
    isCustomSpecificSpecies ||
    isCustomAnimalGroupMode ||
    isCustomSpeciesMode ||
    isCustomSpecificSpeciesMode
  const canTypeCustomMorph =
    isCustomAnimalGroup ||
    isCustomSpecies ||
    isCustomSpecificSpecies ||
    isCustomMorph ||
    isCustomAnimalGroupMode ||
    isCustomSpeciesMode ||
    isCustomSpecificSpeciesMode ||
    isCustomMorphMode
  const isSpeciesDisabled = !knownAnimalGroup && !isCustomAnimalGroupMode
  const isSpecificSpeciesDisabled =
    !species.trim() ||
    (!canTypeCustomSpecificSpecies && specificSpeciesGroups.length === 0)
  const isMorphDisabled =
    !species.trim() || (!canTypeCustomMorph && morphGroups.length === 0)

  function handleAnimalGroupChange(nextValue: string) {
    const knownNextGroup = findKnownOption(nextValue, animalGroupValues)
    if (knownNextGroup && !isOtherOption(knownNextGroup)) {
      setIsCustomAnimalGroupMode(false)
    }
    if (isOtherOption(nextValue)) {
      setIsCustomAnimalGroupMode(true)
    }
    setAnimalGroup(nextValue)
    setSpecies('')
    setSpecificSpecies('')
    setSubspeciesOrMorph('')
    setIsCustomSpeciesMode(false)
    setIsCustomSpecificSpeciesMode(false)
    setIsCustomMorphMode(false)
  }

  function handleSpeciesChange(nextValue: string) {
    const knownNextSpecies = findKnownOption(nextValue, speciesOptions)
    if (knownNextSpecies && !isOtherOption(knownNextSpecies)) {
      setIsCustomSpeciesMode(false)
    }
    if (isOtherOption(nextValue)) {
      setIsCustomSpeciesMode(true)
    }
    setSpecies(nextValue)
    setSpecificSpecies('')
    setSubspeciesOrMorph('')
    setIsCustomSpecificSpeciesMode(false)
    setIsCustomMorphMode(false)
  }

  function handleSpecificSpeciesChange(nextValue: string) {
    const knownNextSpecificSpecies = findKnownOption(
      nextValue,
      specificSpeciesOptions,
    )
    if (knownNextSpecificSpecies && !isOtherOption(knownNextSpecificSpecies)) {
      setIsCustomSpecificSpeciesMode(false)
    }
    if (isOtherOption(nextValue)) {
      setIsCustomSpecificSpeciesMode(true)
    }
    setSpecificSpecies(nextValue)
  }

  function handleMorphChange(nextValue: string) {
    const knownNextMorph = findKnownOption(nextValue, morphOptions)
    if (knownNextMorph && !isOtherOption(knownNextMorph)) {
      setIsCustomMorphMode(false)
    }
    if (isOtherOption(nextValue)) {
      setIsCustomMorphMode(true)
    }
    setSubspeciesOrMorph(nextValue)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (!name.trim() || !animalGroup.trim() || !species.trim()) {
      setErrorMessage('Informe o nome, o grupo do animal e a espécie popular.')
      return
    }
    if (!knownAnimalGroup && !isCustomAnimalGroupMode) {
      setErrorMessage(
        'Escolha uma categoria da lista para ver espécies compatíveis ou selecione Outro.',
      )
      return
    }
    if (!canTypeCustomSpecies && !knownSpecies) {
      setErrorMessage('Escolha uma espécie compatível com a categoria selecionada ou selecione Outro.')
      return
    }
    if (
      specificSpecies.trim() &&
      !canTypeCustomSpecificSpecies &&
      specificSpeciesOptions.length > 0 &&
      !knownSpecificSpecies
    ) {
      setErrorMessage('A espécie específica não combina com a espécie popular selecionada. Escolha uma opção compatível ou selecione Outro.')
      return
    }
    if (
      subspeciesOrMorph.trim() &&
      !canTypeCustomMorph &&
      morphOptions.length > 0 &&
      !knownMorph
    ) {
      setErrorMessage('O morfo ou variação não combina com a espécie selecionada. Escolha uma opção compatível ou selecione Outro.')
      return
    }

    const parsedWeight = parseWeightInput(weight)
    const weightKg = weight ? weightToKg(parsedWeight, weightUnit) : null
    if (weight && (!Number.isFinite(parsedWeight) || parsedWeight <= 0)) {
      setErrorMessage('O peso precisa ser maior que zero.')
      return
    }

    await onSubmit({
      name: name.trim(),
      animalGroup: animalGroup.trim() || null,
      species: species.trim(),
      specificSpecies: specificSpecies.trim() || null,
      subspeciesOrMorph: subspeciesOrMorph.trim() || null,
      breed: breed.trim() || null,
      sex: sex.trim() || null,
      weightKg,
      weightUnit,
      birthDate: birthDate || null,
      notes: notes.trim() || null,
    })
  }

  return (
    <form className="app-card space-y-5 p-5" onSubmit={handleSubmit}>
      <div className="flex items-center gap-3 rounded-2xl bg-brand-50 p-4">
        <span className="grid size-11 place-items-center rounded-2xl bg-white text-brand-700 shadow-sm">
          <PawPrint className="size-5" />
        </span>
        <p className="text-sm leading-6 text-brand-900">
          Use as sugestões como atalho ou digite livremente para cadastrar
          animais exóticos, morfos e variações.
        </p>
      </div>

      {errorMessage && <FeedbackBanner type="error" message={errorMessage} />}

      <Field label="Nome do animal">
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="app-input"
          placeholder="Ex.: Sol"
        />
      </Field>

      <Field label="Grupo do animal">
        <SpeciesCombobox
          value={animalGroup}
          onChange={handleAnimalGroupChange}
          groups={animalGroupOptions}
          placeholder="Ex.: Réptil, Ave, Cachorro/Gato"
          hint="Escolha uma categoria para liberar somente espécies compatíveis."
          emptyLabel="Escolha uma categoria da lista ou use Outro."
          buttonLabel="Mostrar sugestões de grupos"
          allowFreeText={isCustomAnimalGroupMode}
        />
      </Field>

      <Field label="Espécie popular ou tipo principal">
        <SpeciesCombobox
          value={species}
          onChange={handleSpeciesChange}
          groups={speciesGroups}
          disabled={isSpeciesDisabled}
          placeholder={
            isSpeciesDisabled
              ? 'Escolha primeiro a categoria'
              : 'Ex.: Cobra, Lagarto, Calopsita'
          }
          hint={
            isSpeciesDisabled
              ? 'Escolha primeiro a categoria do animal para ver espécies compatíveis.'
              : canTypeCustomSpecies
                ? 'Categoria Outro selecionada: você pode digitar a espécie livremente.'
                : 'Mostrando apenas espécies compatíveis com a categoria selecionada.'
          }
          emptyLabel="Escolha uma espécie compatível ou selecione Outro."
          buttonLabel="Mostrar sugestões de espécies"
          allowFreeText={canTypeCustomSpecies}
        />
      </Field>

      <Field label="Espécie específica" hint="opcional">
        <SpeciesCombobox
          value={specificSpecies}
          onChange={handleSpecificSpeciesChange}
          groups={specificSpeciesGroups}
          disabled={isSpecificSpeciesDisabled}
          required={false}
          placeholder={
            isSpecificSpeciesDisabled
              ? 'Escolha primeiro uma espécie compatível'
              : 'Ex.: Corn snake, Gecko leopardo'
          }
          hint={
            !species.trim()
              ? 'Escolha primeiro a espécie popular para ver opções compatíveis.'
              : canTypeCustomSpecificSpecies
                ? 'Espécie Outro selecionada: você pode digitar a espécie específica livremente.'
                : 'Mostrando apenas opções compatíveis com a espécie popular.'
          }
          emptyLabel="Escolha uma opção compatível ou selecione Outro."
          buttonLabel="Mostrar sugestões de espécies específicas"
          allowFreeText={canTypeCustomSpecificSpecies}
        />
      </Field>

      <Field label="Subespécie, morfo, linhagem ou variação" hint="opcional">
        <SpeciesCombobox
          value={subspeciesOrMorph}
          onChange={handleMorphChange}
          groups={morphGroups}
          disabled={isMorphDisabled}
          required={false}
          placeholder={
            isMorphDisabled
              ? 'Escolha primeiro uma espécie'
              : 'Ex.: Albina, Lutino, Dumbo'
          }
          hint={
            canTypeCustomMorph
              ? 'Outro selecionado: você pode digitar morfo, linhagem ou variação livremente.'
              : 'Mostrando morfos e variações compatíveis com a espécie selecionada.'
          }
          emptyLabel="Escolha uma opção compatível ou selecione Outro."
          buttonLabel="Mostrar sugestões de morfos"
          allowFreeText={canTypeCustomMorph}
        />
      </Field>

      <Field label="Raça ou tipo" hint="opcional">
        <input
          value={breed}
          onChange={(event) => setBreed(event.target.value)}
          className="app-input"
          placeholder="Ex.: Golden Retriever, SRD, Mini lop"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Sexo" hint="opcional">
          <SpeciesCombobox
            value={sex}
            onChange={setSex}
            groups={sexOptions}
            required={false}
            placeholder="Ex.: Fêmea"
            hint="Texto livre."
            buttonLabel="Mostrar sugestões de sexo"
          />
        </Field>
        <Field label="Nascimento" hint="opcional">
          <input
            type="date"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
            className="app-input"
          />
        </Field>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3">
        <Field label="Peso atual" hint="opcional">
          <input
            type="text"
            inputMode="decimal"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            className="app-input"
            placeholder={weightUnit === 'g' ? 'Ex.: 420' : 'Ex.: 12,4'}
          />
        </Field>
        <Field label="Unid.">
          <select
            value={weightUnit}
            onChange={(event) => setWeightUnit(event.target.value)}
            className="app-input w-24 px-3"
            aria-label="Unidade do peso"
          >
            <option value="kg">kg</option>
            <option value="g">g</option>
          </select>
        </Field>
      </div>

      <Field label="Observações" hint="opcional">
        <textarea
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="app-input resize-none"
          placeholder="Alergias, manejo, alimentação ou informações importantes"
        />
      </Field>

      <div className={onCancel ? 'grid grid-cols-2 gap-3' : undefined}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="focus-ring rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-4 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? <LoaderCircle className="size-5 animate-spin" /> : <Check className="size-5" />}
          {isSaving ? savingLabel : submitLabel}
        </button>
      </div>
    </form>
  )
}
