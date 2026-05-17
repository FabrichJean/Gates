export const CORE_STAGE_DATA = {
  header: {
    heading: 'CORE STAGE',
    subheading: 'Le centre de mon univers. Moi. Mon écosystème. Ma vision.',
  },

  bio: {
    title: 'QUI SUIS-JE ?',
    text: 'Je suis un builder passionné par les systèmes, l\'autonomie et la liberté de créer. J\'explore, j\'expérimente et je construis des outils qui ont du sens.',
    codeSnippet: 'I build systems that connect\nideas, tools and autonomy. </>',
  },

  focus: {
    title: 'FOCUS ACTUEL',
    subtitle: 'Architecture de mon écosystème.',
    items: [
      { label: 'Guardian System', progress: 75 },
      { label: 'JSON Storage API', progress: 60 },
    ],
    viewAllLink: 'VOIR TOUS LES OBJECTIFS',
  },

  energy: {
    title: 'ÉNERGIE DU JOUR',
    value: 87,
    description: 'Énergie créative élevée',
    bestTime: 'Meilleur moment : 09:00 – 13:00',
  },

  philosophy: {
    title: 'MA PHILOSOPHIE',
    text: 'La meilleure façon de prédire le futur est de le construire.',
    author: '— Fabrich',
  },

  hub: {
    statusCode: 'FABRICH_01',
    name: 'FABRICH',
    title: 'ARCHITECTE • DÉVELOPPEUR • EXPLORATEUR',
    builderModeText: 'BUILDER MODE',
    portraitImage: "/portrait.png", // URL d'image optionnelle du portrait
  },

  satellites: [
    {
      id: 'guardian',
      name: 'GUARDIAN',
      description: 'Security & Control',
      status: 'En développement',
      position: 'sat-tl',
      icon: '🛡',
      color: '#3a6090',
      textColor: '#a0c0e0',
    },
    {
      id: 'tunnel',
      name: 'TUNNEL',
      description: 'Telegram Bridge',
      status: 'Actif',
      position: 'sat-ml',
      icon: '✈',
      color: '#00b090',
      textColor: '#00e0b0',
    },
    {
      id: 'json-api',
      name: 'JSON API',
      description: 'Données & Stockage',
      status: 'En développement',
      position: 'sat-bl',
      icon: '⬡',
      color: '#00a070',
      textColor: '#00d090',
    },
    {
      id: 'portfolio',
      name: 'PORTFOLIO',
      description: 'Interface & Universe',
      status: 'En évolution',
      position: 'sat-tr',
      icon: '♛',
      color: '#806040',
      textColor: '#a0c0e0',
    },
    {
      id: 'vs-code-ext',
      name: 'VS CODE EXT',
      description: 'Productivité',
      status: 'En développement',
      position: 'sat-mr',
      icon: '<>',
      color: '#c08020',
      textColor: '#a0c0e0',
    },
    {
      id: 'lab-chaos',
      name: 'LAB CHAOS',
      description: 'Expérimentations',
      status: 'Actif',
      position: 'sat-br',
      icon: '⚗',
      color: '#207050',
      textColor: '#80d0a0',
    },
  ],

  quote: 'Un écosystème n\'est pas une collection de projets. C\'est un organisme vivant qui évolue, apprend et se renforce.',

  activities: [
    {
      id: 'tunnel-update',
      time: '11:42',
      icon: '🔗',
      description: 'Tunnel node updated',
      tag: 'TUNNEL',
      tagColor: 'tag-tunnel',
    },
    {
      id: 'guardian-activity',
      time: '11:48',
      icon: '🛡',
      description: 'Guardian activity detected',
      tag: 'GUARDIAN',
      tagColor: 'tag-guardian',
    },
    {
      id: 'json-optimized',
      time: '11:38',
      icon: '⬡',
      description: 'JSON Storage API optimized',
      tag: 'JSON API',
      tagColor: 'tag-json',
    },
    {
      id: 'lab-experiment',
      time: '11:36',
      icon: '⚗',
      description: 'New experiment in LAB',
      tag: 'LAB',
      tagColor: 'tag-lab',
    },
    {
      id: 'portfolio-synced',
      time: '11:32',
      icon: '♛',
      description: 'Portfolio system synced',
      tag: 'PORTFOLIO',
      tagColor: 'tag-portfolio',
    },
  ],

  quickNav: [
    {
      id: 'explore-system',
      label: 'EXPLORER LE SYSTÈME',
      subtitle: 'Voir l\'architecture globale',
      icon: '⬡',
      color: '#a0c0e0',
    },
    {
      id: 'discover-projects',
      label: 'DÉCOUVRIR LES PROJETS',
      subtitle: 'Explorer les modules',
      icon: '🛡',
      color: '#a0c0e0',
    },
    {
      id: 'stream-live',
      label: 'STREAM EN DIRECT',
      subtitle: 'Des outils qui libèrent le temps.',
      icon: '✈',
      color: '#00e0b0',
    },
    {
      id: 'lab-chaos',
      label: 'LAB / CHAOS',
      subtitle: 'Zone d\'expérimentation',
      icon: '⚗',
      color: '#e0b840',
    },
  ],

  quickAccess: [
    { label: 'SYSTEM', sublabel: 'Architecture', icon: '⬡', color: '#a0c0e0' },
    { label: 'PROJECTS', sublabel: 'Modules', icon: '◈', color: '#5a90c0' },
    { label: 'STREAM', sublabel: 'Activité Live', icon: '∿', color: '#00e0b0' },
    { label: 'LAB', sublabel: 'Expérimentations', icon: '⚗', color: '#e0b840', active: true },
  ],

  metrics: [
    { label: 'Modules Actifs', value: '6/12' },
    { label: 'Connexions', value: '24', icon: '⚡' },
    { label: 'Événements (24h)', value: '128', icon: '↯' },
    { label: 'Uptime', value: '7d 14h' },
  ],

  vision: {
    title: 'MA VISION',
    text: 'Créer des systèmes qui donnent du pouvoir. Des outils qui libèrent le temps. Un écosystème qui grandit avec moi et pour les autres.',
    progress: 68,
  },

  footer: 'Tout est connecté. Tout évolue. Tout s\'aligne. Bienvenue dans mon univers.',
};
