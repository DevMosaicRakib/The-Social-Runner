import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation keys and values
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.findEvents': 'Find Events',
    'nav.createEvent': 'Create Event',
    'nav.myEvents': 'My Events',
    'nav.news': 'News',
    'nav.notifications': 'Notifications',
    'nav.profile': 'Profile',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',
    'nav.logout': 'Logout',
    
    // Home page
    'home.title': 'Find Your Running Community',
    'home.subtitle': 'Discover local running events and connect with fellow runners in your area through The Social Runner.',
    'home.discoverEvents': 'Discover Events Near You',
    'home.discoverSubtitle': 'Find running events happening in your area with interactive map search',
    'home.upcomingEvents': 'Upcoming Events',
    'home.list': 'List',
    'home.map': 'Map',
    'home.noEvents': 'No events found',
    
    // Event card
    'event.participants': 'participants',
    'event.joinEvent': 'Join Event',
    'event.eventFull': 'Event Full',
    'event.viewDetails': 'View Details',
    
    // Profile
    'profile.personalInfo': 'Personal Information',
    'profile.runningPreferences': 'Running Preferences',
    'profile.progress': 'Progress',
    'profile.updateProfile': 'Update Profile',
    
    // About page
    'about.title': 'Born from a Runner\'s Journey',
    'about.subtitle': 'The Social Runner started with one person\'s struggle to find their place in the running community',
    'about.getInTouch': 'Get in Touch',
    'about.contactMessage': 'Have questions, suggestions, or want to share your running story? We\'d love to hear from you!',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.submit': 'Submit',
    'common.close': 'Close',
    'common.yes': 'Yes',
    'common.no': 'No',
    
    // Language selector
    'language.select': 'Language',
    'language.english': 'English',
    'language.spanish': 'Español',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.italian': 'Italiano',
    'language.portuguese': 'Português',
    'language.chinese': '中文',
    'language.japanese': '日本語',
  },
  es: {
    // Navigation
    'nav.findEvents': 'Buscar Eventos',
    'nav.createEvent': 'Crear Evento',
    'nav.myEvents': 'Mis Eventos',
    'nav.news': 'Noticias',
    'nav.notifications': 'Notificaciones',
    'nav.profile': 'Perfil',
    'nav.about': 'Acerca de',
    'nav.contact': 'Contacto',
    'nav.logout': 'Cerrar Sesión',
    
    // Home page
    'home.title': 'Encuentra Tu Comunidad de Running',
    'home.subtitle': 'Descubre eventos locales de running y conecta con otros corredores en tu área.',
    'home.discoverEvents': 'Descubre Eventos Cerca de Ti',
    'home.discoverSubtitle': 'Encuentra eventos de running en tu área con búsqueda interactiva en mapa',
    'home.upcomingEvents': 'Próximos Eventos',
    'home.list': 'Lista',
    'home.map': 'Mapa',
    'home.noEvents': 'No se encontraron eventos',
    
    // Event card
    'event.participants': 'participantes',
    'event.joinEvent': 'Unirse al Evento',
    'event.eventFull': 'Evento Lleno',
    'event.viewDetails': 'Ver Detalles',
    
    // Profile
    'profile.personalInfo': 'Información Personal',
    'profile.runningPreferences': 'Preferencias de Running',
    'profile.progress': 'Progreso',
    'profile.updateProfile': 'Actualizar Perfil',
    
    // About page
    'about.title': 'Nacido del Viaje de un Corredor',
    'about.subtitle': 'The Social Runner comenzó con la lucha de una persona por encontrar su lugar en la comunidad de running',
    'about.getInTouch': 'Ponte en Contacto',
    'about.contactMessage': '¿Tienes preguntas, sugerencias o quieres compartir tu historia de running? ¡Nos encantaría escucharte!',
    
    // Common
    'common.loading': 'Cargando...',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.submit': 'Enviar',
    'common.close': 'Cerrar',
    'common.yes': 'Sí',
    'common.no': 'No',
    
    // Language selector
    'language.select': 'Idioma',
    'language.english': 'English',
    'language.spanish': 'Español',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.italian': 'Italiano',
    'language.portuguese': 'Português',
    'language.chinese': '中文',
    'language.japanese': '日本語',
  },
  fr: {
    // Navigation
    'nav.findEvents': 'Trouver des Événements',
    'nav.createEvent': 'Créer un Événement',
    'nav.myEvents': 'Mes Événements',
    'nav.news': 'Actualités',
    'nav.notifications': 'Notifications',
    'nav.profile': 'Profil',
    'nav.about': 'À Propos',
    'nav.contact': 'Contact',
    'nav.logout': 'Déconnexion',
    
    // Home page
    'home.title': 'Trouvez Votre Communauté de Course',
    'home.subtitle': 'Découvrez des événements de course locaux et connectez-vous avec d\'autres coureurs dans votre région.',
    'home.discoverEvents': 'Découvrez des Événements Près de Vous',
    'home.discoverSubtitle': 'Trouvez des événements de course dans votre région avec une recherche interactive sur carte',
    'home.upcomingEvents': 'Événements à Venir',
    'home.list': 'Liste',
    'home.map': 'Carte',
    'home.noEvents': 'Aucun événement trouvé',
    
    // Event card
    'event.participants': 'participants',
    'event.joinEvent': 'Rejoindre l\'Événement',
    'event.eventFull': 'Événement Complet',
    'event.viewDetails': 'Voir les Détails',
    
    // Profile
    'profile.personalInfo': 'Informations Personnelles',
    'profile.runningPreferences': 'Préférences de Course',
    'profile.progress': 'Progrès',
    'profile.updateProfile': 'Mettre à Jour le Profil',
    
    // About page
    'about.title': 'Né du Parcours d\'un Coureur',
    'about.subtitle': 'The Social Runner a commencé avec la lutte d\'une personne pour trouver sa place dans la communauté de course',
    'about.getInTouch': 'Contactez-nous',
    'about.contactMessage': 'Vous avez des questions, des suggestions ou voulez partager votre histoire de course ? Nous aimerions vous entendre !',
    
    // Common
    'common.loading': 'Chargement...',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.submit': 'Soumettre',
    'common.close': 'Fermer',
    'common.yes': 'Oui',
    'common.no': 'Non',
    
    // Language selector
    'language.select': 'Langue',
    'language.english': 'English',
    'language.spanish': 'Español',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.italian': 'Italiano',
    'language.portuguese': 'Português',
    'language.chinese': '中文',
    'language.japanese': '日本語',
  },
  de: {
    // Navigation
    'nav.findEvents': 'Events Finden',
    'nav.createEvent': 'Event Erstellen',
    'nav.myEvents': 'Meine Events',
    'nav.news': 'Nachrichten',
    'nav.notifications': 'Benachrichtigungen',
    'nav.profile': 'Profil',
    'nav.about': 'Über Uns',
    'nav.contact': 'Kontakt',
    'nav.logout': 'Abmelden',
    
    // Home page
    'home.title': 'Finde Deine Lauf-Community',
    'home.subtitle': 'Entdecke lokale Laufveranstaltungen und verbinde dich mit anderen Läufern in deiner Gegend.',
    'home.discoverEvents': 'Entdecke Events in Deiner Nähe',
    'home.discoverSubtitle': 'Finde Laufveranstaltungen in deiner Gegend mit interaktiver Kartensuche',
    'home.upcomingEvents': 'Kommende Events',
    'home.list': 'Liste',
    'home.map': 'Karte',
    'home.noEvents': 'Keine Events gefunden',
    
    // Event card
    'event.participants': 'Teilnehmer',
    'event.joinEvent': 'Event Beitreten',
    'event.eventFull': 'Event Voll',
    'event.viewDetails': 'Details Anzeigen',
    
    // Profile
    'profile.personalInfo': 'Persönliche Informationen',
    'profile.runningPreferences': 'Lauf-Präferenzen',
    'profile.progress': 'Fortschritt',
    'profile.updateProfile': 'Profil Aktualisieren',
    
    // About page
    'about.title': 'Geboren aus der Reise eines Läufers',
    'about.subtitle': 'The Social Runner begann mit dem Kampf einer Person, ihren Platz in der Lauf-Community zu finden',
    'about.getInTouch': 'Kontaktieren Sie Uns',
    'about.contactMessage': 'Haben Sie Fragen, Vorschläge oder möchten Ihre Laufgeschichte teilen? Wir würden gerne von Ihnen hören!',
    
    // Common
    'common.loading': 'Laden...',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.edit': 'Bearbeiten',
    'common.delete': 'Löschen',
    'common.submit': 'Senden',
    'common.close': 'Schließen',
    'common.yes': 'Ja',
    'common.no': 'Nein',
    
    // Language selector
    'language.select': 'Sprache',
    'language.english': 'English',
    'language.spanish': 'Español',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.italian': 'Italiano',
    'language.portuguese': 'Português',
    'language.chinese': '中文',
    'language.japanese': '日本語',
  },
  it: {
    // Navigation
    'nav.findEvents': 'Trova Eventi',
    'nav.createEvent': 'Crea Evento',
    'nav.myEvents': 'I Miei Eventi',
    'nav.news': 'Notizie',
    'nav.notifications': 'Notifiche',
    'nav.profile': 'Profilo',
    'nav.about': 'Chi Siamo',
    'nav.contact': 'Contatto',
    'nav.logout': 'Disconnetti',
    
    // Home page
    'home.title': 'Trova la Tua Comunità di Corsa',
    'home.subtitle': 'Scopri eventi di corsa locali e connettiti con altri corridori nella tua zona.',
    'home.discoverEvents': 'Scopri Eventi Vicino a Te',
    'home.discoverSubtitle': 'Trova eventi di corsa nella tua zona con ricerca interattiva sulla mappa',
    'home.upcomingEvents': 'Prossimi Eventi',
    'home.list': 'Lista',
    'home.map': 'Mappa',
    'home.noEvents': 'Nessun evento trovato',
    
    // Event card
    'event.participants': 'partecipanti',
    'event.joinEvent': 'Unisciti all\'Evento',
    'event.eventFull': 'Evento Completo',
    'event.viewDetails': 'Vedi Dettagli',
    
    // Profile
    'profile.personalInfo': 'Informazioni Personali',
    'profile.runningPreferences': 'Preferenze di Corsa',
    'profile.progress': 'Progressi',
    'profile.updateProfile': 'Aggiorna Profilo',
    
    // About page
    'about.title': 'Nato dal Viaggio di un Corridore',
    'about.subtitle': 'The Social Runner è iniziato con la lotta di una persona per trovare il proprio posto nella comunità di corsa',
    'about.getInTouch': 'Contattaci',
    'about.contactMessage': 'Hai domande, suggerimenti o vuoi condividere la tua storia di corsa? Ci piacerebbe sentirti!',
    
    // Common
    'common.loading': 'Caricamento...',
    'common.save': 'Salva',
    'common.cancel': 'Annulla',
    'common.edit': 'Modifica',
    'common.delete': 'Elimina',
    'common.submit': 'Invia',
    'common.close': 'Chiudi',
    'common.yes': 'Sì',
    'common.no': 'No',
    
    // Language selector
    'language.select': 'Lingua',
    'language.english': 'English',
    'language.spanish': 'Español',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.italian': 'Italiano',
    'language.portuguese': 'Português',
    'language.chinese': '中文',
    'language.japanese': '日本語',
  },
  pt: {
    // Navigation
    'nav.findEvents': 'Encontrar Eventos',
    'nav.createEvent': 'Criar Evento',
    'nav.myEvents': 'Meus Eventos',
    'nav.news': 'Notícias',
    'nav.notifications': 'Notificações',
    'nav.profile': 'Perfil',
    'nav.about': 'Sobre Nós',
    'nav.contact': 'Contato',
    'nav.logout': 'Sair',
    
    // Home page
    'home.title': 'Encontre Sua Comunidade de Corrida',
    'home.subtitle': 'Descubra eventos de corrida locais e conecte-se com outros corredores em sua área.',
    'home.discoverEvents': 'Descubra Eventos Perto de Você',
    'home.discoverSubtitle': 'Encontre eventos de corrida em sua área com busca interativa no mapa',
    'home.upcomingEvents': 'Próximos Eventos',
    'home.list': 'Lista',
    'home.map': 'Mapa',
    'home.noEvents': 'Nenhum evento encontrado',
    
    // Event card
    'event.participants': 'participantes',
    'event.joinEvent': 'Participar do Evento',
    'event.eventFull': 'Evento Lotado',
    'event.viewDetails': 'Ver Detalhes',
    
    // Profile
    'profile.personalInfo': 'Informações Pessoais',
    'profile.runningPreferences': 'Preferências de Corrida',
    'profile.progress': 'Progresso',
    'profile.updateProfile': 'Atualizar Perfil',
    
    // About page
    'about.title': 'Nascido da Jornada de um Corredor',
    'about.subtitle': 'The Social Runner começou com a luta de uma pessoa para encontrar seu lugar na comunidade de corrida',
    'about.getInTouch': 'Entre em Contato',
    'about.contactMessage': 'Tem perguntas, sugestões ou quer compartilhar sua história de corrida? Adoraríamos ouvir você!',
    
    // Common
    'common.loading': 'Carregando...',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.edit': 'Editar',
    'common.delete': 'Excluir',
    'common.submit': 'Enviar',
    'common.close': 'Fechar',
    'common.yes': 'Sim',
    'common.no': 'Não',
    
    // Language selector
    'language.select': 'Idioma',
    'language.english': 'English',
    'language.spanish': 'Español',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.italian': 'Italiano',
    'language.portuguese': 'Português',
    'language.chinese': '中文',
    'language.japanese': '日本語',
  },
  zh: {
    // Navigation
    'nav.findEvents': '查找活动',
    'nav.createEvent': '创建活动',
    'nav.myEvents': '我的活动',
    'nav.news': '新闻',
    'nav.notifications': '通知',
    'nav.profile': '个人资料',
    'nav.about': '关于我们',
    'nav.contact': '联系我们',
    'nav.logout': '退出登录',
    
    // Home page
    'home.title': '找到您的跑步社区',
    'home.subtitle': '发现本地跑步活动，与您所在地区的跑步爱好者建立联系。',
    'home.discoverEvents': '发现您附近的活动',
    'home.discoverSubtitle': '通过互动地图搜索在您的地区找到跑步活动',
    'home.upcomingEvents': '即将举行的活动',
    'home.list': '列表',
    'home.map': '地图',
    'home.noEvents': '未找到活动',
    
    // Event card
    'event.participants': '参与者',
    'event.joinEvent': '加入活动',
    'event.eventFull': '活动已满',
    'event.viewDetails': '查看详情',
    
    // Profile
    'profile.personalInfo': '个人信息',
    'profile.runningPreferences': '跑步偏好',
    'profile.progress': '进度',
    'profile.updateProfile': '更新个人资料',
    
    // About page
    'about.title': '诞生于跑者的旅程',
    'about.subtitle': 'The Social Runner 始于一个人在跑步社区中寻找归属感的努力',
    'about.getInTouch': '联系我们',
    'about.contactMessage': '有问题、建议或想分享您的跑步故事吗？我们很乐意听到您的声音！',
    
    // Common
    'common.loading': '加载中...',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.edit': '编辑',
    'common.delete': '删除',
    'common.submit': '提交',
    'common.close': '关闭',
    'common.yes': '是',
    'common.no': '否',
    
    // Language selector
    'language.select': '语言',
    'language.english': 'English',
    'language.spanish': 'Español',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.italian': 'Italiano',
    'language.portuguese': 'Português',
    'language.chinese': '中文',
    'language.japanese': '日本語',
  },
  ja: {
    // Navigation
    'nav.findEvents': 'イベントを探す',
    'nav.createEvent': 'イベントを作成',
    'nav.myEvents': 'マイイベント',
    'nav.news': 'ニュース',
    'nav.notifications': '通知',
    'nav.profile': 'プロフィール',
    'nav.about': '私たちについて',
    'nav.contact': 'お問い合わせ',
    'nav.logout': 'ログアウト',
    
    // Home page
    'home.title': 'あなたのランニングコミュニティを見つけよう',
    'home.subtitle': '地域のランニングイベントを発見し、あなたの地域の仲間のランナーとつながりましょう。',
    'home.discoverEvents': 'お近くのイベントを発見',
    'home.discoverSubtitle': 'インタラクティブマップ検索であなたの地域のランニングイベントを見つけましょう',
    'home.upcomingEvents': '今後のイベント',
    'home.list': 'リスト',
    'home.map': 'マップ',
    'home.noEvents': 'イベントが見つかりません',
    
    // Event card
    'event.participants': '参加者',
    'event.joinEvent': 'イベントに参加',
    'event.eventFull': 'イベント満員',
    'event.viewDetails': '詳細を見る',
    
    // Profile
    'profile.personalInfo': '個人情報',
    'profile.runningPreferences': 'ランニング設定',
    'profile.progress': '進捗',
    'profile.updateProfile': 'プロフィールを更新',
    
    // About page
    'about.title': 'ランナーの旅から生まれた',
    'about.subtitle': 'The Social Runnerは、ランニングコミュニティで自分の居場所を見つけるのに苦労した一人の人から始まりました',
    'about.getInTouch': 'お問い合わせ',
    'about.contactMessage': 'ご質問、ご提案、またはあなたのランニングストーリーを共有したいですか？ぜひお聞かせください！',
    
    // Common
    'common.loading': '読み込み中...',
    'common.save': '保存',
    'common.cancel': 'キャンセル',
    'common.edit': '編集',
    'common.delete': '削除',
    'common.submit': '送信',
    'common.close': '閉じる',
    'common.yes': 'はい',
    'common.no': 'いいえ',
    
    // Language selector
    'language.select': '言語',
    'language.english': 'English',
    'language.spanish': 'Español',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.italian': 'Italiano',
    'language.portuguese': 'Português',
    'language.chinese': '中文',
    'language.japanese': '日本語',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') as Language;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0] as Language;
      if (translations[browserLang]) {
        setLanguageState(browserLang);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferred-language', lang);
  };

  const t = (key: string): string => {
    const translation = translations[language]?.[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      return translations['en'][key] || key;
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}