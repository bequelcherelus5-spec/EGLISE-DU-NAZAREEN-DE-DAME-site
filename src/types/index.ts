export interface ChurchInfo {
  name: string;
  motto: string;
  foundedYear: number;
  founder: string;
  seniorPastor: string;
  pastorSince: number;
  phone: string;
  email: string;
  website: string;
  canonicalUrl: string;
  address: {
    section: string;
    commune: string;
    department: string;
    country: string;
    full: string;
  };
  social: {
    youtube: string;
    facebook: string;
  };
  googleMapsUrl?: string;
}

export interface Ministry {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  leader: string;
  schedule: string;
  sundayAssignment?: string;
  sundayNumber?: number;
  verse: string;
  iconName: string;
  image: string;
}

export interface ChurchEvent {
  id: string;
  title: string;
  category: 'culte' | 'jeunesse' | 'priere' | 'conference' | 'formation' | 'social';
  day: string;
  time: string;
  location: string;
  description: string;
  isRecurrent: boolean;
  date?: string;
  image?: string;
}

export interface ProjectImpact {
  id: string;
  code: string;
  title: string;
  partner: string;
  category: string;
  summary: string;
  fullDescription: string;
  status: 'active' | 'completed' | 'planning';
  targetBeneficiaries: number;
  reachedBeneficiaries: number;
  location: string;
  bannerImage: string;
  metrics: {
    label: string;
    value: string | number;
    icon: string;
  }[];
  pillars: {
    title: string;
    desc: string;
  }[];
}

export interface MediaItem {
  id: string;
  title: string;
  type: 'sermon_audio' | 'sermon_video' | 'podcast' | 'gallery_photo';
  speaker?: string;
  reference?: string;
  date: string;
  url: string;
  thumbnail: string;
  duration?: string;
  category?: string;
  description?: string;
}

export interface ChurchPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  category: string;
  ministryTag?: string;
  status: 'published' | 'draft';
  image?: string;
}

export interface MemberRecord {
  id: string;
  regNumber: string;
  fullName: string;
  gender: 'M' | 'F';
  phone: string;
  email?: string;
  address: string;
  baptismDate?: string;
  ministryAffiliation: string;
  status: 'actif' | 'inactif' | 'transfere';
  joinedDate: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  subscribedAt: string;
  brevoContactId?: number | null;
}

export interface NewsletterCampaign {
  id: string;
  title: string;
  subject: string;
  contentHtml: string;
  status: 'draft' | 'sent' | 'scheduled';
  sentBy: string;
  sentAt?: string;
  sentCount: number;
  brevoCampaignId?: number;
}

export interface BrevoConfigView {
  hasApiKey: boolean;
  apiKeyPreview: string;
  senderEmail: string;
  senderName: string;
  brevoListId: string;
  isActive: boolean;
  updatedAt: string;
}

export interface BibleQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  reference: string;
  explanation: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
}

export interface HighScore {
  id: string;
  playerName: string;
  score: number;
  total: number;
  percentage: number;
  date: string;
  mode: string;
}

export interface ManagedProject {
  id: string;
  title: string;
  code?: string;
  partner?: string;
  category: string;
  description: string;
  htmlContent?: string;
  images: string[];
  author: string;
  createdAt: string;
  updatedAt?: string;
  status: 'draft' | 'published';
  targetAmount?: string;
  currentAmount?: string;
  beneficiariesCount?: number;
  _syncWarning?: string;
  _source?: 'supabase' | 'local';
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  htmlContent?: string;
  featuredImage?: string;
  isActive: boolean;
  showInMenu?: boolean;
  menuOrder?: number;
  author: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PrayerRequest {
  id: string;
  category: string;
  fullName?: string;
  isAnonymous: boolean;
  phone?: string;
  email?: string;
  message: string;
  isUrgent: boolean;
  pastorOnly: boolean;
  createdAt: string;
  status: 'pending' | 'prayed';
  notes?: string;
}
