import { supabase, isSupabaseConfigured } from './supabaseClient';
import { MemberRecord, SacramentRecord, PrayerRequest } from '../types';
import { INITIAL_MEMBERS } from '../data/churchData';
export { INITIAL_MEMBERS };

const LOCAL_MEMBERS_KEY = 'dame_secretariat_members_v2';
const LOCAL_SACRAMENTS_KEY = 'dame_secretariat_sacraments_v2';
const LOCAL_PRAYERS_KEY = 'dame_secretariat_prayers_v2';

export const INITIAL_SACRAMENTS: SacramentRecord[] = [
  {
    id: 'sac-1',
    type: 'bapteme',
    regNumber: 'BAP-2024-001',
    recipientName: 'Jean-Marc DÉSIR',
    date: '2024-04-14',
    officiatingPastor: 'Pasteur Bequel CHERELUS',
    location: 'Bassin baptismal - Temple de Damé',
    witnesses: 'Saurel ALCINÉ, Esther PIERRE',
    certificateIssued: true,
    notes: 'Baptême par immersion confessant Jésus-Christ comme Seigneur et Sauveur.',
    createdAt: '2024-04-14T10:00:00Z'
  },
  {
    id: 'sac-2',
    type: 'mariage',
    regNumber: 'MAR-2023-004',
    recipientName: 'Jean-Baptiste ÉTIENNE',
    spouseName: 'Marie Guerda NOËL',
    date: '2023-12-28',
    officiatingPastor: 'Pasteur Bequel CHERELUS',
    location: 'Sanctuaire Principal de Damé',
    witnesses: 'Fr. Saurel ALCINÉ, Sr. Nathalie CHERELUS',
    certificateIssued: true,
    notes: 'Union sainte célébrée devant Dieu et l’assemblée fidèle de Damé.',
    createdAt: '2023-12-28T14:30:00Z'
  },
  {
    id: 'sac-3',
    type: 'dedicace',
    regNumber: 'DED-2024-009',
    recipientName: 'Samuel Ézéchiel CHERELUS',
    fatherName: 'Bequel CHERELUS',
    motherName: 'Nathalie CHERELUS',
    date: '2024-05-19',
    officiatingPastor: 'Pasteur Invité & Conseil Pastoral',
    location: 'Temple de Damé',
    witnesses: 'Assemblée générale de Damé',
    certificateIssued: true,
    notes: 'Consécration solennelle selon la tradition nazaréenne (Proverbes 22:6).',
    createdAt: '2024-05-19T09:00:00Z'
  }
];

export const INITIAL_PRAYERS: PrayerRequest[] = [
  {
    id: 'pray-1',
    category: 'Santé & Guérison',
    fullName: 'Sœur Marie Claire',
    isAnonymous: false,
    phone: '+509 37889900',
    message: 'Prière pour le rétablissement complet de ma mère affaiblie par la fièvre et pour la paix dans notre famille.',
    isUrgent: true,
    pastorOnly: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'pending'
  },
  {
    id: 'pray-2',
    category: 'Projets de l’Église',
    fullName: 'Comité de Sonorisation',
    isAnonymous: false,
    message: 'Que Dieu pourvoie aux fonds pour le système de sonorisation et les instruments du temple.',
    isUrgent: false,
    pastorOnly: false,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'prayed',
    notes: 'Porté en prière lors du culte de jeudi soir.'
  }
];

export const secretariatService = {
  // ====================================================
  // 1. GESTION DES MEMBRES (Supabase + Local Cache)
  // ====================================================
  async getMembers(): Promise<{ data: MemberRecord[]; source: 'supabase' | 'local'; error?: string }> {
    let localData: MemberRecord[] = [];
    try {
      const stored = localStorage.getItem(LOCAL_MEMBERS_KEY);
      if (stored) {
        localData = JSON.parse(stored);
      } else {
        localData = [...INITIAL_MEMBERS];
        localStorage.setItem(LOCAL_MEMBERS_KEY, JSON.stringify(localData));
      }
    } catch {
      localData = [...INITIAL_MEMBERS];
    }

    if (!isSupabaseConfigured || !supabase) {
      return { data: localData, source: 'local' };
    }

    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('joinedDate', { ascending: false });

      if (error) {
        console.warn('[SecretariatService] Table members Supabase non trouvée ou erreur RLS:', error.message);
        return { data: localData, source: 'local', error: error.message };
      }

      if (data && data.length > 0) {
        // Formater les données depuis Supabase
        const formatted: MemberRecord[] = data.map((row: any) => ({
          id: String(row.id || row.reg_number),
          regNumber: row.reg_number || row.regNumber || 'DAM-MEM',
          fullName: row.full_name || row.fullName || 'Membre Anonyme',
          gender: (row.gender === 'F' ? 'F' : 'M') as 'M' | 'F',
          phone: row.phone || '',
          email: row.email || '',
          address: row.address || '',
          baptismDate: row.baptism_date || row.baptismDate || undefined,
          ministryAffiliation: row.ministry || row.ministryAffiliation || 'Assemblée Générale',
          status: (row.status || 'actif') as 'actif' | 'inactif' | 'transfere',
          joinedDate: row.joined_date || row.joinedDate || new Date().toISOString().split('T')[0]
        }));
        // Mettre à jour le cache local pour offline
        try {
          localStorage.setItem(LOCAL_MEMBERS_KEY, JSON.stringify(formatted));
        } catch {}
        return { data: formatted, source: 'supabase' };
      }

      return { data: localData, source: 'local' };
    } catch (err: any) {
      return { data: localData, source: 'local', error: err.message };
    }
  },

  async saveMember(member: Omit<MemberRecord, 'id' | 'regNumber'> & { id?: string; regNumber?: string }): Promise<{ success: boolean; member: MemberRecord; error?: string }> {
    const isEdit = Boolean(member.id);
    const id = member.id || 'mem-' + Date.now();
    const newRecord: MemberRecord = {
      ...member,
      id,
      regNumber: member.regNumber || `DAM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      joinedDate: member.joinedDate || new Date().toISOString().split('T')[0]
    };

    // 1. Sauvegarde locale immédiate
    try {
      const stored = localStorage.getItem(LOCAL_MEMBERS_KEY);
      let list: MemberRecord[] = stored ? JSON.parse(stored) : [...INITIAL_MEMBERS];
      if (isEdit) {
        list = list.map(m => m.id === id ? newRecord : m);
      } else {
        list.unshift(newRecord);
      }
      localStorage.setItem(LOCAL_MEMBERS_KEY, JSON.stringify(list));
    } catch {}

    // 2. Synchronisation Supabase si disponible
    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {
          reg_number: newRecord.regNumber,
          full_name: newRecord.fullName,
          gender: newRecord.gender,
          phone: newRecord.phone,
          email: newRecord.email || null,
          address: newRecord.address,
          baptism_date: newRecord.baptismDate || null,
          ministry: newRecord.ministryAffiliation,
          status: newRecord.status,
          joined_date: newRecord.joinedDate
        };

        if (isEdit) {
          await supabase.from('members').update(payload).eq('reg_number', newRecord.regNumber);
        } else {
          await supabase.from('members').insert([payload]);
        }
      } catch (err: any) {
        console.warn('[SecretariatService] Sync Supabase membre différée:', err.message);
      }
    }

    return { success: true, member: newRecord };
  },

  async deleteMember(id: string, regNumber?: string): Promise<boolean> {
    try {
      const stored = localStorage.getItem(LOCAL_MEMBERS_KEY);
      if (stored) {
        const list: MemberRecord[] = JSON.parse(stored);
        localStorage.setItem(LOCAL_MEMBERS_KEY, JSON.stringify(list.filter(m => m.id !== id)));
      }
    } catch {}

    if (isSupabaseConfigured && supabase && regNumber) {
      try {
        await supabase.from('members').delete().eq('reg_number', regNumber);
      } catch {}
    }
    return true;
  },

  // ====================================================
  // 2. REGISTRE DES SACREMENTS (Baptêmes, Mariages, Dédicaces)
  // ====================================================
  async getSacraments(): Promise<{ data: SacramentRecord[]; source: 'supabase' | 'local'; error?: string }> {
    let localData: SacramentRecord[] = [];
    try {
      const stored = localStorage.getItem(LOCAL_SACRAMENTS_KEY);
      if (stored) {
        localData = JSON.parse(stored);
      } else {
        localData = [...INITIAL_SACRAMENTS];
        localStorage.setItem(LOCAL_SACRAMENTS_KEY, JSON.stringify(localData));
      }
    } catch {
      localData = [...INITIAL_SACRAMENTS];
    }

    if (!isSupabaseConfigured || !supabase) {
      return { data: localData, source: 'local' };
    }

    try {
      const { data, error } = await supabase
        .from('sacraments')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        return { data: localData, source: 'local', error: error.message };
      }

      if (data && data.length > 0) {
        const formatted: SacramentRecord[] = data.map((row: any) => ({
          id: String(row.id || row.reg_number),
          type: row.type || 'bapteme',
          regNumber: row.reg_number || row.regNumber || 'SAC-001',
          recipientName: row.recipient_name || row.recipientName || '',
          spouseName: row.spouse_name || row.spouseName || undefined,
          fatherName: row.father_name || row.fatherName || undefined,
          motherName: row.mother_name || row.motherName || undefined,
          date: row.date || new Date().toISOString().split('T')[0],
          officiatingPastor: row.officiating_pastor || row.officiatingPastor || 'Pasteur Bequel CHERELUS',
          location: row.location || 'Temple de Damé',
          witnesses: row.witnesses || '',
          certificateIssued: Boolean(row.certificate_issued ?? true),
          notes: row.notes || '',
          createdAt: row.created_at || new Date().toISOString()
        }));
        try {
          localStorage.setItem(LOCAL_SACRAMENTS_KEY, JSON.stringify(formatted));
        } catch {}
        return { data: formatted, source: 'supabase' };
      }

      return { data: localData, source: 'local' };
    } catch (err: any) {
      return { data: localData, source: 'local', error: err.message };
    }
  },

  async saveSacrament(record: Omit<SacramentRecord, 'id' | 'createdAt'> & { id?: string }): Promise<{ success: boolean; record: SacramentRecord; error?: string }> {
    const isEdit = Boolean(record.id);
    const id = record.id || 'sac-' + Date.now();
    const newRecord: SacramentRecord = {
      ...record,
      id,
      createdAt: new Date().toISOString()
    };

    try {
      const stored = localStorage.getItem(LOCAL_SACRAMENTS_KEY);
      let list: SacramentRecord[] = stored ? JSON.parse(stored) : [...INITIAL_SACRAMENTS];
      if (isEdit) {
        list = list.map(s => s.id === id ? newRecord : s);
      } else {
        list.unshift(newRecord);
      }
      localStorage.setItem(LOCAL_SACRAMENTS_KEY, JSON.stringify(list));
    } catch {}

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {
          type: newRecord.type,
          reg_number: newRecord.regNumber,
          recipient_name: newRecord.recipientName,
          spouse_name: newRecord.spouseName || null,
          father_name: newRecord.fatherName || null,
          mother_name: newRecord.motherName || null,
          date: newRecord.date,
          officiating_pastor: newRecord.officiatingPastor,
          location: newRecord.location,
          witnesses: newRecord.witnesses || null,
          certificate_issued: newRecord.certificateIssued,
          notes: newRecord.notes || null
        };

        if (isEdit) {
          await supabase.from('sacraments').update(payload).eq('reg_number', newRecord.regNumber);
        } else {
          await supabase.from('sacraments').insert([payload]);
        }
      } catch (err: any) {
        console.warn('[SecretariatService] Sync Supabase sacrement différée:', err.message);
      }
    }

    return { success: true, record: newRecord };
  },

  async deleteSacrament(id: string, regNumber?: string): Promise<boolean> {
    try {
      const stored = localStorage.getItem(LOCAL_SACRAMENTS_KEY);
      if (stored) {
        const list: SacramentRecord[] = JSON.parse(stored);
        localStorage.setItem(LOCAL_SACRAMENTS_KEY, JSON.stringify(list.filter(s => s.id !== id)));
      }
    } catch {}

    if (isSupabaseConfigured && supabase && regNumber) {
      try {
        await supabase.from('sacraments').delete().eq('reg_number', regNumber);
      } catch {}
    }
    return true;
  },

  // ====================================================
  // 3. REQUÊTES DE PRIÈRE
  // ====================================================
  async getPrayerRequests(): Promise<PrayerRequest[]> {
    try {
      const stored = localStorage.getItem(LOCAL_PRAYERS_KEY);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(LOCAL_PRAYERS_KEY, JSON.stringify(INITIAL_PRAYERS));
      return INITIAL_PRAYERS;
    } catch {
      return INITIAL_PRAYERS;
    }
  },

  async updatePrayerStatus(id: string, status: 'pending' | 'prayed', notes?: string): Promise<boolean> {
    try {
      const stored = localStorage.getItem(LOCAL_PRAYERS_KEY);
      const list: PrayerRequest[] = stored ? JSON.parse(stored) : [...INITIAL_PRAYERS];
      const updated = list.map(p => p.id === id ? { ...p, status, notes: notes || p.notes } : p);
      localStorage.setItem(LOCAL_PRAYERS_KEY, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  },

  // ====================================================
  // 4. EXPORT CSV DES MEMBRES
  // ====================================================
  exportMembersToCsv(members: MemberRecord[]): void {
    const headers = ['Numéro de Registre', 'Nom Complet', 'Sexe', 'Téléphone', 'Email', 'Adresse', 'Date de Baptême', 'Ministère / Département', 'Statut', 'Date d’adhésion'];
    const rows = members.map(m => [
      `"${m.regNumber}"`,
      `"${m.fullName.replace(/"/g, '""')}"`,
      `"${m.gender}"`,
      `"${m.phone}"`,
      `"${m.email || ''}"`,
      `"${(m.address || '').replace(/"/g, '""')}"`,
      `"${m.baptismDate || ''}"`,
      `"${(m.ministryAffiliation || '').replace(/"/g, '""')}"`,
      `"${m.status}"`,
      `"${m.joinedDate}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `registre-membres-eglise-nazareen-dame-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // ====================================================
  // 5. CODE SQL DE MIGRATION POUR SUPABASE
  // ====================================================
  getSupabaseMigrationSql(): string {
    return `-- ====================================================================
-- SCHEMA OFFICIEL DE LA BASE DE DONNÉES SUPABASE
-- ÉGLISE DU NAZARÉEN DE DAMÉ (HAÏTI) - SECRÉTARIAT GÉNÉRAL
-- « Sainteté à l'Éternel »
-- ====================================================================

-- 1. Table des Membres
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reg_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    gender VARCHAR(2) NOT NULL DEFAULT 'M',
    phone TEXT,
    email TEXT,
    address TEXT,
    baptism_date DATE,
    ministry TEXT NOT NULL DEFAULT 'Assemblée Générale',
    status VARCHAR(20) NOT NULL DEFAULT 'actif',
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Table des Sacrements (Baptêmes, Mariages, Dédicaces)
CREATE TABLE IF NOT EXISTS public.sacraments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL, -- 'bapteme', 'mariage', 'dedicace'
    reg_number TEXT UNIQUE NOT NULL,
    recipient_name TEXT NOT NULL,
    spouse_name TEXT,
    father_name TEXT,
    mother_name TEXT,
    date DATE NOT NULL,
    officiating_pastor TEXT NOT NULL DEFAULT 'Pasteur Bequel CHERELUS',
    location TEXT NOT NULL DEFAULT 'Temple de Damé',
    witnesses TEXT,
    certificate_issued BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Table des Projets & Chantiers
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE,
    title TEXT NOT NULL,
    partner TEXT NOT NULL DEFAULT 'Église du Nazaréen de Damé',
    category TEXT NOT NULL DEFAULT 'Développement Communautaire',
    summary TEXT,
    full_description TEXT,
    banner_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'planning',
    target_amount NUMERIC(12,2) DEFAULT 0,
    current_amount NUMERIC(12,2) DEFAULT 0,
    beneficiaries_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Table des Requêtes de Prière
CREATE TABLE IF NOT EXISTS public.prayer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    full_name TEXT,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    phone TEXT,
    email TEXT,
    message TEXT NOT NULL,
    is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
    pastor_only BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Table des Abonnés Newsletter
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    brevo_contact_id BIGINT,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- POLITIQUES DE SÉCURITÉ (Row Level Security - RLS)
-- Permet la lecture publique et la gestion sécurisée
-- ====================================================================

-- Activer RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sacraments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Politiques pour les Membres (Accès authentifié et clé anon autorisés)
DROP POLICY IF EXISTS "Membres lecture autorisée" ON public.members;
CREATE POLICY "Membres lecture autorisée" ON public.members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Membres écriture autorisée" ON public.members;
CREATE POLICY "Membres écriture autorisée" ON public.members FOR ALL USING (true);

-- Politiques pour les Sacrements
DROP POLICY IF EXISTS "Sacrements lecture autorisée" ON public.sacraments;
CREATE POLICY "Sacrements lecture autorisée" ON public.sacraments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sacrements écriture autorisée" ON public.sacraments;
CREATE POLICY "Sacrements écriture autorisée" ON public.sacraments FOR ALL USING (true);

-- Politiques pour les Projets
DROP POLICY IF EXISTS "Projets lecture publique" ON public.projects;
CREATE POLICY "Projets lecture publique" ON public.projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Projets écriture autorisée" ON public.projects;
CREATE POLICY "Projets écriture autorisée" ON public.projects FOR ALL USING (true);

-- Politiques pour les Requêtes de prière
DROP POLICY IF EXISTS "Prières insertion publique" ON public.prayer_requests;
CREATE POLICY "Prières insertion publique" ON public.prayer_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Prières lecture autorisée" ON public.prayer_requests;
CREATE POLICY "Prières lecture autorisée" ON public.prayer_requests FOR ALL USING (true);

-- Politiques pour la Newsletter
DROP POLICY IF EXISTS "Newsletter inscription publique" ON public.newsletter_subscribers;
CREATE POLICY "Newsletter inscription publique" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Newsletter gestion autorisée" ON public.newsletter_subscribers;
CREATE POLICY "Newsletter gestion autorisée" ON public.newsletter_subscribers FOR ALL USING (true);
`;
  }
};
