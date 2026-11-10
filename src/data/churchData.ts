import { ChurchInfo, Ministry, ChurchEvent, ProjectImpact, MediaItem, BibleQuestion, MemberRecord, ChurchPost } from '../types';

export const OFFICIAL_CHURCH_INFO: ChurchInfo = {
  name: 'ÉGLISE DU NAZARÉEN DE DAMÉ',
  motto: '« Sainteté à l’Éternel »',
  foundedYear: 1979,
  founder: 'Saurel ALCINÉ',
  seniorPastor: 'Bequel CHERELUS',
  pastorSince: 2003,
  phone: '+509 48596089',
  email: 'contact@eglisedunazareendedame.org',
  website: 'www.eglisedunazareendedame.org',
  canonicalUrl: 'https://www.eglisedunazareendedame.org',
  address: {
    section: '3ème Section Damé',
    commune: 'Commune de Môle-Saint-Nicolas',
    department: 'Département du Nord-Ouest',
    country: 'Haïti',
    full: '3ème Section Damé, Commune de Môle-Saint-Nicolas, Département du Nord-Ouest, Haïti'
  },
  social: {
    youtube: 'https://youtube.com/@eglisedunazareendame',
    facebook: 'https://www.facebook.com/share/1Ctz8QzJ1f/'
  },
  googleMapsUrl: 'https://share.google/9kpd149ZpzHWNxOXI'
};

export const SUNDAY_ROTATION_RULES = [
  {
    sundayNumber: 1,
    title: '1er Dimanche du Mois',
    theme: 'Ministère Global & Sainte Cène',
    description: 'Culte d’adoration général réunissant toute l’assemblée, célébration de la Sainte Cène et communion fraternelle globale.',
    badgeColor: 'bg-amber-500 text-slate-950 border-amber-400',
    ministryId: 'min-global'
  },
  {
    sundayNumber: 2,
    title: '2ème Dimanche du Mois',
    theme: 'Ministère des Dames (Femmes)',
    description: 'Service conduit et animé par les Dames de l’Église du Nazaréen : louange, exhortation, prière pour les foyers et témoignages.',
    badgeColor: 'bg-rose-500 text-white border-rose-400',
    ministryId: 'min-2'
  },
  {
    sundayNumber: 3,
    title: '3ème Dimanche du Mois',
    theme: 'Ministère de la Jeunesse (JNI)',
    description: 'Culte dynamique animé par la Jeunesse Nazaréenne Internationale : chorale des jeunes, message inspirant et louange vibrante.',
    badgeColor: 'bg-blue-600 text-white border-blue-400',
    ministryId: 'min-1'
  },
  {
    sundayNumber: 4,
    title: '4ème Dimanche du Mois',
    theme: 'Ministère des Enfants',
    description: 'Culte d’édification de la petite enfance et de l’École du Dimanche : récitals bibliques, chants des enfants et bénédiction des familles.',
    badgeColor: 'bg-emerald-600 text-white border-emerald-400',
    ministryId: 'min-4'
  },
  {
    sundayNumber: 5,
    title: '5ème Dimanche du Mois (Spécial)',
    theme: 'Dimanche de la Famille',
    description: 'Quand un mois compte 5 dimanches, ce 5ème dimanche est consacré à la Famille : célébration des foyers, renouvellement des vœux spirituels et unité chrétienne.',
    badgeColor: 'bg-purple-600 text-white border-purple-400',
    ministryId: 'min-famille'
  }
];

export const OFFICIAL_MINISTRIES: Ministry[] = [
  {
    id: 'min-global',
    slug: 'global',
    name: 'Ministère Global (1er Dimanche)',
    shortDescription: 'Culte général d’adoration, Sainte Cène et communion fraternelle de toute l’assemblée.',
    description: 'Le 1er Dimanche de chaque mois est le Dimanche du Ministère Global. Toute la congrégation de Damé, les comités et tous les départements se réunissent dans l’unité pour la sainte communion, le partage de la Sainte Cène et la proclamation collective de la sainteté en Jésus-Christ.',
    leader: 'Direction Pastorale — Pasteur Bequel CHERELUS',
    schedule: '1er Dimanche du mois à 08h00',
    sundayAssignment: '1er Dimanche : Ministère Global & Sainte Cène',
    sundayNumber: 1,
    verse: 'Actes 2:42 — « Ils persévéraient dans l’enseignement des apôtres, dans la communion fraternelle, dans la fraction du pain, et dans les prières. »',
    iconName: 'Sparkles',
    image: '/images/ministeres/ministere-badge.svg'
  },
  {
    id: 'min-2',
    slug: 'dames',
    name: 'Ministère des Dames (2ème Dimanche)',
    shortDescription: 'Édification spirituelle, prière des mères, soutien familial et entraide.',
    description: 'Le 2ème Dimanche du mois est consacré au Ministère des Dames. Les femmes et mères de l’Église du Nazaréen de Damé animent le culte, partagent la Parole, intercèdent pour les enfants et les foyers et témoignent des grâces reçues.',
    leader: 'Comité Féminin Nazaréen',
    schedule: '2ème Dimanche du mois à 08h00 (& Mercredi à 15h00)',
    sundayAssignment: '2ème Dimanche : Ministère des Dames',
    sundayNumber: 2,
    verse: 'Proverbes 31:30 — « La grâce est trompeuse, et la beauté est vaine; la femme qui craint l’Éternel est celle qui sera louée. »',
    iconName: 'Heart',
    image: '/images/ministeres/ministere-badge.svg'
  },
  {
    id: 'min-1',
    slug: 'jeunesse',
    name: 'Ministère de la Jeunesse (3ème Dimanche)',
    shortDescription: 'Mobiliser, former et inspirer la jeunesse de Damé pour un témoignage vibrant.',
    description: 'Le 3ème Dimanche du mois est le Dimanche de la Jeunesse (JNI). Les jeunes de Damé dirigent le culte : louange contemporaine et fervente, chorale de jeunes, saynètes bibliques et prédication dynamique pour édifier la génération montante.',
    leader: 'Comité de la Jeunesse Nazaréenne (JNI)',
    schedule: '3ème Dimanche du mois à 08h00 (& Samedi à 15h00)',
    sundayAssignment: '3ème Dimanche : Ministère de la Jeunesse (JNI)',
    sundayNumber: 3,
    verse: '1 Timothée 4:12 — « Que personne ne méprise ta jeunesse; mais sois un modèle pour les fidèles, en parole, en conduite, en charité, en foi, en pureté. »',
    iconName: 'Flame',
    image: '/images/ministeres/ministere-badge.svg'
  },
  {
    id: 'min-4',
    slug: 'enfants',
    name: 'Ministère des Enfants (4ème Dimanche)',
    shortDescription: 'Éveil biblique, chants des tout-petits, mémorisation des versets et bénédiction.',
    description: 'Le 4ème Dimanche du mois est le Dimanche des Enfants. L’École du Dimanche et les enfants de l’Église de Damé sont à l’honneur : mémorisation de versets sacrés, chants en créole et en français, saynètes bibliques et prière pastorale pour chaque enfant.',
    leader: 'Direction de l’École du Dimanche',
    schedule: '4ème Dimanche du mois à 08h00 (École du dimanche dès 07h00)',
    sundayAssignment: '4ème Dimanche : Ministère des Enfants',
    sundayNumber: 4,
    verse: 'Proverbes 22:6 — « Instruis l’enfant selon la voie qu’il doit suivre; et quand il sera vieux, il ne s’en détournera pas. »',
    iconName: 'Smile',
    image: '/images/ministeres/ministere-badge.svg'
  },
  {
    id: 'min-famille',
    slug: 'famille',
    name: 'Dimanche de la Famille (5ème Dimanche)',
    shortDescription: 'Consécration des foyers, renouvellement de l’alliance et bénédiction parentale.',
    description: 'Lorsqu’un mois compte un 5ème dimanche, il est officiellement désigné comme le Dimanche de la Famille. C’est un rendez-vous d’action de grâces pour fortifier les couples, les pères, les mères et les enfants dans la sainteté et l’amour de Dieu.',
    leader: 'Conseil Pastoral des Familles',
    schedule: '5ème Dimanche des mois à 5 dimanches à 08h00',
    sundayAssignment: '5ème Dimanche : Dimanche de la Famille (si le mois a 5 dimanches)',
    sundayNumber: 5,
    verse: 'Josué 24:15 — « Moi et ma maison, nous servirons l’Éternel. »',
    iconName: 'Shield',
    image: '/images/ministeres/ministere-badge.svg'
  },
  {
    id: 'min-5',
    slug: 'education',
    name: 'Ministère de l’Éducation',
    shortDescription: 'Alphabétisation, cours de doctrine et renforcement académique à Damé.',
    description: 'L’Église du Nazaréen de Damé s’engage pour l’élévation intellectuelle et morale. Le ministère organise des sessions d’alphabétisation d’adultes, des cours de doctrine nazaréenne et du soutien scolaire aux élèves de la 3ème Section.',
    leader: 'Direction Pédagogique Locale',
    schedule: 'Sessions programmées en semaine',
    verse: 'Osée 4:6 & Proverbes 1:7 — « La crainte de l’Éternel est le commencement de la science. »',
    iconName: 'BookOpen',
    image: '/images/ministeres/ministere-badge.svg'
  },
  {
    id: 'min-6',
    slug: 'evangelisation',
    name: 'Ministère de l’Évangélisation',
    shortDescription: 'Gagner les âmes pour Christ à Damé, Môle-Saint-Nicolas et dans tout le Nord-Ouest.',
    description: 'Une équipe missionnaire active qui parcourt les localités environnantes pour annoncer la Bonne Nouvelle du salut, distribuer des traités bibliques, visiter les personnes âgées et alitées et implanter des cellules de prière.',
    leader: 'Commission d’Évangélisation et Missions',
    schedule: 'Vendredi à 15h30 & Sorties de terrain',
    verse: 'Marc 16:15 — « Allez par tout le monde, et prêchez la bonne nouvelle à toute la création. »',
    iconName: 'Compass',
    image: '/images/ministeres/ministere-badge.svg'
  },
  {
    id: 'min-7',
    slug: 'priere',
    name: 'Ministère de la Prière',
    shortDescription: 'Intercession continue pour le réveil de l’Église, les familles et la nation haïtienne.',
    description: 'Le cœur battant spirituel de notre communauté. Le ministère maintient une chaîne d’intercession permanente pour les malades, les missionnaires, la protection contre les calamités et la bénédiction de la région du Nord-Ouest.',
    leader: 'Équipe d’Intercession Pastorale',
    schedule: 'Mardi à 16h00 & Veillée chaque dernier vendredi du mois',
    verse: '1 Thessaloniciens 5:17 — « Priez sans cesse. »',
    iconName: 'Sparkles',
    image: '/images/ministeres/ministere-badge.svg'
  }
];

export const OFFICIAL_SERVICES: ChurchEvent[] = [
  {
    id: 'ev-1',
    title: 'Grand Culte d’Adoration (Rotation des Ministères)',
    category: 'culte',
    day: 'Chaque Dimanche',
    time: '08h00 – 11h30',
  location: "Complexe de l\x27Ãglise Ã  DamÃ©, Commune de MÃ´le-Saint-Nicolas, HaÃ¯ti",
    description: 'Programme des Dimanches : 1er Dimanche (Ministère Global & Sainte Cène), 2ème Dimanche (Ministère des Dames), 3ème Dimanche (Ministère de la Jeunesse JNI), 4ème Dimanche (Ministère des Enfants), et 5ème Dimanche spécial : Dimanche de la Famille.',
    isRecurrent: true,
    image: '/images/evenements/evenement-badge.svg'
  },
  {
    id: 'ev-2',
    title: 'École du Dimanche (Classes pour tous âges)',
    category: 'formation',
    day: 'Chaque Dimanche',
    time: '07h00 – 08h00',
    location: 'Salles pédagogiques de l’Église',
    description: 'Étude méthodique et interactive de la leçon de l’École du Dimanche, adaptée aux enfants, jeunes et adultes.',
    isRecurrent: true,
    image: '/images/evenements/evenement-badge.svg'
  },
  {
    id: 'ev-3',
    title: 'Réunion de Prière et d’Intercession',
    category: 'priere',
    day: 'Chaque Mardi',
    time: '16h00 – 18h00',
  location: "Complexe de l\x27Ãglise Ã  DamÃ©, Commune de MÃ´le-Saint-Nicolas, HaÃ¯ti",
    description: 'Dépôt des fardeaux au pied de la Croix, prière pour les malades, les orphelins et les besoins spirituels et temporels.',
    isRecurrent: true,
    image: '/images/evenements/evenement-badge.svg'
  },
  {
    id: 'ev-4',
    title: 'Étude Biblique & Doctrine de Sainteté',
    category: 'formation',
    day: 'Chaque Jeudi',
    time: '16h00 – 18h00',
  location: "Complexe de l\x27Ãglise Ã  DamÃ©, Commune de MÃ´le-Saint-Nicolas, HaÃ¯ti",
    description: 'Approfondissement des Saintes Écritures, articles de foi nazaréens et sanctification pratique au quotidien.',
    isRecurrent: true,
    image: '/images/evenements/evenement-badge.svg'
  },
  {
    id: 'ev-5',
    title: 'Rassemblement de la Jeunesse (JNI)',
    category: 'jeunesse',
    day: 'Chaque Samedi',
    time: '15h00 – 17h30',
    location: 'Sanctuaire et cour de l’Église',
    description: 'Débats bibliques, répétitions de chorale, louange dynamique, exhortations et fraternité chrétienne.',
    isRecurrent: true,
    image: '/images/evenements/evenement-badge.svg'
  },
  {
    id: 'ev-6',
    title: 'Grande Conférence Annuelle de Réveil Spirituel',
    category: 'conference',
    day: 'Événement Spécial 2026',
    time: 'Du 15 au 18 Novembre 2026',
  location: "Complexe de l\x27Ãglise Ã  DamÃ©, Commune de MÃ´le-Saint-Nicolas, HaÃ¯ti",
    description: 'Quatre jours de jeûne, de louange et d’édification avec des orateurs du district Nord-Ouest et internationaux sous le thème : « Vivre la Sainteté dans un monde en mutation ».',
    isRecurrent: false,
    date: '15 Nov 2026',
    image: '/images/evenements/evenement-badge.svg'
  }
];

export const OFFICIAL_PROJECT_CDEJ: ProjectImpact = {
  id: 'proj-cdej-0926',
  code: 'CDEJ HA 0926',
  title: 'Centre de Développement de l’Enfant et du Jeune (CDEJ HA 0926)',
  partner: 'Compassion International',
  category: 'Développement Holistique de l’Enfance',
  summary: 'Partenariat actif entre l’Église du Nazaréen de Damé et Compassion International pour libérer les enfants de la pauvreté au nom de Jésus.',
  fullDescription: `Le Centre de Développement de l'Enfant et du Jeune (CDEJ HA 0926) est implanté au cœur de la 3ème Section Damé, Commune de Môle-Saint-Nicolas.
En partenariat étroit avec l'organisation humanitaire chrétienne Compassion International, l'Église du Nazaréen prend en charge de façon holistique des centaines d'enfants et adolescents issus des familles les plus vulnérables du Nord-Ouest d'Haïti.

Le programme intègre quatre dimensions fondamentales :
1. Dimension Spirituelle : Donner à chaque enfant la possibilité de connaître Jésus-Christ et de grandir dans la foi biblique.
2. Dimension Physique : Bilan médical annuel, soins curatifs d'urgence, compléments nutritionnels et sensibilisation à l'hygiène.
3. Dimension Cognitive : Bourses d'études, fournitures scolaires, cours de renforcement et initiation aux nouvelles technologies.
4. Dimension Socio-émotionnelle : Protection de l'enfance, activités sportives, développement de l'estime de soi et mentorat chrétien.`,
  status: 'active',
  targetBeneficiaries: 300,
  reachedBeneficiaries: 200,
  location: "Complexe de l'Église à Damé, Commune de Môle-Saint-Nicolas, Haïti",
  bannerImage: '/images/projets/cdej-compassion.svg',
  metrics: [
    { 
      label: 'Enfants Parrainés', 
      value: '+200', 
      sublabel: 'Timoun Parène aktif',
      icon: 'Users' 
    },
    { 
      label: 'Clinique Mobile / An', 
      value: '+200', 
      sublabel: 'Klinik mobil chak ane pou +200 moun',
      icon: 'HeartPulse' 
    },
    { 
      label: 'Formations & Clubs', 
      value: 'Mèkredi, Vandredi & Samdi', 
      sublabel: 'Chak semèn pou timoun yo',
      icon: 'BookOpen' 
    },
    { 
      label: 'Club des Parents (Klib Paran)', 
      value: 'Chak Dènye Vandredi', 
      sublabel: 'Dènye vandredi nan chak mwa',
      icon: 'Home' 
    }
  ],
  pillars: [
    {
      title: 'Parrainage d’Enfants (+200 Bénéficiaires)',
      desc: 'Plus de 200 enfants parrainés de la 3ème Section Damé bénéficiant d’un soutien holistique : spirituel, éducatif, nutritionnel et social.'
    },
    {
      title: 'Cliniques Mobiles Annuelles (+200)',
      desc: 'Organisation régulière de cliniques mobiles chaque année pour apporter des soins médicaux, bilans pédiatriques et dépistage à plus de 200 personnes.'
    },
    {
      title: 'Clubs & Formations (Mercredi, Vendredi & Samedi)',
      desc: 'Activités pédagogiques, enseignement de la foi chrétienne, chants et ateliers pratiques pour les enfants chaque mercredi, vendredi et samedi.'
    },
    {
      title: 'Club des Parents (Dernier Vendredi du Mois)',
      desc: 'Rencontre mensuelle de formation et de dialogue avec les parents chaque dernier vendredi du mois pour l’encadrement harmonieux des familles.'
    }
  ]
};

export const OFFICIAL_MEDIA: MediaItem[] = [];

export const BIBLE_QUESTIONS: BibleQuestion[] = [
  {
    id: 1,
    question: 'Quelle est la devise historique officielle de l’Église du Nazaréen ?',
    options: ['Gloire au Très-Haut', 'Sainteté à l’Éternel', 'Grâce et Vérité', 'Jésus sauve et guérit'],
    correctIndex: 1,
    reference: 'Exode 28:36 & Zacharie 14:20',
    explanation: '« Sainteté à l’Éternel » est la devise fondatrice proclamée dès l’Ancien Testament et portée avec foi par les églises du mouvement de sainteté biblique.',
    difficulty: 'facile'
  },
  {
    id: 2,
    question: 'En quelle année l’Église du Nazaréen de Damé a-t-elle été fondée en Haïti ?',
    options: ['1965', '1979', '1988', '2003'],
    correctIndex: 1,
    reference: 'Histoire officielle de l’Église de Damé',
    explanation: 'L’Église du Nazaréen de Damé a été fondée en 1979 sous l’impulsion du pionnier chrétien Saurel ALCINÉ.',
    difficulty: 'facile'
  },
  {
    id: 3,
    question: 'Qui est le pasteur titulaire de l’Église du Nazaréen de Damé depuis 2003 ?',
    options: ['Pasteur Saurel ALCINÉ', 'Pasteur Bequel CHERELUS', 'Pasteur Jean CALVIN', 'Pasteur Moïse BAPTISTE'],
    correctIndex: 1,
    reference: 'Direction Pastorale de Damé',
    explanation: 'Le Pasteur Bequel CHERELUS conduit fidèlement le troupeau de Damé depuis l’année 2003.',
    difficulty: 'facile'
  },
  {
    id: 4,
    question: 'Quel est l’indicatif du projet de développement de l’enfant en partenariat avec Compassion International à Damé ?',
    options: ['CDEJ HA 0100', 'CDEJ HA 0926', 'CDEJ NO 0500', 'CDEJ HT 2026'],
    correctIndex: 1,
    reference: 'Partenariat Compassion International',
    explanation: 'Le code officiel du centre de Damé est CDEJ HA 0926, prenant en charge plus de 265 enfants bénéficiaires.',
    difficulty: 'moyen'
  },
  {
    id: 5,
    question: 'Dans quel livre de la Bible retrouve-t-on : « Recherchez la paix avec tous, et la sanctification, sans laquelle personne ne verra le Seigneur » ?',
    options: ['Romains', 'Galates', 'Hébreux', 'Apocalypse'],
    correctIndex: 2,
    reference: 'Hébreux 12:14',
    explanation: 'Hébreux 12:14 rappelle l’importance capitale de la sanctification dans la vie de chaque disciple du Christ.',
    difficulty: 'moyen'
  },
  {
    id: 6,
    question: 'Combien de ministères officiels structurent la vie communautaire de l’Église de Damé ?',
    options: ['3 ministères', '5 ministères', '7 ministères', '12 ministères'],
    correctIndex: 2,
    reference: 'Organisation ecclésiale',
    explanation: 'L’Église de Damé compte 7 ministères piliers : Jeunesse, Femmes, Hommes, Enfants, Éducation, Évangélisation et Prière.',
    difficulty: 'facile'
  },
  {
    id: 7,
    question: 'Quel personnage biblique a proclamé avec fermeté : « Moi et ma maison, nous servirons l’Éternel » ?',
    options: ['Moïse', 'Josué', 'David', 'Samuel'],
    correctIndex: 1,
    reference: 'Josué 24:15',
    explanation: 'Josué a posé ce choix irrévocable devant tout le peuple d’Israël assemblé à Sichem.',
    difficulty: 'facile'
  },
  {
    id: 8,
    question: 'Quel est le fruit de l’Esprit selon Galates 5:22-23 ?',
    options: ['La richesse, la renommée et le pouvoir', 'L’amour, la joie, la paix, la patience, la bonté...', 'Le sacrifice, le jeûne et le silence', 'La sagesse humaine et la philosophie'],
    correctIndex: 1,
    reference: 'Galates 5:22-23',
    explanation: '« Mais le fruit de l’Esprit, c’est l’amour, la joie, la paix, la patience, la bonté, la bénignité, la fidélité, la douceur, la tempérance. »',
    difficulty: 'moyen'
  },
  {
    id: 9,
    question: 'Dans quelle commune et département d’Haïti l’Église de Damé est-elle située ?',
    options: ['Port-de-Paix, Nord-Ouest', 'Commune de Môle-Saint-Nicolas, Nord-Ouest', 'Saint-Louis du Nord, Nord-Ouest', 'Gonaïves, Artibonite'],
    correctIndex: 1,
    reference: 'Adresse géographique officielle',
    explanation: 'Damé est la 3ème Section communale de la magnifique et historique commune de Môle-Saint-Nicolas, Département du Nord-Ouest.',
    difficulty: 'facile'
  },
  {
    id: 10,
    question: 'Dans 1 Thessaloniciens 5:23, que demande l’apôtre Paul que Dieu sanctifie en nous ?',
    options: ['Seulement notre corps', 'Tout notre être : l’esprit, l’âme et le corps', 'Uniquement notre esprit', 'Notre intelligence uniquement'],
    correctIndex: 1,
    reference: '1 Thessaloniciens 5:23',
    explanation: '« Que le Dieu de paix vous sanctifie lui-même tout entiers, et que tout votre être, l’esprit, l’âme et le corps, soit conservé irrépréhensible... »',
    difficulty: 'difficile'
  }
];

export const INITIAL_MEMBERS: MemberRecord[] = [
  {
    id: 'mem-1',
    regNumber: 'DAM-1979-001',
    fullName: 'Saurel ALCINÉ',
    gender: 'M',
    phone: '+509 48596089',
    address: '3ème Section Damé, Môle-Saint-Nicolas',
    ministryAffiliation: 'Fondateur & Conseil des Anciens',
    status: 'actif',
    joinedDate: '1979-05-12'
  },
  {
    id: 'mem-2',
    regNumber: 'DAM-2003-014',
    fullName: 'Bequel CHERELUS',
    gender: 'M',
    phone: '+509 48596089',
    email: 'contact@eglisedunazareendedame.org',
    address: 'Presbytère de Damé, Môle-Saint-Nicolas',
    ministryAffiliation: 'Pasteur Titulaire',
    status: 'actif',
    joinedDate: '2003-08-10'
  },
  {
    id: 'mem-3',
    regNumber: 'DAM-2015-089',
    fullName: 'Esther PIERRE',
    gender: 'F',
    phone: '+509 37124567',
    address: 'Damé Centre',
    ministryAffiliation: 'Ministère des Femmes',
    status: 'actif',
    joinedDate: '2015-03-22'
  },
  {
    id: 'mem-4',
    regNumber: 'DAM-2019-142',
    fullName: 'Jean-Marc DÉSIR',
    gender: 'M',
    phone: '+509 44889900',
    address: 'Damé Nord',
    ministryAffiliation: 'Jeunesse (JNI)',
    status: 'actif',
    joinedDate: '2019-07-14'
  },
  {
    id: 'mem-5',
    regNumber: 'DAM-2021-205',
    fullName: 'Nathalie CHERELUS',
    gender: 'F',
    phone: '+509 38992211',
    address: 'Damé Centre',
    ministryAffiliation: 'CDEJ HA 0926 & Enfants',
    status: 'actif',
    joinedDate: '2021-01-18'
  }
];

// Espace officiel des publications : toutes les anciennes publications ont été supprimées.
// Cet espace propre permet au secrétariat et au pasteur de publier leurs propres articles, annonces et méditations.
export const INITIAL_PUBLICATIONS: ChurchPost[] = [];
