export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-8">Ochrana osobných údajov (GDPR)</h1>
        
        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Prevádzkovateľ</h2>
            <p className="text-gray-700">
              Prevádzkovateľom osobných údajov je spoločnosť prevádzkujúca platformu VORU. Kontaktovať nás môžete na: gdpr@voru.sk
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Aké údaje zbierame</h2>
            <p className="text-gray-700 mb-2">Pri registrácii a používaní služby zbierame:</p>
            
            <h3 className="font-semibold mt-4 mb-2">Pre zákazníkov:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Meno a priezvisko / Názov firmy</li>
              <li>Telefónne číslo</li>
              <li>Adresa (ulica, mesto, PSČ)</li>
              <li>IČO, DIČ, IČ DPH (pre firmy)</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">Pre kuriérov:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Meno a priezvisko</li>
              <li>Dátum narodenia</li>
              <li>Telefónne číslo</li>
              <li>Adresa bydliska</li>
              <li>Číslo občianskeho preukazu</li>
              <li>Vodičský preukaz (číslo, skupina)</li>
              <li>IBAN bankového účtu</li>
              <li>Fotografia dokladu totožnosti</li>
              <li>Selfie pre overenie identity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Účel spracovania</h2>
            <p className="text-gray-700 mb-2">Vaše údaje spracovávame za účelom:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Poskytovania kuriérskych služieb</li>
              <li>Overenia identity kuriérov</li>
              <li>Spracovania platieb a vyúčtovania</li>
              <li>Komunikácie ohľadom objednávok</li>
              <li>Plnenia zákonných povinností</li>
              <li>Zlepšovania služieb</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Právny základ</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Plnenie zmluvy</strong> – spracovanie potrebné pre poskytnutie služby</li>
              <li><strong>Zákonná povinnosť</strong> – daňové a účtovné predpisy</li>
              <li><strong>Oprávnený záujem</strong> – prevencia podvodov, bezpečnosť</li>
              <li><strong>Súhlas</strong> – marketingová komunikácia</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Doba uchovávania</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Údaje o účte: po dobu existencie účtu + 3 roky</li>
              <li>Účtovné doklady: 10 rokov</li>
              <li>Dokumenty kuriérov: po dobu spolupráce + 5 rokov</li>
              <li>Údaje o objednávkach: 5 rokov</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Príjemcovia údajov</h2>
            <p className="text-gray-700 mb-2">Vaše údaje môžu byť zdieľané s:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Kuriérmi (pre doručenie zásielky)</li>
              <li>Zákazníkmi (základné info o kuriérovi)</li>
              <li>Platobnými poskytovateľmi</li>
              <li>Štátnymi orgánmi (na základe zákona)</li>
              <li>IT poskytovateľmi (hosting, databázy)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Vaše práva</h2>
            <p className="text-gray-700 mb-2">Máte právo:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Prístup</strong> – získať kópiu svojich údajov</li>
              <li><strong>Oprava</strong> – opraviť nesprávne údaje</li>
              <li><strong>Vymazanie</strong> – požiadať o vymazanie údajov</li>
              <li><strong>Obmedzenie</strong> – obmedziť spracovanie</li>
              <li><strong>Prenosnosť</strong> – získať údaje v strojovo čitateľnom formáte</li>
              <li><strong>Námietka</strong> – namietať proti spracovaniu</li>
              <li><strong>Sťažnosť</strong> – podať sťažnosť na Úrad na ochranu osobných údajov SR</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Bezpečnosť údajov</h2>
            <p className="text-gray-700">
              Vaše údaje chránime pomocou šifrovania, zabezpečených serverov, pravidelných bezpečnostných auditov a prísnych prístupových kontrol. Dokumenty sú uložené v zabezpečenom cloudovom úložisku.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Cookies</h2>
            <p className="text-gray-700">
              Používame nevyhnutné cookies pre fungovanie platformy. Analytické cookies používame len s vaším súhlasom pre zlepšenie služieb.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. Kontakt</h2>
            <p className="text-gray-700">
              Pre otázky ohľadom ochrany osobných údajov nás kontaktujte na: gdpr@voru.sk
            </p>
          </section>

          <div className="pt-6 border-t border-gray-200 text-sm text-gray-500">
            <p>Posledná aktualizácia: December 2024</p>
            <p>Zodpovedná osoba: gdpr@voru.sk</p>
          </div>
        </div>
      </div>
    </div>
  )
}
