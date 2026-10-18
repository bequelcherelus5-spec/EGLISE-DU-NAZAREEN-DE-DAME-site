import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

declare global {
  interface Window {
    googleTranslateElementInit?: any;
    google?: any;
  }
}

export type LanguageCode = 'ht' | 'fr' | 'es' | 'en';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'ht', label: 'Créole', nativeLabel: 'Kreyòl Ayisyen', flag: '🇭🇹' },
  { code: 'fr', label: 'Français', nativeLabel: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Espagnol', nativeLabel: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'Anglais', nativeLabel: 'English', flag: '🇺🇸' },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  ht: {
    // Nav & General
    'motto': '« Sentite pou Letènèl »',
    'location_short': '3èm Seksyon Damé, Mòl Sen Nikola, Haïti',
    'nav_home': 'Akèy',
    'nav_about': 'A Pwopo',
    'nav_ministries': 'Ministè yo',
    'nav_events': 'Kalandriye & Kil',
    'nav_prayer': 'Espas Priyè Sekrè',
    'nav_testimonies': 'Temwayaj Gras Bondye',
    'nav_lessons': 'Lekòl Dimanch & Leson',
    'nav_projects': 'Pwojè (CDEJ HA 0926)',
    'nav_media': 'Medya & Prèch',
    'nav_bible_games': 'Jwèt Biblik',
    'nav_contact': 'Kontak',
    'nav_secretariat': 'Sekretarya',
    'nav_resources': 'Leson & Resous Biblik',
    'nav_faq': 'Kesyon yo Poze Souvan (FAQ)',
    'nav_discipleship': 'Nouvo Kwayan (Disipila)',
    'nav_docs': 'Mande Dokiman / Sètifika',
    'nav_radio': 'Radyo Nazaréen Damé',
    'nav_daily_verse': 'Lekti Biblik Chak Jou',
    // Hero & Home
    'hero_title': 'Byenvini nan Legliz Nazaréen de Damé',
    'hero_subtitle': 'Yon kominote kwayan vivan ki fonde sou Pawòl Bondye ak Sentite Biblik depi 1979 anba direksyon Pasteur Bequel CHERELUS.',
    'btn_prayer_request': 'Espas Priyè Sekrè',
    'btn_google_calendar': 'Mete sou Google Calendar mwen',
    'btn_contact': 'Kontakte nou',
    'btn_services': 'Orè Kil yo',
    'btn_share': 'Pataje',
    'btn_share_page': 'Pataje Paj la',
    'btn_copy_link': 'Kopye Lyen an',
    'btn_download': 'Telechaje',
    'lang_label': 'Chwazi Lang',
    'footer_rights': 'Tout dwa rezève.',
    'pastoral_welcome': 'Mo Byenvini Pasteur a',
    'sunday_service': 'Gran Kil Adorasyon ak Louwanj',
    'tuesday_prayer': 'Reyinyon Lapriyè & Entècesyon',
    'thursday_study': 'Etid Biblik & Sanktifikasyon',
    'saturday_youth': 'Rasanbleman Jèn yo (JNI)',
    'cert_title': 'Sètifika Chanpyon Biblik',
    'cert_subtitle': 'Onè & Ekselans nan Konesans Biblik',
    'radio_live': 'Radyo Nazaréen Damé An Dirèk',
    'radio_status': 'Difizyon 24/7 – Louwanj, Lapriyè & Prédikasyon',
    'urgent_alert': 'Anons Espesyal & Ijan',
    'new_believer_title': 'Mwen Bay Lavi m bay Jezi / Enskripsyon Disipila',
    'google_maps_label': 'Ouvri nan Google Maps (Itinerè GPS)',
    'prayer_wall_title': 'Mi Lapriyè Kominotè',
    'confidential_badge': 'Sekrè & Konfidansyèl',
    'pastor_name': 'Pasteur Bequel CHERELUS',
    'cdej_title': 'Sant Devlopman Timoun ak Jèn (CDEJ HA 0926)',
    'send_message': 'Voye Mesaj la',
    'submit': 'Soumèt',
    'cancel': 'Anile',
  },
  fr: {
    'motto': '« Sainteté à l’Éternel »',
    'location_short': '3ème Section Damé, Môle-Saint-Nicolas, Haïti',
    'nav_home': 'Accueil',
    'nav_about': 'À Propos',
    'nav_ministries': 'Ministères',
    'nav_events': 'Événements & Cultes',
    'nav_prayer': 'Requêtes de Prière',
    'nav_testimonies': 'Témoignages de Foi',
    'nav_lessons': 'École du Dimanche & Leçons',
    'nav_projects': 'Projets (CDEJ HA 0926)',
    'nav_media': 'Médias & Prédications',
    'nav_bible_games': 'Jeux Bibliques',
    'nav_contact': 'Contact',
    'nav_secretariat': 'Secrétariat',
    'nav_resources': 'Leçons & Ressources Bibliques',
    'nav_faq': 'Questions Fréquentes (FAQ)',
    'nav_discipleship': 'Nouveaux Croyants (Discipulat)',
    'nav_docs': 'Demande de Documents / Certificats',
    'nav_radio': 'Radio Nazaréen Damé',
    'nav_daily_verse': 'Lecture Biblique Quotidienne',
    'hero_title': 'Bienvenue à l’Église du Nazaréen de Damé',
    'hero_subtitle': 'Une communauté de foi vivante ancrée dans la Parole de Dieu et la Sainteté Biblique depuis 1979 sous la direction du Pasteur Bequel CHERELUS.',
    'btn_prayer_request': 'Requêtes de Prière Secrètes',
    'btn_google_calendar': 'Ajouter à mon Google Calendar',
    'btn_contact': 'Nous contacter',
    'btn_services': 'Horaires des Cultes',
    'btn_share': 'Partager',
    'btn_share_page': 'Partager la page',
    'btn_copy_link': 'Copier le lien',
    'btn_download': 'Télécharger',
    'lang_label': 'Changer de langue',
    'footer_rights': 'Tous droits réservés.',
    'pastoral_welcome': 'Mot de bienvenue pastoral',
    'sunday_service': 'Grand Culte d’Adoration',
    'tuesday_prayer': 'Réunion de Prière & Intercession',
    'thursday_study': 'Étude Biblique & Sanctification',
    'saturday_youth': 'Rassemblement de la Jeunesse (JNI)',
    'cert_title': 'Certificat de Champion Biblique',
    'cert_subtitle': 'Honneur & Excellence en Connaissance Biblique',
    'radio_live': 'Radio Nazaréen Damé En Direct',
    'radio_status': 'Diffusion 24/7 – Louange, Prière & Prédications',
    'urgent_alert': 'Avis Spécial & Urgent',
    'new_believer_title': 'J’ai donné ma vie à Jésus / Inscription au Discipulat',
    'google_maps_label': 'Ouvrir sur Google Maps (Itinéraire GPS)',
    'prayer_wall_title': 'Mur de Prière Communautaire',
    'confidential_badge': 'Confidentiel & Pastoral',
    'pastor_name': 'Pasteur Bequel CHERELUS',
    'cdej_title': 'Centre de Développement des Enfants et Jeunes (CDEJ HA 0926)',
    'send_message': 'Envoyer le message',
    'submit': 'Soumettre',
    'cancel': 'Annuler',
  },
  es: {
    'motto': '« Santidad a Jehová »',
    'location_short': '3ra Sección Damé, Môle-Saint-Nicolas, Haití',
    'nav_home': 'Inicio',
    'nav_about': 'Acerca de',
    'nav_ministries': 'Ministerios',
    'nav_events': 'Eventos y Cultos',
    'nav_prayer': 'Peticiones de Oración',
    'nav_testimonies': 'Testimonios de Fe',
    'nav_lessons': 'Escuela Dominical y Lecciones',
    'nav_projects': 'Proyectos (CDEJ HA 0926)',
    'nav_media': 'Medios y Prédicas',
    'nav_bible_games': 'Juegos Bíblicos',
    'nav_contact': 'Contacto',
    'nav_secretariat': 'Secretaría',
    'nav_resources': 'Lecciones y Recursos Bíblicos',
    'nav_faq': 'Preguntas Frecuentes (FAQ)',
    'nav_discipleship': 'Nuevos Creyentes (Discipulado)',
    'nav_docs': 'Solicitud de Documentos',
    'nav_radio': 'Radio Nazareno Damé',
    'nav_daily_verse': 'Lectura Bíblica Diaria',
    'hero_title': 'Bienvenidos a la Iglesia del Nazareno de Damé',
    'hero_subtitle': 'Una comunidad viva de fe arraigada en la Palabra de Dios y la Santidad Bíblica desde 1979 bajo la dirección del Pastor Bequel CHERELUS.',
    'btn_prayer_request': 'Espacio de Oración Secreta',
    'btn_google_calendar': 'Añadir a mi Google Calendar',
    'btn_contact': 'Contáctenos',
    'btn_services': 'Horarios de Cultos',
    'btn_share': 'Compartir',
    'btn_share_page': 'Compartir página',
    'btn_copy_link': 'Copiar enlace',
    'btn_download': 'Descargar',
    'lang_label': 'Cambiar idioma',
    'footer_rights': 'Todos los derechos reservados.',
    'pastoral_welcome': 'Palabras del Pastor Principal',
    'sunday_service': 'Gran Culto de Adoración',
    'tuesday_prayer': 'Reunión de Oración e Intercesión',
    'thursday_study': 'Estudio Bíblico y Santificación',
    'saturday_youth': 'Reunión de Jóvenes (JNI)',
    'cert_title': 'Certificado de Campeón Bíblico',
    'cert_subtitle': 'Honor y Excelencia en Conocimiento Bíblico',
    'radio_live': 'Radio Nazareno Damé En Vivo',
    'radio_status': 'Transmisión 24/7 – Alabanza, Oración y Mensajes',
    'urgent_alert': 'Aviso Especial y Urgente',
    'new_believer_title': 'Acepté a Jesús / Inscripción al Discipulado',
    'google_maps_label': 'Abrir en Google Maps (Ruta GPS)',
    'prayer_wall_title': 'Muro de Oración de la Comunidad',
    'confidential_badge': 'Confidencial y Pastoral',
    'pastor_name': 'Pastor Bequel CHERELUS',
    'cdej_title': 'Centro de Desarrollo de Niños y Jóvenes (CDEJ HA 0926)',
    'send_message': 'Enviar mensaje',
    'submit': 'Enviar',
    'cancel': 'Cancelar',
  },
  en: {
    'motto': '« Holiness unto the Lord »',
    'location_short': '3rd Section Damé, Môle-Saint-Nicolas, Haiti',
    'nav_home': 'Home',
    'nav_about': 'About Us',
    'nav_ministries': 'Ministries',
    'nav_events': 'Events & Worship',
    'nav_prayer': 'Prayer Requests',
    'nav_testimonies': 'Faith Testimonies',
    'nav_lessons': 'Sunday School & Lessons',
    'nav_projects': 'Projects (CDEJ HA 0926)',
    'nav_media': 'Media & Sermons',
    'nav_bible_games': 'Bible Games',
    'nav_contact': 'Contact',
    'nav_secretariat': 'Secretariat',
    'nav_resources': 'Sunday School & Bible Resources',
    'nav_faq': 'Frequently Asked Questions (FAQ)',
    'nav_discipleship': 'New Believers (Discipleship)',
    'nav_docs': 'Request Pastoral Documents',
    'nav_radio': 'Nazarene Damé Web Radio',
    'nav_daily_verse': 'Daily Bible Reading',
    'hero_title': 'Welcome to the Church of the Nazarene Damé',
    'hero_subtitle': 'A vibrant community of faith rooted in God’s Word and Biblical Holiness since 1979 under Senior Pastor Bequel CHERELUS.',
    'btn_prayer_request': 'Confidential Prayer Requests',
    'btn_google_calendar': 'Add to my Google Calendar',
    'btn_contact': 'Contact Us',
    'btn_services': 'Service Times',
    'btn_share': 'Share',
    'btn_share_page': 'Share page',
    'btn_copy_link': 'Copy link',
    'btn_download': 'Download',
    'lang_label': 'Select Language',
    'footer_rights': 'All rights reserved.',
    'pastoral_welcome': 'Pastor’s Welcome Message',
    'sunday_service': 'Sunday Worship & Praise Service',
    'tuesday_prayer': 'Prayer & Intercession Service',
    'thursday_study': 'Bible Study & Holiness Teaching',
    'saturday_youth': 'Nazarene Youth Gathering (NYI)',
    'cert_title': 'Bible Champion Certificate',
    'cert_subtitle': 'Honor & Excellence in Biblical Knowledge',
    'radio_live': 'Damé Nazarene Live Radio',
    'radio_status': 'Broadcasting 24/7 – Worship, Prayer & Preaching',
    'urgent_alert': 'Special Urgent Announcement',
    'new_believer_title': 'I Accepted Jesus / Discipleship Registration',
    'google_maps_label': 'Open in Google Maps (GPS Route)',
    'prayer_wall_title': 'Community Prayer Wall',
    'confidential_badge': 'Confidential & Pastoral',
    'pastor_name': 'Pastor Bequel CHERELUS',
    'cdej_title': 'Child & Youth Development Center (CDEJ HA 0926)',
    'send_message': 'Send message',
    'submit': 'Submit',
    'cancel': 'Cancel',
  }
};

// Comprehensive phrase replacements for automated DOM translation
const DOM_PHRASE_DICTIONARY: Record<LanguageCode, [RegExp | string, string][]> = {
  ht: [
    ['Accueil', 'Akèy'],
    ['À Propos', 'A Pwopo'],
    ['Ministères', 'Ministè yo'],
    ['Événements & Cultes', 'Kalandriye & Kil'],
    ['Événements', 'Kalandriye & Evenman'],
    ['Requêtes de Prière', 'Espas Priyè Sekrè'],
    ['Priyè / Prière', 'Priyè Sekrè'],
    ['Projets (CDEJ)', 'Pwojè (CDEJ)'],
    ['Médias & Prédications', 'Medya & Prèch'],
    ['Jeux Bibliques', 'Jwèt Biblik'],
    ['Contact', 'Kontak'],
    ['Secrétariat', 'Sekretarya'],
    ['Leçons & Ressources Bibliques', 'Leson & Resous Biblik'],
    ['École du Dimanche', 'Lekòl Dimanch'],
    ['Grand Culte d’Adoration', 'Gran Kil Adorasyon'],
    ['Grand Culte d\'Adoration', 'Gran Kil Adorasyon'],
    ['Réunion de Prière & Intercession', 'Reyinyon Lapriyè & Entècesyon'],
    ['Étude Biblique & Sanctification', 'Etid Biblik & Sanktifikasyon'],
    ['Rassemblement de la Jeunesse (JNI)', 'Rasanbleman Jèn yo (JNI)'],
    ['Horaires des Cultes', 'Orè Kil yo'],
    ['Ajouter à mon Google Calendar', 'Mete sou Google Calendar mwen'],
    ['Espas Priyè Sekrè', 'Espas Priyè Sekrè'],
    ['Nous contacter', 'Kontakte nou'],
    ['Tous droits réservés', 'Tout dwa rezève'],
    ['Sainteté à l’Éternel', 'Sentite pou Letènèl'],
    ['Sainteté à l\'Éternel', 'Sentite pou Letènèl'],
    ['Ouvrir sur Google Maps', 'Ouvri nan Google Maps'],
    ['Envoyer le Message', 'Voye Mesaj la'],
    ['Télécharger', 'Telechaje'],
    ['Partager', 'Pataje']
  ],
  es: [
    ['Accueil', 'Inicio'],
    ['À Propos', 'Acerca de'],
    ['Ministères', 'Ministerios'],
    ['Événements & Cultes', 'Eventos y Cultos'],
    ['Événements', 'Eventos'],
    ['Requêtes de Prière', 'Peticiones de Oración'],
    ['Priyè / Prière', 'Oración Secreta'],
    ['Projets (CDEJ)', 'Proyectos (CDEJ)'],
    ['Médias & Prédications', 'Medios y Prédicas'],
    ['Jeux Bibliques', 'Juegos Bíblicos'],
    ['Contact', 'Contacto'],
    ['Secrétariat', 'Secretaría'],
    ['Leçons & Ressources Bibliques', 'Lecciones y Recursos Bíblicos'],
    ['École du Dimanche', 'Escuela Dominical'],
    ['Grand Culte d’Adoration', 'Gran Culto de Adoración'],
    ['Grand Culte d\'Adoration', 'Gran Culto de Adoración'],
    ['Réunion de Prière & Intercession', 'Reunión de Oración e Intercesión'],
    ['Étude Biblique & Sanctification', 'Estudio Bíblico y Santificación'],
    ['Rassemblement de la Jeunesse (JNI)', 'Reunión de Jóvenes (JNI)'],
    ['Horaires des Cultes', 'Horarios de Cultos'],
    ['Ajouter à mon Google Calendar', 'Añadir a mi Google Calendar'],
    ['Espas Priyè Sekrè', 'Espacio de Oración Secreta'],
    ['Nous contacter', 'Contáctenos'],
    ['Tous droits réservés', 'Todos los derechos reservados'],
    ['Sainteté à l’Éternel', 'Santidad a Jehová'],
    ['Sainteté à l\'Éternel', 'Santidad a Jehová'],
    ['Ouvrir sur Google Maps', 'Abrir en Google Maps'],
    ['Envoyer le Message', 'Enviar mensaje'],
    ['Télécharger', 'Descargar'],
    ['Partager', 'Compartir']
  ],
  en: [
    ['Accueil', 'Home'],
    ['À Propos', 'About Us'],
    ['Ministères', 'Ministries'],
    ['Événements & Cultes', 'Events & Services'],
    ['Événements', 'Events'],
    ['Requêtes de Prière', 'Prayer Requests'],
    ['Priyè / Prière', 'Secret Prayer'],
    ['Projets (CDEJ)', 'Projects (CDEJ)'],
    ['Médias & Prédications', 'Media & Sermons'],
    ['Jeux Bibliques', 'Bible Games'],
    ['Contact', 'Contact'],
    ['Secrétariat', 'Secretariat'],
    ['Leçons & Ressources Bibliques', 'Sunday School & Bible Lessons'],
    ['École du Dimanche', 'Sunday School'],
    ['Grand Culte d’Adoration', 'Main Worship Service'],
    ['Grand Culte d\'Adoration', 'Main Worship Service'],
    ['Réunion de Prière & Intercession', 'Prayer & Intercession Meeting'],
    ['Étude Biblique & Sanctification', 'Bible Study & Holiness'],
    ['Rassemblement de la Jeunesse (JNI)', 'Nazarene Youth Gathering (NYI)'],
    ['Horaires des Cultes', 'Service Schedule'],
    ['Ajouter à mon Google Calendar', 'Add to Google Calendar'],
    ['Espas Priyè Sekrè', 'Confidential Prayer Space'],
    ['Nous contacter', 'Contact Us'],
    ['Tous droits réservés', 'All rights reserved'],
    ['Sainteté à l’Éternel', 'Holiness unto the Lord'],
    ['Sainteté à l\'Éternel', 'Holiness unto the Lord'],
    ['Ouvrir sur Google Maps', 'Open in Google Maps'],
    ['Envoyer le Message', 'Send Message'],
    ['Télécharger', 'Download'],
    ['Partager', 'Share']
  ],
  fr: [
    ['Akèy', 'Accueil'],
    ['Sentite pou Letènèl', 'Sainteté à l’Éternel']
  ]
};

interface LanguageContextType {
  currentLang: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, defaultText?: string) => string;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType>({
  currentLang: 'fr',
  setLanguage: () => {},
  t: (key, defaultText) => defaultText || key,
  languages: SUPPORTED_LANGUAGES,
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLangState] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dame_selected_lang') as LanguageCode;
      if (saved && ['ht', 'fr', 'es', 'en'].includes(saved)) {
        return saved;
      }
    }
    return 'fr';
  });

  const translateDOM = (lang: LanguageCode) => {
    if (typeof window === 'undefined') return;
    const rules = DOM_PHRASE_DICTIONARY[lang];
    if (lang !== 'fr' && (!rules || rules.length === 0)) return;

    const root = document.getElementById('root');
    if (!root) return;

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          if (['script', 'style', 'input', 'textarea', 'code', 'pre'].includes(tag)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let currentNode: Node | null = walker.nextNode();
    while (currentNode) {
      const originalText = (currentNode as any).__origText || currentNode.nodeValue;
      if (!(currentNode as any).__origText && originalText) {
        (currentNode as any).__origText = originalText;
      }

      // Si la langue sélectionnée est le français (langue native du site), restaurer le texte original
      if (lang === 'fr') {
        if ((currentNode as any).__origText && currentNode.nodeValue !== (currentNode as any).__origText) {
          currentNode.nodeValue = (currentNode as any).__origText;
        }
        currentNode = walker.nextNode();
        continue;
      }

      let translated = (currentNode as any).__origText || originalText || '';
      if (rules) {
        for (const [from, to] of rules) {
          if (typeof from === 'string') {
            if (translated.includes(from)) {
              translated = translated.split(from).join(to);
            }
          } else {
            translated = translated.replace(from, to);
          }
        }
      }

      if (translated !== currentNode.nodeValue) {
        currentNode.nodeValue = translated;
      }

      currentNode = walker.nextNode();
    }
  };


  const setLanguage = (lang: LanguageCode) => {
    setCurrentLangState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dame_selected_lang', lang);
      document.documentElement.lang = lang;

      // Google Translate cookie setting
      const domain = window.location.hostname;
      document.cookie = `googtrans=/fr/${lang}; path=/;`;
      document.cookie = `googtrans=/fr/${lang}; path=/; domain=${domain}`;

      // Trigger translate on DOM nodes
      setTimeout(() => translateDOM(lang), 50);

      // Attempt Google Translate combo trigger if available
      try {
        const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (combo) {
          combo.value = lang;
          combo.dispatchEvent(new Event('change'));
        }
      } catch (e) {
        console.warn('Google translate combo sync error:', e);
      }

      window.dispatchEvent(new CustomEvent('church-language-changed', { detail: { lang } }));
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.lang = currentLang;
    setTimeout(() => translateDOM(currentLang), 100);

    // Injection script Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'fr',
            includedLanguages: 'ht,fr,es,en',
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [currentLang]);

  const t = (key: string, defaultText?: string): string => {
    const langDict = TRANSLATIONS[currentLang];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const fallbackFr = TRANSLATIONS['fr'][key];
    if (fallbackFr) return fallbackFr;
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLang, setLanguage, t, languages: SUPPORTED_LANGUAGES }}>
      <div id="google_translate_element" style={{ display: 'none' }} aria-hidden="true" />
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
