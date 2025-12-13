'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, Truck, Clock, Wallet, Shield, ChevronDown } from 'lucide-react'

export default function CourierLanding() {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('courier')
    if (saved) {
      router.push('/kuryr/dashboard')
    }
  }, [router])

  const benefits = [
    {
      title: 'Férové zárobky',
      description: 'Získaj 80% z každej doručenej objednávky. Žiadne skryté poplatky, žiadne prekvapenia. Čím viac doručíš, tým viac zarobíš.'
    },
    {
      title: 'Flexibilný čas',
      description: 'Pracuj kedy chceš a koľko chceš. Nie si viazaný žiadnymi zmenami ani minimálnym počtom hodín. Ty si určuješ svoj rozvrh.'
    },
    {
      title: 'Rýchle výplaty',
      description: 'Peniaze dostaneš na účet každý týždeň. Žiadne dlhé čakanie, žiadne komplikácie.'
    },
    {
      title: 'Jednoduchá aplikácia',
      description: 'Všetko máš prehľadne v mobile. Prijímanie objednávok, navigácia, komunikácia so zákazníkom aj prehľad zárobkov.'
    }
  ]

  const steps = [
    {
      number: '1',
      title: 'Zaregistruj sa',
      description: 'Vyplň krátky formulár a nahraj potrebné dokumenty. Overenie trvá zvyčajne do 24 hodín.'
    },
    {
      number: '2',
      title: 'Prijímaj objednávky',
      description: 'Keď budeš online, uvidíš dostupné objednávky vo svojom okolí. Vyber si tie, ktoré ti vyhovujú.'
    },
    {
      number: '3',
      title: 'Doruč a zarob',
      description: 'Vyzdvihni zásielku, doruč ju príjemcovi a peniaze sa ti pripíšu okamžite do appky.'
    }
  ]

  const faqs = [
    {
      question: 'Aké dokumenty potrebujem na registráciu?',
      answer: 'Potrebuješ platný občiansky preukaz alebo pas, vodičský preukaz (ak budeš doručovať autom alebo motorkou) a fotografiu tváre. Ak doručuješ bicyklom, vodičský preukaz nie je potrebný.'
    },
    {
      question: 'Ako dlho trvá schválenie registrácie?',
      answer: 'Väčšinu registrácií schvaľujeme do 24 hodín. V prípade potreby dodatočných informácií ťa budeme kontaktovať.'
    },
    {
      question: 'Môžem doručovať na bicykli?',
      answer: 'Áno, môžeš doručovať na bicykli, motorke alebo autom. Pri registrácii si vyberieš typ vozidla, ktorým budeš doručovať.'
    },
    {
      question: 'Kedy a ako dostávam výplatu?',
      answer: 'Výplaty posielame každý pondelok na bankový účet, ktorý zadáš pri registrácii. V aplikácii máš vždy aktuálny prehľad svojich zárobkov.'
    },
    {
      question: 'Musím pracovať určitý počet hodín?',
      answer: 'Nie, nemáš žiadne povinné hodiny ani zmeny. Môžeš byť online kedy chceš a prijímať toľko objednávok, koľko ti vyhovuje.'
    },
    {
      question: 'Čo ak mám problém počas doručovania?',
      answer: 'V aplikácii máš priamy kontakt na podporu, ktorá ti pomôže vyriešiť akýkoľvek problém. Sme tu pre teba.'
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-800"></div>
        <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Staň sa kuriérom a zarábaj po svojom
            </h1>
            <p className="text-xl text-green-100 mb-8 leading-relaxed">
              Pripoj sa k tímu VORU kuriérov. Flexibilná práca, férové podmienky a zárobky, ktoré závisia len od teba. Žiadny šéf, žiadne zmeny, žiadne limity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/kuryr/registracia" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-green-700 rounded-xl font-semibold text-lg hover:bg-green-50 transition-colors"
              >
                Registrovať sa <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="#ako-to-funguje" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white border-2 border-white/30 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
              >
                Zistiť viac
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 md:py-28 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Prečo sa stať VORU kuriérom
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Vytvorili sme podmienky, ktoré dávajú zmysel. Pre teba aj pre zákazníkov.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm"
              >
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-5">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="ako-to-funguje" className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ako to funguje
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Tri jednoduché kroky a môžeš začať zarábať.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">{step.number}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 md:py-28 bg-green-600">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <p className="text-5xl font-bold text-white mb-2">80%</p>
              <p className="text-green-100 text-lg">z každej objednávky ide tebe</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-white mb-2">24h</p>
              <p className="text-green-100 text-lg">schválenie registrácie</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-white mb-2">0 €</p>
              <p className="text-green-100 text-lg">žiadne poplatky za registráciu</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Časté otázky
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                >
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} 
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Pripravený začať?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
            Registrácia trvá len pár minút. Čím skôr sa zaregistruješ, tým skôr môžeš začať zarábať.
          </p>
          <Link 
            href="/kuryr/registracia" 
            className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors"
          >
            Registrovať sa teraz <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Už máš účet? <Link href="/kuryr" className="text-green-600 font-medium hover:underline">Prihlás sa</Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
