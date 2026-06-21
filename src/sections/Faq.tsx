import { ChevronDown } from 'lucide-react'
import { SectionHeading } from '../components/SectionHeading'

const questions = [
  {
    question: 'O CuidaPet substitui o veterinário?',
    answer: 'Não. O CuidaPet é uma ferramenta de organização. Diagnósticos, doses, medicamentos e tratamentos devem sempre ser definidos por um médico-veterinário.',
  },
  {
    question: 'Posso cadastrar mais de um pet?',
    answer: 'Sim. A proposta do CuidaPet é permitir que você organize todos os seus pets, cada um com seus próprios tratamentos, horários e histórico.',
  },
  {
    question: 'Vou conseguir compartilhar com minha família?',
    answer: 'Sim. O compartilhamento familiar é uma das funcionalidades centrais: todos poderão acompanhar e registrar as doses administradas.',
  },
  {
    question: 'Quando o aplicativo será lançado?',
    answer: 'O CuidaPet ainda está em fase de validação. Quem entrar na lista de espera receberá primeiro as novidades, convites para testes e a previsão de lançamento.',
  },
]

export function Faq() {
  return (
    <section id="faq" className="section-space bg-slate-50">
      <div className="container-page">
        <SectionHeading
          eyebrow="Perguntas frequentes"
          title="Ainda ficou alguma dúvida?"
          description="Reunimos as principais respostas sobre a proposta do CuidaPet."
        />
        <div className="mx-auto mt-12 max-w-3xl space-y-4">
          {questions.map(({ question, answer }, index) => (
            <details
              key={question}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm open:border-brand-200 open:shadow-md"
              open={index === 0}
            >
              <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg font-bold text-slate-900">
                {question}
                <ChevronDown className="size-5 shrink-0 text-brand-600 transition group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="mt-4 border-t border-slate-100 pt-4 leading-7 text-slate-600">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
