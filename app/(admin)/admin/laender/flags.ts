// Liste de pays sélectionnables pour le drapeau (ISO 3166-1 alpha-2).
// Sert de picker dans le formulaire pays : choisir un pays renseigne le drapeau
// (et pré-remplit code / noms / slug si vides).

export interface CountryOption {
  code: string
  flag: string
  nameDE: string
  nameEN: string
}

export const COUNTRY_OPTIONS: CountryOption[] = [
  // DACH (prioritaires)
  { code: "DE", flag: "🇩🇪", nameDE: "Deutschland", nameEN: "Germany" },
  { code: "AT", flag: "🇦🇹", nameDE: "Österreich", nameEN: "Austria" },
  { code: "CH", flag: "🇨🇭", nameDE: "Schweiz", nameEN: "Switzerland" },
  { code: "LU", flag: "🇱🇺", nameDE: "Luxemburg", nameEN: "Luxembourg" },
  { code: "LI", flag: "🇱🇮", nameDE: "Liechtenstein", nameEN: "Liechtenstein" },
  // Europe de l'Ouest
  { code: "FR", flag: "🇫🇷", nameDE: "Frankreich", nameEN: "France" },
  { code: "BE", flag: "🇧🇪", nameDE: "Belgien", nameEN: "Belgium" },
  { code: "NL", flag: "🇳🇱", nameDE: "Niederlande", nameEN: "Netherlands" },
  { code: "GB", flag: "🇬🇧", nameDE: "Vereinigtes Königreich", nameEN: "United Kingdom" },
  { code: "IE", flag: "🇮🇪", nameDE: "Irland", nameEN: "Ireland" },
  // Europe du Sud
  { code: "IT", flag: "🇮🇹", nameDE: "Italien", nameEN: "Italy" },
  { code: "ES", flag: "🇪🇸", nameDE: "Spanien", nameEN: "Spain" },
  { code: "PT", flag: "🇵🇹", nameDE: "Portugal", nameEN: "Portugal" },
  { code: "GR", flag: "🇬🇷", nameDE: "Griechenland", nameEN: "Greece" },
  { code: "MT", flag: "🇲🇹", nameDE: "Malta", nameEN: "Malta" },
  { code: "MC", flag: "🇲🇨", nameDE: "Monaco", nameEN: "Monaco" },
  // Europe du Nord
  { code: "DK", flag: "🇩🇰", nameDE: "Dänemark", nameEN: "Denmark" },
  { code: "SE", flag: "🇸🇪", nameDE: "Schweden", nameEN: "Sweden" },
  { code: "NO", flag: "🇳🇴", nameDE: "Norwegen", nameEN: "Norway" },
  { code: "FI", flag: "🇫🇮", nameDE: "Finnland", nameEN: "Finland" },
  { code: "IS", flag: "🇮🇸", nameDE: "Island", nameEN: "Iceland" },
  // Europe centrale / de l'Est
  { code: "PL", flag: "🇵🇱", nameDE: "Polen", nameEN: "Poland" },
  { code: "CZ", flag: "🇨🇿", nameDE: "Tschechien", nameEN: "Czechia" },
  { code: "SK", flag: "🇸🇰", nameDE: "Slowakei", nameEN: "Slovakia" },
  { code: "HU", flag: "🇭🇺", nameDE: "Ungarn", nameEN: "Hungary" },
  { code: "SI", flag: "🇸🇮", nameDE: "Slowenien", nameEN: "Slovenia" },
  { code: "HR", flag: "🇭🇷", nameDE: "Kroatien", nameEN: "Croatia" },
  { code: "RO", flag: "🇷🇴", nameDE: "Rumänien", nameEN: "Romania" },
  { code: "BG", flag: "🇧🇬", nameDE: "Bulgarien", nameEN: "Bulgaria" },
  { code: "RS", flag: "🇷🇸", nameDE: "Serbien", nameEN: "Serbia" },
  { code: "UA", flag: "🇺🇦", nameDE: "Ukraine", nameEN: "Ukraine" },
  { code: "EE", flag: "🇪🇪", nameDE: "Estland", nameEN: "Estonia" },
  { code: "LV", flag: "🇱🇻", nameDE: "Lettland", nameEN: "Latvia" },
  { code: "LT", flag: "🇱🇹", nameDE: "Litauen", nameEN: "Lithuania" },
  // Reste du monde (sélection)
  { code: "US", flag: "🇺🇸", nameDE: "USA", nameEN: "United States" },
  { code: "CA", flag: "🇨🇦", nameDE: "Kanada", nameEN: "Canada" },
  { code: "BR", flag: "🇧🇷", nameDE: "Brasilien", nameEN: "Brazil" },
  { code: "TR", flag: "🇹🇷", nameDE: "Türkei", nameEN: "Turkey" },
  { code: "RU", flag: "🇷🇺", nameDE: "Russland", nameEN: "Russia" },
  { code: "AE", flag: "🇦🇪", nameDE: "Vereinigte Arabische Emirate", nameEN: "United Arab Emirates" },
  { code: "TH", flag: "🇹🇭", nameDE: "Thailand", nameEN: "Thailand" },
  { code: "AU", flag: "🇦🇺", nameDE: "Australien", nameEN: "Australia" },
]

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}
