import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Audience } from './sections/Audience'
import { FamilyFeature } from './sections/FamilyFeature'
import { Faq } from './sections/Faq'
import { Hero } from './sections/Hero'
import { HowItWorks } from './sections/HowItWorks'
import { Problem } from './sections/Problem'
import { ProblemsSolved } from './sections/ProblemsSolved'
import { Solution } from './sections/Solution'
import { Waitlist } from './sections/Waitlist'

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-800">
      <Header />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <HowItWorks />
        <Audience />
        <FamilyFeature />
        <ProblemsSolved />
        <Waitlist />
        <Faq />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage
