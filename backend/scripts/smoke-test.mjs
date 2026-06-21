const baseUrl = process.env.API_URL ?? 'http://127.0.0.1:5080'

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const body = response.status === 204 ? null : await response.json()
  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${path} retornou ${response.status}: ${JSON.stringify(body)}`)
  }
  return body
}

const health = await request('/health')
const email = `smoke.${Date.now()}@cuidapet.test`
const auth = await request('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({ name: 'Natalia', email, password: '123456' }),
})
const headers = { Authorization: `Bearer ${auth.data.token}` }
const pet = await request('/api/pets', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    name: 'Mel',
    species: 'Cachorro',
    breed: 'SRD',
    weightKg: 8.4,
    birthDate: '2020-05-10',
    photoUrl: null,
    notes: 'Teste automatizado',
  }),
})
const medications = await request('/api/medications', { headers })
const startDate = new Date(Date.now() + 5 * 60 * 1000)
const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
const treatment = await request('/api/treatments', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    petId: pet.data.id,
    medicationId: '10000000-0000-0000-0000-000000000001',
    medicationName: 'Prednisolona',
    dose: 3.6,
    doseUnit: 'ml',
    frequencyHours: 12,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    instructions: 'Conforme prescrição veterinária',
    prescribedBy: 'Dra. Veterinária',
  }),
})
const doseId = treatment.data.doses[0].id
const applied = await request(`/api/doses/${doseId}/apply`, {
  method: 'PUT',
  headers,
  body: JSON.stringify({ notes: 'Aplicada durante smoke test' }),
})

const duplicateResponse = await fetch(`${baseUrl}/api/doses/${doseId}/apply`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify({ notes: 'Tentativa duplicada' }),
})

if (duplicateResponse.status !== 422) {
  throw new Error(`Aplicação duplicada deveria retornar 422, mas retornou ${duplicateResponse.status}.`)
}

console.log(JSON.stringify({
  health: health.status,
  registeredUser: auth.data.email,
  pet: pet.data.name,
  seedMedications: medications.data.length,
  generatedDoses: treatment.data.doses.length,
  appliedDoseStatus: applied.data.status,
  duplicateApplyHttpStatus: duplicateResponse.status,
}, null, 2))
