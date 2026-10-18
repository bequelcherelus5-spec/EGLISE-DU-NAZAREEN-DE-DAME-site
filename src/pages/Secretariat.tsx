import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Key, 
  ShieldCheck, 
  Mail, 
  Users, 
  Calendar, 
  Image as ImageIcon, 
  Settings, 
  Database, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Search, 
  Trash2, 
  Plus, 
  Download, 
  Copy, 
  Check, 
  LogOut,
  RefreshCw,
  ExternalLink,
  HeartHandshake,
  Globe,
  Heart,
  MessageSquare,
  Phone,
  BookOpen,
  Sparkles,
  UserCheck,
  Scroll,
  Radio,
  Megaphone,
  HelpCircle
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { OFFICIAL_CHURCH_INFO, INITIAL_MEMBERS, OFFICIAL_SERVICES } from '../data/churchData';
import { newsletterService } from '../services/newsletterService';
import { authService, AdminUser } from '../services/authService';
import { getSupabaseStatus } from '../services/supabaseClient';
import { NewsletterSubscriber, BrevoConfigView, MemberRecord, ChurchPost } from '../types';
import { NewsletterManager } from '../components/NewsletterManager';
import { ProjectManager } from '../components/ProjectManager';
import { ContentManager } from '../components/ContentManager';
import { LessonsManager } from '../components/secretariat/LessonsManager';
import { TestimoniesManager } from '../components/secretariat/TestimoniesManager';
import { DiscipleshipManager } from '../components/secretariat/DiscipleshipManager';
import { DocRequestsManager } from '../components/secretariat/DocRequestsManager';
import { RadioAlertManager } from '../components/secretariat/RadioAlertManager';
import { FAQManager } from '../components/secretariat/FAQManager';

interface SecretariatProps {
  onNavigate: (path: string) => void;
}

export const Secretariat: React.FC<SecretariatProps> = ({ onNavigate }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => authService.isAuthenticated());
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => authService.getUser());
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Active Admin Section (Sections autorisées)
  const [activeTab, setActiveTab] = useState<
    | 'overview' 
    | 'prayers' 
    | 'lessons' 
    | 'testimonies' 
    | 'discipleship' 
    | 'documents' 
    | 'radio_alert' 
    | 'publications' 
    | 'brevo_config' 
    | 'newsletter_manager' 
    | 'projects' 
    | 'faqs' 
    | 'content' 
    | 'events' 
    | 'members' 
    | 'images' 
    | 'settings'
  >('overview');

  // Prayer Requests Management
  const [prayersList, setPrayersList] = useState<Array<{
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
    amenCount?: number;
  }>>([]);
  const [loadingPrayers, setLoadingPrayers] = useState<boolean>(false);
  const [prayerFilter, setPrayerFilter] = useState<'all' | 'pastorOnly' | 'public' | 'urgent' | 'pending' | 'prayed'>('all');
  const [prayerSearch, setPrayerSearch] = useState<string>('');

  // Brevo Settings State
  const [brevoSettings, setBrevoSettings] = useState<BrevoConfigView>({
    hasApiKey: false,
    apiKeyPreview: '',
    senderEmail: 'eglisedunazareendedame@gmail.com',
    senderName: 'Église du Nazaréen de Damé',
    brevoListId: '2',
    isActive: true,
    updatedAt: ''
  });
  const [inputApiKey, setInputApiKey] = useState<string>('');
  const [brevoSaveLoading, setBrevoSaveLoading] = useState<boolean>(false);
  const [brevoSaveMsg, setBrevoSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [brevoTestLoading, setBrevoTestLoading] = useState<boolean>(false);
  const [brevoTestResult, setBrevoTestResult] = useState<{ success: boolean; message: string; account?: any } | null>(null);

  // Stats Counters
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);

  // Members Management
  const [members, setMembers] = useState<MemberRecord[]>(INITIAL_MEMBERS);
  const [memberSearch, setMemberSearch] = useState('');
  const [newMemberModal, setNewMemberModal] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    fullName: '',
    phone: '',
    address: '3ème Section Damé',
    ministryAffiliation: 'Jeunesse (JNI)',
    gender: 'M' as 'M' | 'F'
  });

  // Publications Management (Espace Propre du Secrétariat / Pasteur)
  const [publications, setPublications] = useState<ChurchPost[]>(() => {
    try {
      const saved = localStorage.getItem('dame_church_publications');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Storage read failed', e);
    }
    return [];
  });
  const [postSearch, setPostSearch] = useState('');
  const [newPostModal, setNewPostModal] = useState(false);
  const [newPostForm, setNewPostForm] = useState<{
    title: string;
    category: string;
    ministryTag: string;
    excerpt: string;
    content: string;
    author: string;
    image: string;
    status: 'published' | 'draft';
  }>({
    title: '',
    category: 'Annonce Pastorale',
    ministryTag: 'Global',
    excerpt: '',
    content: '',
    author: 'Pasteur Bequel CHERELUS',
    image: '/images/eglise/sceau-officiel.svg',
    status: 'published'
  });
  const [postNotice, setPostNotice] = useState<string | null>(null);

  // Images Manager
  const [selectedImageFolder, setSelectedImageFolder] = useState<string>('eglise');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const loadPrayers = async () => {
    setLoadingPrayers(true);
    try {
      const res = await fetch('/api/prayers');
      if (res.ok) {
        const data = await res.json();
        setPrayersList(data);
      }
    } catch (e) {
      console.warn('Erreur chargement prières admin:', e);
    } finally {
      setLoadingPrayers(false);
    }
  };

  const handleTogglePrayerStatus = async (id: string, currentStatus: 'pending' | 'prayed') => {
    const nextStatus = currentStatus === 'pending' ? 'prayed' : 'pending';
    try {
      const res = await fetch(`/api/prayers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setPrayersList(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p));
      }
    } catch (e) {
      console.warn('Erreur modification prière:', e);
    }
  };

  const handleDeletePrayer = async (id: string) => {
    if (!window.confirm('Voulez-vous archiver cette requête de prière ?')) return;
    try {
      const res = await fetch(`/api/prayers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPrayersList(prev => prev.filter(p => p.id !== id));
      }
    } catch (e) {
      console.warn('Erreur suppression prière:', e);
    }
  };

  // Initial Load when logged in
  useEffect(() => {
    if (isAuthenticated) {
      loadBrevoSettings();
      loadSubscribersCount();
      loadPrayers();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      setAuthError('Veuillez saisir votre mot de passe administrateur.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await authService.login(adminPassword.trim(), adminEmail.trim() || undefined);
      if (res.success) {
        setIsAuthenticated(true);
        setCurrentUser(authService.getUser());
        setAdminPassword('');
        setAdminEmail('');
      } else {
        setAuthError(res.error || 'Code secret incorrect. Accès refusé.');
      }
    } catch {
      setAuthError('Erreur de communication avec le serveur d’authentification.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const loadBrevoSettings = async () => {
    const data = await newsletterService.getBrevoSettings();
    if (data) setBrevoSettings(data);
  };

  const loadSubscribersCount = async () => {
    const list = await newsletterService.getSubscribers();
    setSubscribers(list);
  };

  const handleSaveBrevo = async (e: React.FormEvent) => {
    e.preventDefault();
    setBrevoSaveLoading(true);
    setBrevoSaveMsg(null);
    try {
      const res = await newsletterService.saveBrevoSettings({
        apiKey: inputApiKey || undefined,
        senderEmail: brevoSettings.senderEmail,
        senderName: brevoSettings.senderName,
        brevoListId: brevoSettings.brevoListId
      });
      if (res.success) {
        setBrevoSaveMsg({ type: 'success', text: 'Paramètres Brevo enregistrés de façon sécurisée sur le serveur !' });
        setInputApiKey('');
        loadBrevoSettings();
      } else {
        setBrevoSaveMsg({ type: 'error', text: res.message });
      }
    } catch {
      setBrevoSaveMsg({ type: 'error', text: 'Erreur lors de l’enregistrement.' });
    } finally {
      setBrevoSaveLoading(false);
    }
  };

  const handleTestBrevo = async () => {
    setBrevoTestLoading(true);
    setBrevoTestResult(null);
    try {
      const res = await newsletterService.testBrevoConnection();
      setBrevoTestResult({
        success: res.success,
        message: res.message,
        account: res.account
      });
    } catch (err: any) {
      setBrevoTestResult({ success: false, message: 'Échec du test de communication.' });
    } finally {
      setBrevoTestLoading(false);
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: MemberRecord = {
      id: 'mem-' + Date.now(),
      regNumber: `END-2026-${String(members.length + 1).padStart(3, '0')}`,
      fullName: newMemberForm.fullName,
      gender: newMemberForm.gender,
      phone: newMemberForm.phone,
      address: newMemberForm.address,
      ministryAffiliation: newMemberForm.ministryAffiliation,
      status: 'actif',
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setMembers([newRecord, ...members]);
    setNewMemberModal(false);
    setNewMemberForm({
      fullName: '',
      phone: '',
      address: '3ème Section Damé',
      ministryAffiliation: 'Jeunesse (JNI)',
      gender: 'M'
    });
  };

  const exportMembersCSV = () => {
    const headers = ['Numero Registre', 'Nom Complet', 'Sexe', 'Telephone', 'Adresse', 'Ministere', 'Statut', 'Date Adhesion'];
    const rows = members.map(m => [
      m.regNumber,
      `"${m.fullName}"`,
      m.gender,
      `"${m.phone}"`,
      `"${m.address}"`,
      `"${m.ministryAffiliation}"`,
      m.status,
      m.joinedDate
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `registre_membres_dame_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const persistPublications = (list: ChurchPost[]) => {
    setPublications(list);
    try {
      localStorage.setItem('dame_church_publications', JSON.stringify(list));
    } catch (e) {
      console.warn('Storage write failed', e);
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostForm.title.trim() || !newPostForm.content.trim()) return;

    const slug = newPostForm.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newPost: ChurchPost = {
      id: 'post-' + Date.now(),
      slug: slug || 'publication-' + Date.now(),
      title: newPostForm.title.trim(),
      category: newPostForm.category,
      ministryTag: newPostForm.ministryTag,
      excerpt: newPostForm.excerpt.trim() || newPostForm.content.slice(0, 140) + '...',
      content: newPostForm.content.trim(),
      author: newPostForm.author || 'Direction Pastorale',
      publishedAt: new Date().toISOString(),
      status: newPostForm.status,
      image: newPostForm.image || '/images/eglise/sceau-officiel.svg'
    };

    const updated = [newPost, ...publications];
    persistPublications(updated);
    setNewPostModal(false);
    setNewPostForm({
      title: '',
      category: 'Annonce Pastorale',
      ministryTag: 'Global',
      excerpt: '',
      content: '',
      author: 'Pasteur Bequel CHERELUS',
      image: '/images/eglise/sceau-officiel.svg',
      status: 'published'
    });
    setPostNotice('Publication enregistrée avec succès !');
    setTimeout(() => setPostNotice(null), 3000);
  };

  const handleDeletePost = (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer cet article ?')) {
      const updated = publications.filter(p => p.id !== id);
      persistPublications(updated);
    }
  };

  const handleTogglePostStatus = (id: string) => {
    const updated = publications.map(p => {
      if (p.id === id) {
        const nextStatus: 'published' | 'draft' = p.status === 'published' ? 'draft' : 'published';
        return { ...p, status: nextStatus };
      }
      return p;
    });
    persistPublications(updated);
  };

  const supabaseStatus = getSupabaseStatus();

  // If NOT authenticated, show official login screen (NO secrets exposed in UI)
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-slate-950 text-white">
        <SEOHead 
          title="Secrétariat & Administration – Église du Nazaréen de Damé"
          description="Espace d'administration réservé au secrétariat, pastorat et diaconat de l'Église du Nazaréen de Damé, Haïti."
          path="/secretariat"
          image="/images/eglise/sceau-officiel.svg"
        />
        <div className="max-w-md w-full bg-slate-900 rounded-3xl p-8 border border-amber-500/30 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-white">
              Espace Secrétariat
            </h1>
            <p className="text-xs text-amber-400 font-serif">
              « SAINTETÉ À L’ÉTERNEL »
            </p>
            <p className="text-xs text-slate-400">
              Accès réservé au Pasteur Bequel CHERELUS, aux diacres et aux administrateurs autorisés.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Identifiant / Email (Optionnel)
              </label>
              <input
                type="email"
                placeholder="pastorat@eglisedunazareendedame.org"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Mot de passe d'accès administratif *
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Code secret administrateur..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-xs text-rose-300 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Vérification...</span>
                </>
              ) : (
                <span>Déverrouiller le Tableau de Bord</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // AUTHENTICATED DASHBOARD
  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      <SEOHead 
        title="Secrétariat & Administration | Église du Nazaréen de Damé"
        description="Espace d'administration réservé au secrétariat, pastorat et diaconat de l'Église du Nazaréen de Damé, Haïti."
        path="/secretariat"
        image="/images/eglise/sceau-officiel.svg"
      />

      {/* Top Admin Header Banner */}
      <header className="bg-slate-900 text-white border-b border-amber-500/20 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-base sm:text-lg text-white">
                Secrétariat &amp; Administration Centrale
              </h1>
              <p className="text-[11px] text-amber-400">
                Église du Nazaréen de Damé • {currentUser?.name || 'Session administrative active'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('/')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white transition border border-slate-700"
            >
              Voir le site public
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600 hover:text-white flex items-center space-x-1 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Verrouiller</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sub Navigation Bar (Clean Menu with Only Legitimate Admin Sections) */}
      <div className="bg-white border-b border-slate-200 sticky top-20 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center space-x-2 overflow-x-auto py-2.5">
            {[
              { id: 'overview', label: 'Tableau de bord', icon: Database },
              { id: 'prayers', label: 'Requêtes de Prière', icon: Heart },
              { id: 'lessons', label: 'Lekòl Dimanch (Leçons)', icon: BookOpen },
              { id: 'testimonies', label: 'Témoignages (Temwayaj)', icon: Sparkles },
              { id: 'discipleship', label: 'Nouvo Kwayan (Discipulat)', icon: UserCheck },
              { id: 'documents', label: 'Demann Dokiman', icon: Scroll },
              { id: 'radio_alert', label: 'Radyo & Banyè Alèt', icon: Radio },
              { id: 'publications', label: 'Mes Publications', icon: FileText },
              { id: 'brevo_config', label: 'Configuration Brevo', icon: Key },
              { id: 'newsletter_manager', label: 'Newsletter Manager', icon: Mail },
              { id: 'projects', label: 'Gestion des Projets', icon: HeartHandshake },
              { id: 'faqs', label: 'Gestion FAQ', icon: HelpCircle },
              { id: 'content', label: 'Gestion Contenu', icon: Globe },
              { id: 'events', label: 'Événements & Cultes', icon: Calendar },
              { id: 'members', label: 'Registre des Membres', icon: Users },
              { id: 'images', label: 'Gestion des Images', icon: ImageIcon },
              { id: 'settings', label: 'Paramètres', icon: Settings },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Membres au Registre</span>
                <p className="font-serif text-3xl font-extrabold text-slate-900 mt-1">{members.length}</p>
                <p className="text-xs text-slate-500 mt-1">Registre de Damé actif</p>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Abonnés Newsletter</span>
                <p className="font-serif text-3xl font-extrabold text-slate-900 mt-1">{subscribers.length}</p>
                <p className="text-xs text-amber-600 mt-1">
                  {subscribers.filter(s => s.isActive).length} actif(s) synchronisés
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Publications Pastorales</span>
                <p className="font-serif text-3xl font-extrabold text-slate-900 mt-1">{publications.length}</p>
                <p className="text-xs text-emerald-600 mt-1">
                  {publications.filter(p => p.status === 'published').length} en ligne
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Ministères Actifs</span>
                <p className="font-serif text-3xl font-extrabold text-slate-900 mt-1">7</p>
                <p className="text-xs text-blue-600 mt-1">Comités coordonnés</p>
              </div>
            </div>

            {/* Quick Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brevo Status */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-slate-900 text-base">État Système Brevo API</h3>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    brevoSettings.hasApiKey ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {brevoSettings.hasApiKey ? 'Clé Active Côté Serveur' : 'Clé non définie'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  L'API Brevo gère la synchronisation des contacts et l'envoi des lettres pastorales par SMTP transactionnel.
                </p>
                <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl font-mono space-y-1">
                  <p>Expéditeur : {brevoSettings.senderEmail}</p>
                  <p>Nom : {brevoSettings.senderName}</p>
                  <p>List ID : {brevoSettings.brevoListId}</p>
                </div>
                <button
                  onClick={() => setActiveTab('brevo_config')}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700"
                >
                  Gérer la configuration Brevo →
                </button>
              </div>

              {/* Supabase Status */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-slate-900 text-base">État Backend Supabase</h3>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    supabaseStatus.isConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {supabaseStatus.isConfigured ? 'Connecté' : 'Mode Résilience Actif'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Base de données pour la persistance cloud sécurisée des abonnés, membres et articles de l’Église.
                </p>
                <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl font-mono space-y-1">
                  <p>Projet : {supabaseStatus.projectUrl}</p>
                  <p>Clé Anon : {supabaseStatus.hasAnonKey ? 'Définie' : 'Non renseignée'}</p>
                  <p>Table abonnés : newsletter_subscribers</p>
                </div>
                <button
                  onClick={() => setActiveTab('newsletter_manager')}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700"
                >
                  Consulter les abonnés en direct →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: REQUÊTES DE PRIÈRE & INTERCESSION PASTORALE */}
        {/* ========================================================================= */}
        {activeTab === 'prayers' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-serif text-2xl font-bold text-slate-900">
                    Requêtes de Prière &amp; Espas Sekrè
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    {prayersList.length} reçues
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Accès réservé au Pasteur Bequel CHERELUS et à l’équipe d'intercession pour le suivi spirituel confidentiel.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={loadPrayers}
                  disabled={loadingPrayers}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center space-x-1.5 transition"
                  title="Actualiser les requêtes"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingPrayers ? 'animate-spin' : ''}`} />
                  <span>Actualiser</span>
                </button>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: `Toutes (${prayersList.length})` },
                  { id: 'pastorOnly', label: `🔒 Sekrè Pastorales (${prayersList.filter(p => p.pastorOnly).length})` },
                  { id: 'public', label: `🌐 Mur Public (${prayersList.filter(p => !p.pastorOnly).length})` },
                  { id: 'urgent', label: `⚡ Ijans (${prayersList.filter(p => p.isUrgent).length})` },
                  { id: 'pending', label: `⏳ En cours (${prayersList.filter(p => p.status === 'pending').length})` },
                  { id: 'prayed', label: `✅ Priyè Fèt (${prayersList.filter(p => p.status === 'prayed').length})` },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setPrayerFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      prayerFilter === f.id
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher nom, mot-clé..."
                  value={prayerSearch}
                  onChange={(e) => setPrayerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Prayer Requests Cards List */}
            {loadingPrayers ? (
              <div className="py-16 text-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                <p className="text-xs text-slate-500 mt-2">Chargement des requêtes de prière...</p>
              </div>
            ) : prayersList.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <Heart className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 mt-2">Aucune requête de prière enregistrée</p>
                <p className="text-xs text-slate-500">Les requêtes soumises via le site apparaîtront ici.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {prayersList
                  .filter(p => {
                    if (prayerFilter === 'pastorOnly') return p.pastorOnly;
                    if (prayerFilter === 'public') return !p.pastorOnly;
                    if (prayerFilter === 'urgent') return p.isUrgent;
                    if (prayerFilter === 'pending') return p.status === 'pending';
                    if (prayerFilter === 'prayed') return p.status === 'prayed';
                    return true;
                  })
                  .filter(p => {
                    if (!prayerSearch) return true;
                    const q = prayerSearch.toLowerCase();
                    return (
                      p.message.toLowerCase().includes(q) ||
                      (p.fullName && p.fullName.toLowerCase().includes(q)) ||
                      p.category.toLowerCase().includes(q)
                    );
                  })
                  .map(p => (
                    <div
                      key={p.id}
                      className={`p-5 rounded-2xl border transition space-y-3 ${
                        p.status === 'prayed'
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : p.isUrgent
                          ? 'bg-rose-50/50 border-rose-300 ring-1 ring-rose-300'
                          : 'bg-white border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-900">
                            {p.isAnonymous ? '👤 Anonyme' : (p.fullName || 'Fidèle de Damé')}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            {p.category}
                          </span>
                          {p.pastorOnly ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-amber-300 flex items-center space-x-1">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Sekrè Pastoral</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                              🌐 Mur Public
                            </span>
                          )}
                          {p.isUrgent && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                              ⚡ Ijans
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(p.createdAt).toLocaleDateString('fr-HT', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line">
                        {p.message}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                        <div className="flex items-center space-x-3 text-xs text-slate-500">
                          {p.phone && (
                            <div className="flex items-center space-x-1 font-mono text-amber-700 font-bold">
                              <Phone className="w-3.5 h-3.5" />
                              <a href={`tel:${p.phone}`} className="hover:underline">{p.phone}</a>
                            </div>
                          )}
                          {p.email && (
                            <div className="flex items-center space-x-1 text-slate-600">
                              <Mail className="w-3.5 h-3.5" />
                              <a href={`mailto:${p.email}`} className="hover:underline">{p.email}</a>
                            </div>
                          )}
                          {typeof p.amenCount === 'number' && p.amenCount > 0 && (
                            <span className="text-[11px] text-emerald-600 font-semibold">
                              🙏 {p.amenCount} fidèles ont prié
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {p.phone && (
                            <a
                              href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `Bonjour ${p.fullName || ''},\n\nPasteur Bequel CHERELUS vous contacte fraternellement concernant votre requête de prière confiée à l'Église du Nazaréen de Damé. Nous prions avec foi pour vous ! « Sainteté à l'Éternel »`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center space-x-1 transition shadow-sm"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}

                          <button
                            onClick={() => handleTogglePrayerStatus(p.id, p.status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                              p.status === 'prayed'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{p.status === 'prayed' ? 'Priyè Fèt (Achevé)' : 'Marquer comme Prié'}</span>
                          </button>

                          <button
                            onClick={() => handleDeletePrayer(p.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Archiver"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: LEKOL DIMANCH (LEÇONS - OPTION 7) */}
        {activeTab === 'lessons' && (
          <LessonsManager onNavigate={onNavigate} />
        )}

        {/* TAB: TÉMOIGNAGES (TEMWAYAJ - OPTION 5) */}
        {activeTab === 'testimonies' && (
          <TestimoniesManager onNavigate={onNavigate} />
        )}

        {/* TAB: NOUVEAUX CONVERTIS (DISCIPULAT - OPTION 17) */}
        {activeTab === 'discipleship' && (
          <DiscipleshipManager onNavigate={onNavigate} />
        )}

        {/* TAB: DEMANDE DE DOCUMENTS (OPTION 6) */}
        {activeTab === 'documents' && (
          <DocRequestsManager onNavigate={onNavigate} />
        )}

        {/* TAB: RADIO & BANNIÈRE D'ALERTE (OPTION 3 & 13) */}
        {activeTab === 'radio_alert' && (
          <RadioAlertManager />
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MES PUBLICATIONS */}
        {/* ========================================================================= */}
        {activeTab === 'publications' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-slate-900">
                  Mes Publications &amp; Annonces
                </h2>
                <p className="text-xs text-slate-500">
                  Espace d’écriture et de diffusion réservé à la direction pastorale et au secrétariat.
                </p>
              </div>
              <button
                onClick={() => setNewPostModal(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 flex items-center space-x-1.5 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Rédiger une Publication</span>
              </button>
            </div>

            {postNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{postNotice}</span>
              </div>
            )}

            {/* List */}
            {publications.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Aucune publication pastorale pour le moment.</p>
                <button
                  onClick={() => setNewPostModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
                >
                  Créer le premier article
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b">
                    <tr>
                      <th className="py-3 px-4">Titre</th>
                      <th className="py-3 px-4">Catégorie</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4">Auteur</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {publications.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{p.title}</td>
                        <td className="py-3.5 px-4 text-slate-600">{p.category}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {p.status === 'published' ? 'Publié' : 'Brouillon'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{p.author}</td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(p.publishedAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleTogglePostStatus(p.id)}
                            className="px-2.5 py-1 rounded text-[11px] font-bold bg-slate-100 hover:bg-slate-200"
                          >
                            {p.status === 'published' ? 'Passer brouillon' : 'Publier'}
                          </button>
                          <button
                            onClick={() => handleDeletePost(p.id)}
                            className="p-1.5 rounded text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CONFIGURATION BREVO */}
        {/* ========================================================================= */}
        {activeTab === 'brevo_config' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-6">
            <div className="border-b pb-4">
              <h2 className="font-serif text-2xl font-bold text-slate-900">
                Configuration de l’API Brevo (Sendinblue)
              </h2>
              <p className="text-xs text-slate-500">
                Gérez la clé d'API, l'adresse d'expédition officielle et la liste de contacts.
              </p>
            </div>

            {brevoSaveMsg && (
              <div className={`p-4 rounded-2xl border text-xs flex items-center space-x-2 ${
                brevoSaveMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {brevoSaveMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{brevoSaveMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveBrevo} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Clé d’API Brevo v3 (xkeysib-...)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder={brevoSettings.hasApiKey ? `Clé actuelle : ${brevoSettings.apiKeyPreview}` : "Collez votre clé xkeysib-..."}
                    value={inputApiKey}
                    onChange={(e) => setInputApiKey(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email de l’expéditeur officiel *
                  </label>
                  <input
                    type="email"
                    required
                    value={brevoSettings.senderEmail}
                    onChange={(e) => setBrevoSettings({ ...brevoSettings, senderEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Doit être vérifié dans Brevo &gt; Expéditeurs &amp; IP
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom de l’expéditeur affiché *
                  </label>
                  <input
                    type="text"
                    required
                    value={brevoSettings.senderName}
                    onChange={(e) => setBrevoSettings({ ...brevoSettings, senderName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Identifiant de la Liste Brevo (List ID)
                </label>
                <input
                  type="text"
                  required
                  value={brevoSettings.brevoListId}
                  onChange={(e) => setBrevoSettings({ ...brevoSettings, brevoListId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="submit"
                  disabled={brevoSaveLoading}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-sm"
                >
                  {brevoSaveLoading ? 'Enregistrement...' : 'Enregistrer la configuration'}
                </button>
                <button
                  type="button"
                  onClick={handleTestBrevo}
                  disabled={brevoTestLoading}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition"
                >
                  {brevoTestLoading ? 'Test en cours...' : 'Tester la connexion Brevo'}
                </button>
              </div>
            </form>

            {brevoTestResult && (
              <div className={`p-4 rounded-2xl border text-xs max-w-2xl ${
                brevoTestResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center space-x-2 font-bold mb-1">
                  {brevoTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                  <span>{brevoTestResult.message}</span>
                </div>
                {brevoTestResult.account && (
                  <p className="font-mono text-[11px] text-emerald-700">
                    Compte : {brevoTestResult.account.email} • Plan : {brevoTestResult.account.plan}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: NEWSLETTER MANAGER (DÉDIÉ) */}
        {/* ========================================================================= */}
        {activeTab === 'newsletter_manager' && (
          <NewsletterManager 
            brevoConfig={brevoSettings} 
            onRefreshBrevoConfig={loadBrevoSettings} 
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 5: GESTION DES PROJETS */}
        {/* ========================================================================= */}
        {activeTab === 'projects' && (
          <ProjectManager />
        )}

        {/* ========================================================================= */}
        {/* TAB: GESTION FAQ (FOIRE AUX QUESTIONS) */}
        {/* ========================================================================= */}
        {activeTab === 'faqs' && (
          <FAQManager onNavigate={onNavigate} />
        )}


        {/* ========================================================================= */}
        {/* TAB 6: GESTION CONTENU (PAGES PERSONNALISÉES) */}
        {/* ========================================================================= */}
        {activeTab === 'content' && (
          <ContentManager onNavigateToPage={(slug) => onNavigate('/page/' + slug)} />
        )}

        {/* ========================================================================= */}
        {/* TAB 7: EVENTS & SERVICES */}
        {/* ========================================================================= */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-slate-900">
                  Gestion des Cultes &amp; Événements
                </h2>
                <p className="text-xs text-slate-500">
                  Horaires hebdomadaires et conférences de l'Église du Nazaréen de Damé.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {OFFICIAL_SERVICES.map((s) => (
                <div key={s.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-sm">{s.title}</h4>
                    <p className="text-xs text-slate-500">{s.day} • {s.time} — {s.location}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    Actif
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: MEMBERS REGISTRY */}
        {/* ========================================================================= */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-slate-900">
                  Registre Officiel des Membres
                </h2>
                <p className="text-xs text-slate-500">
                  Registre des membres de l'Église du Nazaréen de Damé
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setNewMemberModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouveau Membre</span>
                </button>
                <button
                  onClick={exportMembersCSV}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center space-x-1"
                >
                  <Download className="w-4 h-4" />
                  <span>Exporter CSV</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b">
                  <tr>
                    <th className="py-3 px-4">Numéro</th>
                    <th className="py-3 px-4">Nom Complet</th>
                    <th className="py-3 px-4">Téléphone</th>
                    <th className="py-3 px-4">Ministère</th>
                    <th className="py-3 px-4">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">{m.regNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{m.fullName}</td>
                      <td className="py-3 px-4 text-slate-600">{m.phone}</td>
                      <td className="py-3 px-4 text-slate-600">{m.ministryAffiliation}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: IMAGES MANAGER */}
        {/* ========================================================================= */}
        {activeTab === 'images' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-6">
            <div className="border-b pb-4">
              <h2 className="font-serif text-2xl font-bold text-slate-900">
                Gestion des Images &amp; Médias
              </h2>
              <p className="text-xs text-slate-500">
                Répertoire des visuels officiels de l'Église. Utilisez ces URL relatives pour illustrer vos projets et publications.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Sceau Officiel de l’Église', url: '/images/eglise/sceau-officiel.svg', cat: 'Identité Officielle' },
                { title: 'Bannière Réseaux Sociaux (OG)', url: '/images/eglise/og-banner.svg', cat: 'Partage Social' },
                { title: 'Pasteur Bequel CHERELUS', url: '/images/pasteur/pasteur-cherelus.svg', cat: 'Direction Pastorale' },
                { title: 'Projet CDEJ Compassion', url: '/images/projets/cdej-compassion.svg', cat: 'Projets Sociaux' },
                { title: 'Badge Événements & Cultes', url: '/images/evenements/evenement-badge.svg', cat: 'Calendrier' },
                { title: 'Badge Ministères', url: '/images/ministeres/ministere-badge.svg', cat: 'Ministères' },
              ].map((img, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="h-32 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-2">
                    <img src={img.url} alt={img.title} className="max-h-full object-contain" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-600 block">{img.cat}</span>
                    <h4 className="font-bold text-xs text-slate-900">{img.title}</h4>
                    <code className="text-[10px] font-mono text-slate-500 block truncate mt-1">{img.url}</code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(img.url)}
                    className="w-full py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center space-x-1"
                  >
                    {copiedUrl === img.url ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl === img.url ? 'URL Copiée !' : 'Copier le lien'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 10: PARAMÈTRES */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900">
                    Paramètres &amp; Administration
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Gestion de la sécurité administrative, connectivité des services et informations d’Église.
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 flex items-center space-x-1.5 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Verrouiller l’espace Secrétariat</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Infrastructure */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-amber-600" />
                    <h3 className="font-serif font-bold text-sm text-slate-900">
                      Services &amp; Connectivité
                    </h3>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                      <div>
                        <p className="font-bold text-slate-800">Serveur API Express</p>
                        <p className="text-[11px] text-slate-500">Flux d’abonnement &amp; synchronisation</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Opérationnel (Port 3000)
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                      <div>
                        <p className="font-bold text-slate-800">API Brevo Transactionnel</p>
                        <p className="text-[11px] text-slate-500">SMTP v3 : {brevoSettings.senderEmail}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Actif
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Sécurité Pastorale */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <h3 className="font-serif font-bold text-sm text-slate-900">
                      Sécurité Administrative
                    </h3>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                      <p className="font-bold text-slate-800">Authentification Sécurisée</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        L’authentification administrative est protégée côté serveur (via la variable d’environnement ADMIN_SECURITY_KEY et Supabase Auth). Aucun mot de passe ni clé confidentielle n’est exposé dans le navigateur web.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">Session en cours</p>
                        <p className="text-[11px] text-slate-500">
                          Connecté en tant qu'administrateur
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="px-3 py-1 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100"
                      >
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Coordonnées Officielles */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <h3 className="font-serif font-bold text-sm text-slate-900">
                      Coordonnées Institutionnelles de l'Église
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-700">
                    <div className="p-2.5 bg-white rounded-xl border">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Dénomination</span>
                      <strong className="text-slate-900">{OFFICIAL_CHURCH_INFO.name}</strong>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Direction Pastorale</span>
                      <strong className="text-slate-900">{OFFICIAL_CHURCH_INFO.seniorPastor}</strong>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Téléphone Officiel</span>
                      <strong className="text-slate-900">{OFFICIAL_CHURCH_INFO.phone}</strong>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Courriel Officiel</span>
                      <strong className="text-slate-900">{OFFICIAL_CHURCH_INFO.email}</strong>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Localisation</span>
                      <strong className="text-slate-900">{OFFICIAL_CHURCH_INFO.address.full}</strong>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Devise Biblique</span>
                      <strong className="text-slate-900 font-serif italic">« {OFFICIAL_CHURCH_INFO.motto} »</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Modal Nouveau Membre */}
      {newMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <h3 className="font-serif text-xl font-bold text-slate-900">
              Enregistrer un Nouveau Membre
            </h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nom Complet *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Jean-Baptiste Pierre"
                  value={newMemberForm.fullName}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sexe</label>
                  <select
                    value={newMemberForm.gender}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, gender: e.target.value as 'M' | 'F' })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 bg-white"
                  >
                    <option value="M">Masculin (M)</option>
                    <option value="F">Féminin (F)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+509 ..."
                    value={newMemberForm.phone}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ministère d'Affiliation</label>
                <select
                  value={newMemberForm.ministryAffiliation}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, ministryAffiliation: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 bg-white"
                >
                  <option value="Jeunesse (JNI)">Jeunesse (JNI)</option>
                  <option value="Ministère des Femmes (MNI)">Ministère des Femmes (MNI)</option>
                  <option value="Ministère des Hommes">Ministère des Hommes</option>
                  <option value="École du Dimanche (MIED)">École du Dimanche (MIED)</option>
                  <option value="Évangélisation & Mission">Évangélisation &amp; Mission</option>
                  <option value="Chorale & Louange">Chorale &amp; Louange</option>
                  <option value="Diaconat & Accueil">Diaconat &amp; Accueil</option>
                </select>
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setNewMemberModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
                >
                  Inscrire le membre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nouvelle Publication */}
      {newPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-bold text-slate-900">
              Rédiger une Publication Pastorale
            </h3>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titre de la publication *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Exhortation sur la sanctification"
                  value={newPostForm.title}
                  onChange={(e) => setNewPostForm({ ...newPostForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catégorie</label>
                  <select
                    value={newPostForm.category}
                    onChange={(e) => setNewPostForm({ ...newPostForm, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 bg-white"
                  >
                    <option value="Annonce Pastorale">Annonce Pastorale</option>
                    <option value="Méditation Biblique">Méditation Biblique</option>
                    <option value="Vie de l'Église">Vie de l'Église</option>
                    <option value="Projets Sociaux">Projets Sociaux</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Statut</label>
                  <select
                    value={newPostForm.status}
                    onChange={(e) => setNewPostForm({ ...newPostForm, status: e.target.value as 'published' | 'draft' })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 bg-white"
                  >
                    <option value="published">Publier immédiatement</option>
                    <option value="draft">Enregistrer comme brouillon</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contenu complet *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Rédigez le texte de l’article..."
                  value={newPostForm.content}
                  onChange={(e) => setNewPostForm({ ...newPostForm, content: e.target.value })}
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setNewPostModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
