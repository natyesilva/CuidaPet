import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PetForm } from '../../src/app/features/pets/PetForm'

function renderPetForm(
  onSubmit = vi.fn().mockResolvedValue(undefined),
) {
  render(
    <PetForm
      isSaving={false}
      submitLabel="Salvar pet"
      onSubmit={onSubmit}
    />,
  )

  return { onSubmit }
}

async function chooseFromCombobox(buttonLabel: string, optionName: string) {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: buttonLabel }))
  await user.click(screen.getByRole('option', { name: optionName }))
}

describe('PetForm', () => {
  it('filtra species e specific_species conforme escolhas anteriores', async () => {
    renderPetForm()
    const user = userEvent.setup()

    await chooseFromCombobox('Mostrar sugestões de grupos', 'Réptil')
    await user.click(
      screen.getByRole('button', { name: 'Mostrar sugestões de espécies' }),
    )

    const speciesListbox = screen.getByRole('listbox')
    expect(within(speciesListbox).getByRole('option', { name: 'Cobra' }))
      .toBeInTheDocument()
    expect(
      within(speciesListbox).queryByRole('option', { name: 'Cachorro' }),
    ).not.toBeInTheDocument()

    await user.click(within(speciesListbox).getByRole('option', { name: 'Cobra' }))
    await user.click(
      screen.getByRole('button', {
        name: 'Mostrar sugestões de espécies específicas',
      }),
    )

    const specificListbox = screen.getByRole('listbox')
    expect(
      within(specificListbox).getByRole('option', { name: 'Corn snake' }),
    ).toBeInTheDocument()
    expect(
      within(specificListbox).queryByRole('option', { name: 'Shih-tzu' }),
    ).not.toBeInTheDocument()
  })

  it('limpa campos filhos quando o grupo do animal muda', async () => {
    renderPetForm()
    const user = userEvent.setup()

    await chooseFromCombobox('Mostrar sugestões de grupos', 'Réptil')
    await chooseFromCombobox('Mostrar sugestões de espécies', 'Cobra')
    await chooseFromCombobox(
      'Mostrar sugestões de espécies específicas',
      'Corn snake',
    )
    await user.clear(screen.getByLabelText(/^Grupo do animal/))
    await user.type(screen.getByLabelText(/^Grupo do animal/), 'Ave')

    expect(screen.getByLabelText(/^Grupo do animal/)).toHaveValue('Ave')
    expect(
      screen.getByLabelText(/^Espécie popular ou tipo principal/),
    ).toHaveValue('')
    expect(screen.getByLabelText(/^Espécie específica/)).toHaveValue('')
  })

  it('bloqueia combinação incompatível quando não está no modo Outro', async () => {
    const { onSubmit } = renderPetForm()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Nome do animal'), 'Lilly')
    await chooseFromCombobox('Mostrar sugestões de grupos', 'Réptil')
    await user.type(
      screen.getByLabelText(/^Espécie popular ou tipo principal/),
      'Cachorro',
    )
    await user.click(screen.getByRole('button', { name: 'Salvar pet' }))

    expect(
      await screen.findByText(
        'Escolha uma espécie compatível com a categoria selecionada ou selecione Outro.',
      ),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('permite texto livre quando o usuário seleciona Outro', async () => {
    const { onSubmit } = renderPetForm()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Nome do animal'), 'Bowie')
    await chooseFromCombobox('Mostrar sugestões de grupos', 'Outro')
    await user.type(
      screen.getByLabelText(/^Espécie popular ou tipo principal/),
      'Axolote',
    )
    await user.type(screen.getByLabelText(/^Espécie específica/), 'Albino')
    await user.click(screen.getByRole('button', { name: 'Salvar pet' }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Bowie',
        animalGroup: 'Outro',
        species: 'Axolote',
        specificSpecies: 'Albino',
      }),
    )
  })
})
