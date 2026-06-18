import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding demo profiles...")

  const demoHash = await bcrypt.hash("Demo!2025#", 10)

  const PROFILES = [
    // ── BERLIN ──────────────────────────────────────────────────────────────
    {
      user:    { id: "u-demo-sofia",     email: "demo.sofia@velvet-demo.de" },
      profile: {
        id: "p-demo-sofia", slug: "sofia-m-berlin",
        displayName: "Sofia M.", age: 26, cityId: "berlin",
        type: "INDEPENDENT" as const,
        tagline: "Eleganz und Intelligenz vereint",
        bio: "Bonjour, je m'appelle Sofia — cultivée, discrète et passionnée par les rencontres authentiques. Diplômée en littérature comparée, je parle couramment allemand, anglais et français. J'accompagne avec élégance lors de dîners gastronomiques, soirées culturelles ou voyages d'affaires. Mon ambiance est chaleureuse, ma présence mémorable.",
        languages: ["de", "en", "fr"],
        outcall: true, incall: false, travel: true,
        servicesTags: ["Dinner Begleitung", "Kulturelle Events", "Reisebegleitung", "Business Events"],
      },
      photos: [
        { url: "https://randomuser.me/api/portraits/women/1.jpg",  isMain: true,  position: 0 },
        { url: "https://randomuser.me/api/portraits/women/11.jpg", isMain: false, position: 1 },
        { url: "https://randomuser.me/api/portraits/women/21.jpg", isMain: false, position: 2 },
      ],
    },
    {
      user:    { id: "u-demo-valentina", email: "demo.valentina@velvet-demo.de" },
      profile: {
        id: "p-demo-valentina", slug: "valentina-k-berlin",
        displayName: "Valentina K.", age: 30, cityId: "berlin",
        type: "INDEPENDENT" as const,
        tagline: "Russische Eleganz, Berliner Charme",
        bio: "Ich bin Valentina — eine weltgewandte Frau mit einer Vorliebe für Kunst, Musik und gute Gespräche. Aufgewachsen in Sankt Petersburg, lebe ich seit Jahren in Berlin. Meine Trilingualität (Deutsch, Englisch, Russisch) ermöglicht mir, mich in jedem gesellschaftlichen Umfeld souverän zu bewegen. Ich begleite Sie gerne zu exklusiven Events oder privaten Abenden.",
        languages: ["de", "en", "ru"],
        outcall: true, incall: true, travel: false,
        servicesTags: ["VIP Begleitung", "Dinner Begleitung", "Events & Galas", "Kulturelle Veranstaltungen"],
      },
      photos: [
        { url: "https://randomuser.me/api/portraits/women/2.jpg",  isMain: true,  position: 0 },
        { url: "https://randomuser.me/api/portraits/women/12.jpg", isMain: false, position: 1 },
      ],
    },
    {
      user:    { id: "u-demo-isabelle",  email: "demo.isabelle@velvet-demo.de" },
      profile: {
        id: "p-demo-isabelle", slug: "isabelle-d-berlin",
        displayName: "Isabelle D.", age: 24, cityId: "berlin",
        type: "INDEPENDENT" as const,
        tagline: "Parisienne au cœur de Berlin",
        bio: "Née à Paris, installée à Berlin pour mes études en architecture — je suis Isabelle, 24 ans, curieuse et raffinée. J'apprécie les soirées au théâtre, les vernissages et les dîners en tête-à-tête. Bilingue français-allemand, je saurai m'adapter à toutes vos attentes avec naturel et bonne humeur.",
        languages: ["de", "fr"],
        outcall: false, incall: true, travel: false,
        servicesTags: ["Dinner Begleitung", "Kunstevents", "Privatveranstaltungen"],
      },
      photos: [
        { url: "https://randomuser.me/api/portraits/women/3.jpg",  isMain: true,  position: 0 },
        { url: "https://randomuser.me/api/portraits/women/13.jpg", isMain: false, position: 1 },
      ],
    },
    {
      user:    { id: "u-demo-elena",     email: "demo.elena@velvet-demo.de" },
      profile: {
        id: "p-demo-elena", slug: "elena-v-berlin",
        displayName: "Elena V.", age: 28, cityId: "berlin",
        type: "INDEPENDENT" as const,
        tagline: "La dolce vita trifft Berlin",
        bio: "Ciao — ich bin Elena, eine leidenschaftliche Reisende mit italienischen Wurzeln. Meine Leidenschaft gilt der Oper, der Haute Cuisine und philosophischen Gesprächen. Fließend in Deutsch, Englisch und Italienisch begleite ich Sie auf Geschäftsreisen durch ganz Europa oder zu exklusiven Veranstaltungen in Berlin. Diskret, charmant, unvergesslich.",
        languages: ["de", "en", "it"],
        outcall: true, incall: false, travel: true,
        servicesTags: ["Reisebegleitung", "Business Events", "Dinner Begleitung", "VIP Begleitung"],
      },
      photos: [
        { url: "https://randomuser.me/api/portraits/women/4.jpg",  isMain: true,  position: 0 },
        { url: "https://randomuser.me/api/portraits/women/14.jpg", isMain: false, position: 1 },
        { url: "https://randomuser.me/api/portraits/women/24.jpg", isMain: false, position: 2 },
      ],
    },
    {
      user:    { id: "u-demo-natasha",   email: "demo.natasha@velvet-demo.de" },
      profile: {
        id: "p-demo-natasha", slug: "natasha-b-berlin",
        displayName: "Natasha B.", age: 32, cityId: "berlin",
        type: "AGENCY" as const,
        agencyName: "Prestige Berlin",
        tagline: "Exzellenz auf höchstem Niveau",
        bio: "Ich bin Natasha — erfahren, souverän und bekannt für meine außergewöhnliche Diskretion. Mit einem Hintergrund in internationalem Business spreche ich drei Sprachen fließend. Ich repräsentiere das Beste, was Berlin zu bieten hat: Weltläufigkeit, Stil und echte Verbindung. Ideal für internationale Gäste und exklusive Anlässe.",
        languages: ["de", "en", "ru"],
        outcall: true, incall: true, travel: true,
        servicesTags: ["VIP Begleitung", "Internationale Events", "Dinner Begleitung", "Reisebegleitung", "Business Events"],
      },
      photos: [
        { url: "https://randomuser.me/api/portraits/women/5.jpg",  isMain: true,  position: 0 },
        { url: "https://randomuser.me/api/portraits/women/15.jpg", isMain: false, position: 1 },
      ],
    },
    {
      user:    { id: "u-demo-mia",       email: "demo.mia@velvet-demo.de" },
      profile: {
        id: "p-demo-mia", slug: "mia-c-berlin",
        displayName: "Mia C.", age: 23, cityId: "berlin",
        type: "INDEPENDENT" as const,
        tagline: "Jugendliche Frische, zeitlose Eleganz",
        bio: "Hallo! Ich bin Mia, 23, Berliner Studentin der Kunstgeschichte. Lebhaft, neugierig und immer für ein gutes Gespräch zu haben. Ich begleite Sie gerne zu Galeriebesuchen, Konzerten oder einem ruhigen Abend bei gutem Wein. Unkompliziert, warmherzig und mit einem Lächeln, das Räume erhellt.",
        languages: ["de", "en"],
        outcall: false, incall: true, travel: false,
        servicesTags: ["Dinner Begleitung", "Kunstevents", "Privatveranstaltungen"],
      },
      photos: [
        { url: "https://randomuser.me/api/portraits/women/6.jpg",  isMain: true,  position: 0 },
        { url: "https://randomuser.me/api/portraits/women/16.jpg", isMain: false, position: 1 },
      ],
    },

    // ── MÜNCHEN ─────────────────────────────────────────────────────────────
    {
      user:    { id: "u-demo-chiara",    email: "demo.chiara@velvet-demo.de" },
      profile: {
        id: "p-demo-chiara", slug: "chiara-a-muenchen",
        displayName: "Chiara A.", age: 27, cityId: "muenchen",
        type: "INDEPENDENT" as const,
        tagline: "Italiana con cuore bavarese",
        bio: "Benvenuti — sono Chiara, italiana di nascita e bavarese d'adozione. Laurea magistrale in economia a Milano, oggi consulente a Monaco. Sofisticata, curiosa, appassionata d'opera e gastronomia. Vi accompagnerò con stile e discrezione a qualsiasi evento desiderate. Parlo tedesco, inglese e italiano a livello madrelingua.",
        languages: ["de", "en", "it"],
        outcall: true, incall: false, travel: false,
        servicesTags: ["Dinner Begleitung", "Business Events", "Kulturelle Veranstaltungen", "VIP Begleitung"],
      },
      photos: [
        { url: "https://randomuser.me/api/portraits/women/7.jpg",  isMain: true,  position: 0 },
        { url: "https://randomuser.me/api/portraits/women/17.jpg", isMain: false, position: 1 },
        { url: "https://randomuser.me/api/portraits/women/27.jpg", isMain: false, position: 2 },
      ],
    },
    {
      user:    { id: "u-demo-sophie",    email: "demo.sophie@velvet-demo.de" },
      profile: {
        id: "p-demo-sophie", slug: "sophie-l-muenchen",
        displayName: "Sophie L.", age: 29, cityId: "muenchen",
        type: "INDEPENDENT" as const,
        tagline: "Münchnerin mit internationalem Flair",
        bio: "Bonjour und Grüß Gott — ich bin Sophie, aufgewachsen in München mit einem Herz für Frankreich. Mein Lebensstil verbindet bayerische Gemütlichkeit mit Pariser Raffinesse. Als Eventmanagerin kenne ich jede Facette exklusiver Veranstaltungen und weiß, wie man unvergessliche Momente schafft. Ich reise gerne und begleite Sie, wohin Sie möchten.",
        languages: ["de", "en", "fr"],
        outcall: true, incall: true, travel: true,
        servicesTags: ["Events & Galas", "Reisebegleitung", "Dinner Begleitung", "Business Events", "VIP Begleitung"],
      },
      photos: [
        { url: "https://randomuser.me/api/portraits/women/8.jpg",  isMain: true,  position: 0 },
        { url: "https://randomuser.me/api/portraits/women/18.jpg", isMain: false, position: 1 },
      ],
    },
    {
      user:    { id: "u-demo-leonie",    email: "demo.leonie@velvet-demo.de" },
      profile: {
        id: "p-demo-leonie", slug: "leonie-w-muenchen",
        displayName: "Leonie W.", age: 25, cityId: "muenchen",
        type: "INDEPENDENT" as const,
        tagline: "Natürliche Schönheit aus Bayern",
        bio: "Hi, ich bin Leonie — eine bodenständige Bayerin mit Sinn für Humor und echtem Interesse an Menschen. Ich studiere Medizin im vierten Jahr und schätze Gespräche über alles und jeden. Keine Inszenierung, keine Masken — nur Authentizität und echte Verbindung. Für Abende, die sich anfühlen wie alte Freundschaft.",
        languages: ["de", "en"],
        outcall: false, incall: true, travel: false,
        servicesTags: ["Dinner Begleitung", "Privatveranstaltungen"],
      },
      photos: [
        { url: "https://randomuser.me/api/portraits/women/9.jpg",  isMain: true,  position: 0 },
        { url: "https://randomuser.me/api/portraits/women/19.jpg", isMain: false, position: 1 },
      ],
    },
    {
      user:    { id: "u-demo-victoria",  email: "demo.victoria@velvet-demo.de" },
      profile: {
        id: "p-demo-victoria", slug: "victoria-h-muenchen",
        displayName: "Victoria H.", age: 33, cityId: "muenchen",
        type: "AGENCY" as const,
        agencyName: "Elite München",
        tagline: "Bavarian luxury redefined",
        bio: "Victoria — la définition même de l'élégance bavaroïse. Dix ans d'expérience dans l'accompagnement haut de gamme, des podiums de la Fashion Week de Milan aux salons privés de Munich. Je maîtrise les codes du monde des affaires international et m'adapte naturellement à chaque situation. Votre satisfaction est ma signature.",
        languages: ["de", "en", "fr"],
        outcall: true, incall: true, travel: true,
        servicesTags: ["VIP Begleitung", "Business Events", "Events & Galas", "Reisebegleitung", "Dinner Begleitung"],
      },
      photos: [
        { url: "https://randomuser.me/api/portraits/women/10.jpg", isMain: true,  position: 0 },
        { url: "https://randomuser.me/api/portraits/women/20.jpg", isMain: false, position: 1 },
        { url: "https://randomuser.me/api/portraits/women/30.jpg", isMain: false, position: 2 },
      ],
    },

    // ── HAMBURG ─────────────────────────────────────────────────────────────
    {
      user:    { id: "u-demo-anna",      email: "demo.anna@velvet-demo.de" },
      profile: {
        id: "p-demo-anna", slug: "anna-k-hamburg",
        displayName: "Anna K.", age: 26, cityId: "hamburg",
        type: "INDEPENDENT" as const,
        tagline: "Hanseatisch, herzlich, unverwechselbar",
        bio: "Hallo — ich bin Anna aus Hamburg. Groß geworden im Alstertal, habe ich gelernt, was hanseatische Zurückhaltung wirklich bedeutet: Eleganz ohne Prahlerei, Wärme ohne Aufdringlichkeit. Als Übersetzerin arbeite ich täglich mit Sprache und Menschen. Ich spreche fließend Deutsch, Englisch und Russisch. Für unvergessliche Begleitung in der schönsten Stadt Norddeutschlands.",
        languages: ["de", "en", "ru"],
        outcall: true, incall: false, travel: false,
        servicesTags: ["Dinner Begleitung", "Business Events", "Kulturelle Veranstaltungen"],
      },
      photos: [
        { url: "https://randomuser.me/api/portraits/women/22.jpg", isMain: true,  position: 0 },
        { url: "https://randomuser.me/api/portraits/women/32.jpg", isMain: false, position: 1 },
      ],
    },
    {
      user:    { id: "u-demo-lena",      email: "demo.lena@velvet-demo.de" },
      profile: {
        id: "p-demo-lena", slug: "lena-m-hamburg",
        displayName: "Lena M.", age: 31, cityId: "hamburg",
        type: "INDEPENDENT" as const,
        tagline: "Meer, Stil und gute Gespräche",
        bio: "Ich bin Lena — Hamburgerin durch und durch. Nach Jahren in der Londoner Finanzwelt bin ich zurück in meine Heimatstadt. Ich liebe Jazz, modernen Tanz und die Hamburger Architektur. Mit mir erleben Sie Hamburg von seiner besten Seite — vom Fischmarktfrühstück bis zur Elbphilharmonie-Gala. Bodenständig und weltgewandt zugleich.",
        languages: ["de", "en"],
        outcall: true, incall: true, travel: false,
        servicesTags: ["VIP Begleitung", "Dinner Begleitung", "Events & Galas", "Business Events"],
      },
      photos: [
        { url: "https://randomuser.me/api/portraits/women/23.jpg", isMain: true,  position: 0 },
        { url: "https://randomuser.me/api/portraits/women/33.jpg", isMain: false, position: 1 },
      ],
    },
    {
      user:    { id: "u-demo-alina",     email: "demo.alina@velvet-demo.de" },
      profile: {
        id: "p-demo-alina", slug: "alina-p-hamburg",
        displayName: "Alina P.", age: 24, cityId: "hamburg",
        type: "INDEPENDENT" as const,
        tagline: "Voyage, liberté, élégance",
        bio: "Bonjour ! Je suis Alina — franco-allemande, aventurière dans l'âme et passionnée par les nouvelles rencontres. Étudiante en design à l'HFBK Hamburg, je combine créativité et curiosité intellectuelle. Je suis la compagne idéale pour les voyages d'affaires ou les escapades weekend. Légère, spontanée et toujours le sourire aux lèvres.",
        languages: ["de", "en", "fr"],
        outcall: false, incall: false, travel: true,
        servicesTags: ["Reisebegleitung", "Dinner Begleitung", "Kulturelle Veranstaltungen"],
      },
      photos: [
        { url: "https://randomuser.me/api/portraits/women/25.jpg", isMain: true,  position: 0 },
        { url: "https://randomuser.me/api/portraits/women/35.jpg", isMain: false, position: 1 },
      ],
    },

    // ── FRANKFURT ────────────────────────────────────────────────────────────
    {
      user:    { id: "u-demo-olivia",    email: "demo.olivia@velvet-demo.de" },
      profile: {
        id: "p-demo-olivia", slug: "olivia-s-frankfurt",
        displayName: "Olivia S.", age: 28, cityId: "frankfurt",
        type: "INDEPENDENT" as const,
        tagline: "Mainhattan-Stil mit Herz",
        bio: "Guten Tag — ich bin Olivia, Frankfurterin im Herzen der Finanzmetropole. Juristin von Beruf, schätze ich Präzision, Stil und echte Gespräche. Die Bankenwelt kenne ich aus dem Effeff, weshalb ich bei Business-Events und internationalen Empfängen absolut in meinem Element bin. Diskret, intelligent und immer gepflegt.",
        languages: ["de", "en"],
        outcall: true, incall: false, travel: false,
        servicesTags: ["Business Events", "VIP Begleitung", "Dinner Begleitung", "Events & Galas"],
      },
      photos: [
        { url: "https://randomuser.me/api/portraits/women/28.jpg", isMain: true,  position: 0 },
        { url: "https://randomuser.me/api/portraits/women/38.jpg", isMain: false, position: 1 },
      ],
    },
    {
      user:    { id: "u-demo-julia",     email: "demo.julia@velvet-demo.de" },
      profile: {
        id: "p-demo-julia", slug: "julia-f-frankfurt",
        displayName: "Julia F.", age: 30, cityId: "frankfurt",
        type: "AGENCY" as const,
        agencyName: "Frankfurt Elite",
        tagline: "Cuatro idiomas, un solo estilo",
        bio: "Julia — cuatro lenguas, un solo estilo. Nacida en Madrid, formada en París y establecida en Frankfurt. Mi perfil internacional me permite acompañar a ejecutivos de cualquier origen cultural. Discreta, culta y apasionada por la gastronomía de alta gama. Si busca una compañía que combine belleza, inteligencia e idiomas, ha encontrado lo que busca.",
        languages: ["de", "en", "fr", "es"],
        outcall: true, incall: true, travel: true,
        servicesTags: ["VIP Begleitung", "Internationale Events", "Business Events", "Reisebegleitung", "Dinner Begleitung"],
      },
      photos: [
        { url: "https://randomuser.me/api/portraits/women/29.jpg", isMain: true,  position: 0 },
        { url: "https://randomuser.me/api/portraits/women/39.jpg", isMain: false, position: 1 },
        { url: "https://randomuser.me/api/portraits/women/49.jpg", isMain: false, position: 2 },
      ],
    },
    {
      user:    { id: "u-demo-katja",     email: "demo.katja@velvet-demo.de" },
      profile: {
        id: "p-demo-katja", slug: "katja-r-frankfurt",
        displayName: "Katja R.", age: 27, cityId: "frankfurt",
        type: "INDEPENDENT" as const,
        tagline: "Russische Seele, deutsche Präzision",
        bio: "Привет — ich bin Katja. In Moskau aufgewachsen, in Frankfurt verwurzelt. Meine russisch-deutsche Doppelidentität macht mich einzigartig: die Wärme der slawischen Kultur verbunden mit der Effizienz des deutschen Wesens. Ich begleite Sie diskret zu Abendveranstaltungen oder empfange Sie in meinem Frankfurter Appartement.",
        languages: ["de", "en", "ru"],
        outcall: false, incall: true, travel: false,
        servicesTags: ["Dinner Begleitung", "Privatveranstaltungen", "Kulturelle Veranstaltungen"],
      },
      photos: [
        { url: "https://randomuser.me/api/portraits/women/31.jpg", isMain: true,  position: 0 },
        { url: "https://randomuser.me/api/portraits/women/41.jpg", isMain: false, position: 1 },
      ],
    },

    // ── KÖLN ─────────────────────────────────────────────────────────────────
    {
      user:    { id: "u-demo-emma",      email: "demo.emma@velvet-demo.de" },
      profile: {
        id: "p-demo-emma", slug: "emma-b-koeln",
        displayName: "Emma B.", age: 25, cityId: "koeln",
        type: "INDEPENDENT" as const,
        tagline: "Kölsches Herz, weltoffener Geist",
        bio: "Hei! Ich bin Emma aus dem Kölner Süden. Lebensfroh, direkt und mit dem berühmten kölschen Humor gesegnet. Als Kommunikationsdesignerin habe ich ein Auge für Ästhetik und Stil. Ich begleite Sie gerne zu den unzähligen Kulturveranstaltungen unserer wunderschönen Stadt oder zu privaten Abenden bei gutem Rotwein und noch besseren Gesprächen.",
        languages: ["de", "en"],
        outcall: true, incall: true, travel: false,
        servicesTags: ["Dinner Begleitung", "Kulturelle Veranstaltungen", "Privatveranstaltungen"],
      },
      photos: [
        { url: "https://randomuser.me/api/portraits/women/34.jpg", isMain: true,  position: 0 },
        { url: "https://randomuser.me/api/portraits/women/44.jpg", isMain: false, position: 1 },
      ],
    },
    {
      user:    { id: "u-demo-sarah",     email: "demo.sarah@velvet-demo.de" },
      profile: {
        id: "p-demo-sarah", slug: "sarah-k-koeln",
        displayName: "Sarah K.", age: 29, cityId: "koeln",
        type: "INDEPENDENT" as const,
        tagline: "Entre Rhin et raffinement",
        bio: "Bonsoir — je suis Sarah, alsacienne de cœur et rhénane d'adoption. Professeure de français dans un lycée cologne, je vis pleinement l'Europe au quotidien. Passionnée de cinema, de gastronomie et de voyages, je serai la compagne idéale pour vos déplacements professionnels ou vos escapades européennes. La frontière franco-allemande n'a plus de secret pour moi.",
        languages: ["de", "en", "fr"],
        outcall: false, incall: false, travel: true,
        servicesTags: ["Reisebegleitung", "Dinner Begleitung", "Business Events"],
      },
      photos: [
        { url: "https://randomuser.me/api/portraits/women/36.jpg", isMain: true,  position: 0 },
        { url: "https://randomuser.me/api/portraits/women/46.jpg", isMain: false, position: 1 },
      ],
    },

    // ── DÜSSELDORF ───────────────────────────────────────────────────────────
    {
      user:    { id: "u-demo-nicole",    email: "demo.nicole@velvet-demo.de" },
      profile: {
        id: "p-demo-nicole", slug: "nicole-h-duesseldorf",
        displayName: "Nicole H.", age: 27, cityId: "duesseldorf",
        type: "INDEPENDENT" as const,
        tagline: "Mode, Prestige & echte Persönlichkeit",
        bio: "Hallo — ich bin Nicole, die Königsallee ist quasi mein zweites Wohnzimmer. Als Modeberaterin bin ich täglich mit dem vertraut, was Düsseldorf ausmacht: Stil, Qualität, Prestige. Ich begleite Sie zu Fashion-Events, Galerieabenden oder exklusiven Empfängen. Meine Leidenschaft: das perfekte Outfit für jeden Anlass — auch meins.",
        languages: ["de", "en"],
        outcall: true, incall: true, travel: false,
        servicesTags: ["VIP Begleitung", "Events & Galas", "Dinner Begleitung", "Business Events"],
      },
      photos: [
        { url: "https://randomuser.me/api/portraits/women/37.jpg", isMain: true,  position: 0 },
        { url: "https://randomuser.me/api/portraits/women/47.jpg", isMain: false, position: 1 },
      ],
    },
    {
      user:    { id: "u-demo-clara",     email: "demo.clara@velvet-demo.de" },
      profile: {
        id: "p-demo-clara", slug: "clara-s-duesseldorf",
        displayName: "Clara S.", age: 31, cityId: "duesseldorf",
        type: "INDEPENDENT" as const,
        tagline: "Reise avec classe",
        bio: "Clara — sophistiquée, polyglotte et passionnée par les horizons nouveaux. Basée à Düsseldorf mais présente dans toute l'Europe, j'accompagne des clients exigeants lors de voyages d'affaires, de salons internationaux et de séjours de luxe. Mon sens de l'organisation et ma discrétion absolue font de moi la partenaire idéale pour les déplacements professionnels haut de gamme.",
        languages: ["de", "en", "fr"],
        outcall: false, incall: false, travel: true,
        servicesTags: ["Reisebegleitung", "VIP Begleitung", "Business Events", "Internationale Events"],
      },
      photos: [
        { url: "https://randomuser.me/api/portraits/women/40.jpg", isMain: true,  position: 0 },
        { url: "https://randomuser.me/api/portraits/women/50.jpg", isMain: false, position: 1 },
        { url: "https://randomuser.me/api/portraits/women/60.jpg", isMain: false, position: 2 },
      ],
    },
  ]

  let created = 0
  let updated = 0

  for (const { user, profile, photos } of PROFILES) {
    // Upsert user
    await prisma.user.upsert({
      where:  { email: user.email },
      create: {
        id: user.id, email: user.email,
        passwordHash: demoHash,
        emailVerified: true, ageVerified: true,
        role: "PROFESSIONAL",
      },
      update: {},
    })

    // Check if profile exists
    const existing = await prisma.professionalProfile.findUnique({ where: { slug: profile.slug } })

    const profileData = {
      userId:       user.id,
      displayName:  profile.displayName,
      age:          profile.age,
      cityId:       profile.cityId,
      type:         profile.type,
      agencyName:   (profile as { agencyName?: string }).agencyName ?? null,
      tagline:      profile.tagline,
      bio:          profile.bio,
      languages:    profile.languages,
      outcall:      profile.outcall,
      incall:       profile.incall,
      travel:       profile.travel,
      servicesTags: profile.servicesTags,
      status:       "APPROVED" as const,
      kycStatus:    "APPROVED" as const,
      publishedAt:  new Date(),
      viewCount:    Math.floor(Math.random() * 800) + 50,
      favoriteCount: Math.floor(Math.random() * 60) + 5,
    }

    let profileRecord: { id: string }
    if (existing) {
      profileRecord = await prisma.professionalProfile.update({
        where: { slug: profile.slug },
        data: profileData,
      })
      updated++
    } else {
      profileRecord = await prisma.professionalProfile.create({
        data: { id: profile.id, slug: profile.slug, ...profileData },
      })
      created++
    }

    // Recreate photos
    await prisma.photo.deleteMany({ where: { profileId: profileRecord.id } })
    for (const photo of photos) {
      await prisma.photo.create({
        data: {
          profileId:   profileRecord.id,
          cdnUrl:      photo.url,
          storagePath: photo.url,
          isMain:      photo.isMain,
          position:    photo.position,
          isApproved:  true,
        },
      })
    }

    console.log(`  ✓ ${profile.displayName} (${profile.cityId})`)
  }

  console.log(`\n✅ Demo seed complete — ${created} created, ${updated} updated`)
  console.log(`   Total profiles: ${PROFILES.length}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
