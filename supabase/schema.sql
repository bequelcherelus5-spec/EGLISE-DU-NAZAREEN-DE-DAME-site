-- ==============================================================================
-- SCHÉMA OFFICIEL SUPABASE - ÉGLISE DU NAZARÉEN DE DAMÉ (HAÏTI)
-- Devise : « Sainteté à l'Éternel »
-- Domaine : https://www.eglisedunazareendedame.org
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE DES PROFILS D'UTILISATEURS (Admin & Responsables)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('super_admin', 'pastor', 'secretary', 'leader', 'member')),
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABLE DES MINISTÈRES
CREATE TABLE IF NOT EXISTS public.ministries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    short_description TEXT NOT NULL,
    description TEXT NOT NULL,
    leader_name TEXT,
    meeting_schedule TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABLE DES ÉVÉNEMENTS & CULTES
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('culte', 'jeunesse', 'priere', 'conference', 'formation', 'social', 'special')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    location TEXT NOT NULL DEFAULT 'Sanctuaire de Damé, 3ème Section Damé',
    description TEXT NOT NULL,
    is_recurrent BOOLEAN NOT NULL DEFAULT false,
    recurrence_rule TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABLE DES PROJETS SOCIAUX (dont CDEJ HA 0926 Compassion International)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE,
    title TEXT NOT NULL,
    partner TEXT NOT NULL DEFAULT 'Compassion International',
    category TEXT NOT NULL,
    summary TEXT NOT NULL,
    full_description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'planning')),
    beneficiaries_target INT DEFAULT 0,
    beneficiaries_reached INT DEFAULT 0,
    banner_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. STATISTIQUES DES PROJETS
CREATE TABLE IF NOT EXISTS public.project_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    unit TEXT,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. TABLE DES MÉDIAS (Prédications, Podcasts, Vidéos, Photos)
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('sermon_audio', 'sermon_video', 'podcast', 'gallery_photo', 'document')),
    speaker TEXT DEFAULT 'Pasteur Bequel CHERELUS',
    biblical_reference TEXT,
    series_name TEXT,
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration TEXT,
    published_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. TABLE DES PUBLICATIONS & ARTICLES
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT 'Direction Pastorale',
    category TEXT NOT NULL DEFAULT 'Actualités',
    image_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. TABLE DES ABONNÉS NEWSLETTER
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    brevo_contact_id BIGINT,
    source TEXT DEFAULT 'site_web',
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    unsubscribed_at TIMESTAMPTZ
);

-- 10. TABLE DES CAMPAGNES NEWSLETTER
CREATE TABLE IF NOT EXISTS public.newsletter_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    content_html TEXT NOT NULL,
    sent_by TEXT NOT NULL,
    brevo_campaign_id BIGINT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
    sent_count INT DEFAULT 0,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. TABLE DE CONFIGURATION BREVO (Sécurisée - Accessible uniquement aux Admins)
CREATE TABLE IF NOT EXISTS public.brevo_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_email TEXT NOT NULL DEFAULT 'eglisedunazareendedame@gmail.com',
    sender_name TEXT NOT NULL DEFAULT 'Église du Nazaréen de Damé',
    brevo_list_id TEXT NOT NULL DEFAULT '2',
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_by TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. TABLE DES MEMBRES DE L'ÉGLISE (Registre Secrétariat)
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_number TEXT UNIQUE,
    full_name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('M', 'F')),
    birth_date DATE,
    phone TEXT,
    email TEXT,
    address TEXT DEFAULT 'Damé, Môle-Saint-Nicolas',
    baptism_date DATE,
    reception_date DATE,
    ministry_affiliation TEXT,
    marital_status TEXT,
    status TEXT NOT NULL DEFAULT 'actif' CHECK (status IN ('actif', 'inactif', 'transfere', 'decede')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. TABLE DES SCORES DES JEUX BIBLIQUES
CREATE TABLE IF NOT EXISTS public.game_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_name TEXT NOT NULL,
    game_mode TEXT NOT NULL DEFAULT 'quiz_general',
    score INT NOT NULL,
    total_questions INT NOT NULL,
    time_taken_seconds INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brevo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

-- Politiques de lecture publique (Lecture libre des informations d'Église)
CREATE POLICY "Lecture publique des ministères" ON public.ministries FOR SELECT USING (true);
CREATE POLICY "Lecture publique des événements" ON public.events FOR SELECT USING (true);
CREATE POLICY "Lecture publique des projets" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Lecture publique des statistiques" ON public.project_statistics FOR SELECT USING (true);
CREATE POLICY "Lecture publique des médias" ON public.media FOR SELECT USING (true);
CREATE POLICY "Lecture publique des publications" ON public.posts FOR SELECT USING (is_published = true);
CREATE POLICY "Lecture publique des scores bibliques" ON public.game_scores FOR SELECT USING (true);
CREATE POLICY "Insertion publique des scores bibliques" ON public.game_scores FOR INSERT WITH CHECK (true);

-- Inscription publique newsletter
CREATE POLICY "Inscription publique newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- Politiques d'administration (Réservées aux membres authentifiés / Secrétariat)
CREATE POLICY "Accès complet profils admin" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Gestion ministères admin" ON public.ministries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Gestion événements admin" ON public.events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Gestion projets admin" ON public.projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Gestion statistiques admin" ON public.project_statistics FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Gestion médias admin" ON public.media FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Gestion publications admin" ON public.posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Gestion abonnés newsletter admin" ON public.newsletter_subscribers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Gestion campagnes newsletter admin" ON public.newsletter_campaigns FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Gestion Brevo admin" ON public.brevo_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Gestion membres registre admin" ON public.members FOR ALL USING (auth.role() = 'authenticated');

-- DONNÉES INITIALES ESSENTIELLES POUR L'ÉGLISE
INSERT INTO public.ministries (slug, name, short_description, description, leader_name, meeting_schedule, display_order)
VALUES
('jeunesse', 'Ministère de la Jeunesse (JNI)', 'Formation spirituelle, leadership et dynamisme des jeunes pour Christ.', 'La Jeunesse Nazaréenne Internationale (JNI) de Damé rassemble les adolescents et jeunes adultes pour fortifier leur foi, développer leurs talents et impacter la communauté.', 'Responsable JNI Damé', 'Samedi à 15h00', 1),
('femmes', 'Ministère des Femmes', 'Prière, sanctification, entraide fraternelle et édification mutuelle.', 'Le ministère féminin accompagne les mères, épouses et sœurs dans la prière fervente, les œuvres de bienfaisance et le témoignage chrétien.', 'Comité des Femmes', 'Mercredi à 15h00', 2),
('hommes', 'Ministère des Hommes', 'Responsabilité chrétienne, affermissement des foyers et service fraternel.', 'Encadrement des hommes et pères de famille dans la fidélité biblique, le travail honorable et l engagement dans l œuvre du Seigneur.', 'Comité des Hommes', '1er Samedi du mois à 16h00', 3),
('enfants', 'Ministère des Enfants', 'École du Dimanche et éveil spirituel dès le plus jeune âge.', 'Enseignement de la Parole de Dieu adapté à chaque tranche d âge à travers des histoires bibliques, chants et activités spirituelles.', 'Moniteurs École du Dimanche', 'Dimanche à 07h00', 4),
('education', 'Ministère de l’Éducation', 'Alphabétisation, cours de formation chrétienne et soutien scolaire.', 'Promotion de l éducation biblique et académique pour le relèvement de la jeunesse de la 3ème Section Damé.', 'Direction Éducation', 'Sur calendrier trimestriel', 5),
('evangelisation', 'Ministère de l’Évangélisation', 'Proclamation de l’Évangile et implantation de cellules de prière.', 'Campagnes missionnaires, visites des malades et témoignage dans toute la commune de Môle-Saint-Nicolas et le Nord-Ouest.', 'Commission Évangélisation', 'Vendredi à 15h30', 6),
('priere', 'Ministère de la Prière', 'Intercession constante pour l’Église, les familles et la nation haïtienne.', 'Chaîne de prière continue, jeûnes et veillées spirituelles pour porter les fardeaux de l assemblée devant le trône de grâce.', 'Équipe d Intercession', 'Mardi à 16h00 & Veillée mensuelle', 7)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.projects (code, title, partner, category, summary, full_description, status, beneficiaries_target, beneficiaries_reached)
VALUES
('HA-0926', 'Centre de Développement de l’Enfant et du Jeune (CDEJ HA 0926)', 'Compassion International', 'Développement de l’Enfance', 'Parrainage holistique d’enfants à Damé, Môle-Saint-Nicolas : éducation, nutrition, santé et formation chrétienne.', 'Le projet CDEJ HA 0926 est le fruit du partenariat stratégique entre l’Église du Nazaréen de Damé et Compassion International. Il prend en charge des centaines d enfants vulnérables de la 3ème Section Damé en leur offrant un suivi médical régulier, un soutien nutritionnel, des cours de renforcement scolaire, un accompagnement psychologique et un enseignement biblique solide.', 'active', 300, 265)
ON CONFLICT (code) DO NOTHING;
