export default function VOPPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-8">Všeobecné obchodné podmienky</h1>
        
        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Úvodné ustanovenia</h2>
            <p className="text-gray-700">
              Tieto Všeobecné obchodné podmienky (ďalej len „VOP") upravujú práva a povinnosti medzi prevádzkovateľom služby VORU a používateľmi platformy (zákazníkmi a kuriérmi).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Definície</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Prevádzkovateľ</strong> – spoločnosť prevádzkujúca platformu VORU</li>
              <li><strong>Zákazník</strong> – fyzická alebo právnická osoba objednávajúca kuriérske služby</li>
              <li><strong>Kuriér</strong> – fyzická osoba poskytujúca doručovacie služby</li>
              <li><strong>Platforma</strong> – webová a mobilná aplikácia VORU</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Registrácia a účet</h2>
            <p className="text-gray-700 mb-2">Pre využívanie služieb je potrebná registrácia. Používateľ je povinný:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Poskytnúť pravdivé a aktuálne údaje</li>
              <li>Chrániť svoje prihlasovacie údaje (telefón, PIN)</li>
              <li>Okamžite nahlásiť akékoľvek neoprávnené použitie účtu</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Služby platformy</h2>
            <p className="text-gray-700">
              VORU sprostredkováva kuriérske služby medzi zákazníkmi a kuriérmi. Platforma umožňuje objednávanie, sledovanie a platbu za doručenie zásielok.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Ceny a platby</h2>
            <p className="text-gray-700 mb-2">Ceny za služby sú zobrazené pred potvrdením objednávky. Platba je možná:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Platobnou kartou</li>
              <li>V hotovosti kuriérovi</li>
              <li>Firemnou fakturáciou (pre firemných zákazníkov)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Povinnosti kuriéra</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Doručiť zásielku v dohodnutom čase</li>
              <li>Zaobchádzať so zásielkami opatrne</li>
              <li>Dodržiavať dopravné predpisy</li>
              <li>Mať platné poistenie a potrebné oprávnenia</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Povinnosti zákazníka</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Poskytnúť správnu adresu vyzdvihnutia a doručenia</li>
              <li>Zabezpečiť prístupnosť na uvedených adresách</li>
              <li>Uhradiť cenu za služby</li>
              <li>Neposielať zakázané predmety</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Zakázané predmety</h2>
            <p className="text-gray-700">
              Je zakázané posielať: zbrane, drogy, výbušniny, nebezpečné chemikálie, nelegálny tovar, živé zvieratá bez povolenia, a iné predmety v rozpore so zákonom.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Zodpovednosť</h2>
            <p className="text-gray-700">
              Prevádzkovateľ nezodpovedá za škody spôsobené vyššou mocou, nesprávnymi údajmi od používateľa, alebo konaním tretích strán. Maximálna výška náhrady škody je limitovaná hodnotou zásielky.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. Zrušenie objednávky</h2>
            <p className="text-gray-700">
              Zákazník môže zrušiť objednávku bezplatne do momentu, kým kuriér nevyzdvihne zásielku. Po vyzdvihnutí môže byť účtovaný storno poplatok.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">11. Reklamácie</h2>
            <p className="text-gray-700">
              Reklamácie je potrebné podať do 48 hodín od doručenia. Kontaktujte nás na support@voru.sk s popisom problému a fotodokumentáciou.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">12. Záverečné ustanovenia</h2>
            <p className="text-gray-700">
              Tieto VOP nadobúdajú platnosť dňom zverejnenia. Prevádzkovateľ si vyhradzuje právo na zmenu VOP. O zmenách budú používatelia informovaní prostredníctvom platformy.
            </p>
          </section>

          <div className="pt-6 border-t border-gray-200 text-sm text-gray-500">
            <p>Posledná aktualizácia: December 2024</p>
            <p>Kontakt: support@voru.sk</p>
          </div>
        </div>
      </div>
    </div>
  )
}
