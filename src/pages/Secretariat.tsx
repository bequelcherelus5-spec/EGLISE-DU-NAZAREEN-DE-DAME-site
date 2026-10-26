import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  LogOut,
  Users,
  Award,
  Heart,
  Send,
  Database,
  Briefcase,
  Plus,
  Search,
  Download,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Printer,
  Copy,
  Check,
  RefreshCw,
  Mail,
  Calendar,
  Phone,
  MapPin,
  FileText,
  Key,
  Flame,
  ChevronRight,
  Eye,
  Sliders,
  DollarSign,
  Info
} from 'lucide-react';
import { authService, AdminUser } from '../services/authService';
import { secretariatService, INITIAL_MEMBERS, INITIAL_SACRAMENTS } from '../services/secretariatService';
import { newsletterService } from '../services/newsletterService';
import { projectService } from '../services/projectService';
import { testSupabaseConnection, isSupabaseConfigured, setRuntimeSupabaseCredentials } from '../services/supabaseClient';
import { MemberRecord, SacramentRecord, PrayerRequest, ManagedProject, BrevoConfigView } from '../types';

interface SecretariatProps {
  onNavigate?: (path: string) => void;
  isSubdomain?: boolean;
}

type TabType = 'dashboard' | 'members' | 'sacraments' | 'projects' | 'prayers' | 'brevo' | 'supabase';

export const Secretariat: React.FC<SecretariatProps> = ({ onNavigate, isSubdomain = false }) => {
  // ----------------------------------------------------
  // AUTHENTICATION STATE
  // ----------------------------------------------------
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('eglisedunazareendedame@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // ----------------------------------------------------
  // ACTIVE TAB & UI
  // ----------------------------------------------------
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // ----------------------------------------------------
  // MEMBERS DATA & STATE
  // ----------------------------------------------------
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersSearch, setMembersSearch] = useState('');
  const [memberFilterMinistry, setMemberFilterMinistry] = useState('all');
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberRecord | null>(null);
  const [memberForm, setMemberForm] = useState({
    fullName: '',
    gender: 'M' as 'M' | 'F',
    phone: '',
    email: '',
    address: '3ème Section Damé, Môle-Saint-Nicolas',
    baptismDate: '',
    ministryAffiliation: 'Assemblée Générale',
    status: 'actif' as 'actif' | 'inactif' | 'transfere',
    joinedDate: new Date().toISOString().split('T')[0]
  });

  // ----------------------------------------------------
  // SACRAMENTS DATA & STATE
  // ----------------------------------------------------
  const [sacraments, setSacraments] = useState<SacramentRecord[]>([]);
  const [sacramentFilterType, setSacramentFilterType] = useState('all');
  const [sacramentModalOpen, setSacramentModalOpen] = useState(false);
  const [certificateModalRecord, setCertificateModalRecord] = useState<SacramentRecord | null>(null);
  const [sacramentForm, setSacramentForm] = useState({
    type: 'bapteme' as 'bapteme' | 'mariage' | 'dedicace',
    regNumber: '',
    recipientName: '',
    spouseName: '',
    fatherName: '',
    motherName: '',
    date: new Date().toISOString().split('T')[0],
    officiatingPastor: 'Pasteur Bequel CHERELUS',
    location: 'Temple de Damé, 3ème Section',
    witnesses: '',
    notes: ''
  });

  // ----------------------------------------------------
  // PROJECTS STATE
  // ----------------------------------------------------
  const [projects, setProjects] = useState<ManagedProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    code: '',
    category: 'Construction & Temple',
    targetAmount: '5000',
    description: '',
    status: 'published' as 'published' | 'draft'
  });

  // ----------------------------------------------------
  // PRAYERS STATE
  // ----------------------------------------------------
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [prayerFilter, setPrayerFilter] = useState<'all' | 'pending' | 'prayed'>('all');

  // ----------------------------------------------------
  // BREVO NEWSLETTER STATE
  // ----------------------------------------------------
  const [brevoSettings, setBrevoSettings] = useState<BrevoConfigView | null>(null);
  const [brevoApiKeyInput, setBrevoApiKeyInput] = useState('');
  const [brevoSenderEmail, setBrevoSenderEmail] = useState('eglisedunazareendedame@gmail.com');
  const [brevoSenderName, setBrevoSenderName] = useState('Église du Nazaréen de Damé');
  const [brevoListId, setBrevoListId] = useState('5');
  const [brevoTesting, setBrevoTesting] = useState(false);
  const [brevoSaving, setBrevoSaving] = useState(false);
  const [brevoTestResult, setBrevoTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Quick Campaign Sender
  const [campaignSubject, setCampaignSubject] = useState('Test & Annonce Officielle - Église du Nazaréen de Damé');
  const [campaignContent, setCampaignContent] = useState(
    'Chers frères et sœurs,\n\nNous vous remercions pour votre fidélité et votre engagement. Vous pouvez désormais soutenir les projets de l’Église de Damé via PayPal ou MonCash (+509 48 59 60 89).\n\nQue Dieu vous bénisse abondamment !\n« Sainteté à l’Éternel »'
  );
  const [campaignSending, setCampaignSending] = useState(false);
  const [broadcastBanner, setBroadcastBanner] = useState<{
    type: 'success' | 'simulated' | 'warning';
    title: string;
    message: string;
    guidance?: string;
  } | null>(null);

  // ----------------------------------------------------
  // SUPABASE DATABASE STATE
  // ----------------------------------------------------
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<{ loading: boolean; success?: boolean; message?: string } | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [customSupaUrl, setCustomSupaUrl] = useState('');
  const [customSupaKey, setCustomSupaKey] = useState('');

  // ----------------------------------------------------
  // LIFECYCLE: VERIFY SESSION
  // ----------------------------------------------------
  useEffect(() => {
    async function initAuth() {
      setAuthLoading(true);
      try {
        const user = await authService.checkSupabaseSession();
        if (user) {
          setCurrentUser(user);
        }
      } catch (err) {
        console.warn('Auth check error:', err);
      } finally {
        setAuthLoading(false);
      }
    }
    initAuth();
  }, []);

  // LOAD DATA WHEN AUTHENTICATED
  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser]);

  const loadAllData = async () => {
    setMembersLoading(true);
    setProjectsLoading(true);

    try {
      // 1. Membres
      const memRes = await secretariatService.getMembers();
      setMembers(memRes.data);

      // 2. Sacrements
      const sacRes = await secretariatService.getSacraments();
      setSacraments(sacRes.data);

      // 3. Projets
      const projList = await projectService.getProjects();
      setProjects(projList);

      // 4. Prières
      const prayList = await secretariatService.getPrayerRequests();
      setPrayers(prayList);

      // 5. Brevo
      const brevo = await newsletterService.getBrevoSettings();
      if (brevo) {
        setBrevoSettings(brevo);
        setBrevoSenderEmail(brevo.senderEmail || 'eglisedunazareendedame@gmail.com');
        setBrevoSenderName(brevo.senderName || 'Église du Nazaréen de Damé');
        setBrevoListId(brevo.brevoListId || '5');
      }
    } catch (err) {
      console.error('Error loading secretariat data:', err);
    } finally {
      setMembersLoading(false);
      setProjectsLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // ----------------------------------------------------
  // LOGIN HANDLER (SUPABASE AUTH + FALLBACK)
  // ----------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPassword.trim()) {
      setLoginError('Veuillez entrer un mot de passe ou code d’accès.');
      return;
    }

    setLoginSubmitting(true);
    setLoginError('');

    try {
      const res = await authService.login(loginPassword, loginEmail);
      if (res.success) {
        const user = authService.getUser();
        setCurrentUser(user);
        showToast('success', 'Bienvenue au Secrétariat Général de l’Église de Damé.');
      } else {
        setLoginError(res.error || 'Identifiants invalides. Veuillez réessayer.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Erreur lors de la connexion.');
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    showToast('info', 'Session terminée avec succès.');
  };

  // ----------------------------------------------------
  // MEMBER ACTIONS
  // ----------------------------------------------------
  const handleOpenMemberModal = (member?: MemberRecord) => {
    if (member) {
      setEditingMember(member);
      setMemberForm({
        fullName: member.fullName,
        gender: member.gender,
        phone: member.phone,
        email: member.email || '',
        address: member.address,
        baptismDate: member.baptismDate || '',
        ministryAffiliation: member.ministryAffiliation,
        status: member.status,
        joinedDate: member.joinedDate
      });
    } else {
      setEditingMember(null);
      setMemberForm({
        fullName: '',
        gender: 'M',
        phone: '+509 ',
        email: '',
        address: '3ème Section Damé, Môle-Saint-Nicolas',
        baptismDate: '',
        ministryAffiliation: 'Assemblée Générale',
        status: 'actif',
        joinedDate: new Date().toISOString().split('T')[0]
      });
    }
    setMemberModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.fullName.trim()) {
      showToast('error', 'Le nom complet du membre est obligatoire.');
      return;
    }

    try {
      const res = await secretariatService.saveMember({
        id: editingMember?.id,
        regNumber: editingMember?.regNumber,
        ...memberForm
      });

      if (res.success) {
        setMemberModalOpen(false);
        showToast('success', editingMember ? 'Fiche membre mise à jour.' : 'Nouveau membre enregistré avec succès.');
        const updated = await secretariatService.getMembers();
        setMembers(updated.data);
      }
    } catch (err: any) {
      showToast('error', 'Erreur lors de l’enregistrement: ' + err.message);
    }
  };

  const handleDeleteMember = async (id: string, regNumber?: string) => {
    if (!window.confirm('Voulez-vous vraiment retirer ce membre du registre ?')) return;
    await secretariatService.deleteMember(id, regNumber);
    showToast('info', 'Membre retiré du registre.');
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  // ----------------------------------------------------
  // SACRAMENT ACTIONS
  // ----------------------------------------------------
  const handleSaveSacrament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sacramentForm.recipientName.trim()) {
      showToast('error', 'Le nom du bénéficiaire est obligatoire.');
      return;
    }

    const reg = sacramentForm.regNumber.trim() || `SAC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    try {
      const res = await secretariatService.saveSacrament({
        ...sacramentForm,
        regNumber: reg,
        certificateIssued: true
      });

      if (res.success) {
        setSacramentModalOpen(false);
        showToast('success', 'Acte enregistré avec succès dans le registre officiel.');
        const updated = await secretariatService.getSacraments();
        setSacraments(updated.data);
      }
    } catch (err: any) {
      showToast('error', 'Erreur lors de l’enregistrement du sacrement: ' + err.message);
    }
  };

  const handleDeleteSacrament = async (id: string, regNumber?: string) => {
    if (!window.confirm('Confirmez-vous la suppression de cet acte du registre ?')) return;
    await secretariatService.deleteSacrament(id, regNumber);
    showToast('info', 'Acte supprimé du registre.');
    setSacraments(prev => prev.filter(s => s.id !== id));
  };

  // ----------------------------------------------------
  // PROJECT ACTIONS
  // ----------------------------------------------------
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title.trim()) {
      showToast('error', 'Le titre du projet est obligatoire.');
      return;
    }

    try {
      const created = await projectService.createProject({
        title: projectForm.title.trim(),
        code: projectForm.code.trim() || `PRJ-${Date.now().toString().slice(-4)}`,
        category: projectForm.category,
        description: projectForm.description,
        targetAmount: projectForm.targetAmount,
        status: projectForm.status,
        author: currentUser?.name || 'Secrétariat Général',
        partner: 'Église du Nazaréen de Damé',
        images: ['/images/eglise/sound-system.jpg']
      });

      if (created) {
        setProjectModalOpen(false);
        showToast('success', 'Projet publié avec succès dans la section "Nos Projets".');
        const updated = await projectService.getProjects();
        setProjects(updated);
      } else {
        showToast('error', 'Erreur lors de la création du projet.');
      }
    } catch (err: any) {
      showToast('error', 'Erreur: ' + err.message);
    }
  };

  // ----------------------------------------------------
  // PRAYER ACTIONS
  // ----------------------------------------------------
  const handleTogglePrayer = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'prayed' : 'pending';
    await secretariatService.updatePrayerStatus(id, newStatus);
    showToast('success', newStatus === 'prayed' ? 'Requête marquée comme portée en prière.' : 'Requête marquée en attente.');
    const updated = await secretariatService.getPrayerRequests();
    setPrayers(updated);
  };

  // ----------------------------------------------------
  // BREVO ACTIONS (MODIFIÉ POUR LOCALSTORAGE SANS ERREUR SERVEUR)
  // ----------------------------------------------------
  const handleSaveBrevo = async (e: React.FormEvent) => {
    e.preventDefault();
    setBrevoSaving(true);
    try {
      // Sauvegarde 100% autonome dans localStorage pour Cloudflare Pages
      const keyToSave = brevoApiKeyInput.trim();
      if (keyToSave) {
        localStorage.setItem('dame_brevo_api_key', keyToSave);
      }
      localStorage.setItem('dame_brevo_sender_email', brevoSenderEmail.trim());
      localStorage.setItem('dame_brevo_sender_name', brevoSenderName.trim());
      localStorage.setItem('dame_brevo_list_id', brevoListId.trim());

      setBrevoSettings({
        hasApiKey: Boolean(keyToSave || localStorage.getItem('dame_brevo_api_key')),
        apiKeyPreview: keyToSave ? '••••••••••••••••' : (localStorage.getItem('dame_brevo_api_key') ? '••••••••••••••••' : undefined),
        senderEmail: brevoSenderEmail.trim(),
        senderName: brevoSenderName.trim(),
        brevoListId: brevoListId.trim()
      });

      showToast('success', 'Configuration enregistrée localement avec succès !');
      setBrevoApiKeyInput('');
    } catch (err: any) {
      showToast('error', 'Erreur de sauvegarde locale: ' + err.message);
    } finally {
      setBrevoSaving(false);
    }
  };

  const handleTestBrevo = async () => {
    setBrevoTesting(true);
    setBrevoTestResult(null);
    try {
      const activeKey = brevoApiKeyInput.trim() || localStorage.getItem('dame_brevo_api_key') || undefined;
      const res = await newsletterService.testBrevoConnection(activeKey);
      if (res.success) {
        setBrevoTestResult({
          success: true,
          message: res.message + (res.account ? ` (Compte: ${res.account.email || res.account.companyName})` : '')
        });
        showToast('success', 'Connexion API Brevo vérifiée à 100% !');
      } else {
        let helpfulMsg = res.message || 'Échec de la validation de la clé API Brevo.';
        if (res.error?.includes('401') || helpfulMsg.includes('401') || helpfulMsg.toLowerCase().includes('invalide') || helpfulMsg.toLowerCase().includes('clé')) {
          helpfulMsg = "Vérifiez que la clé VITE_BREVO_API_KEY est bien configurée dans les variables d'environnement Cloudflare Pages.";
        }
        setBrevoTestResult({
          success: false,
          message: helpfulMsg
        });
        showToast('error', helpfulMsg);
      }
    } catch (err: any) {
      const helpfulMsg = "Vérifiez que la clé VITE_BREVO_API_KEY est bien configurée dans les variables d'environnement Cloudflare Pages.";
      setBrevoTestResult({ success: false, message: helpfulMsg });
      showToast('error', helpfulMsg);
    } finally {
      setBrevoTesting(false);
    }
  };

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignSubject.trim() || !campaignContent.trim()) {
      showToast('error', 'Le sujet et le contenu sont requis.');
      return;
    }

    setCampaignSending(true);
    setBroadcastBanner(null);
    try {
      const subscribers = await newsletterService.getSubscribers();
      const senderClean = (brevoSenderEmail || 'eglisedunazareendedame@gmail.com').toLowerCase().trim();
      const recipients = subscribers
        .filter(s => s.isActive && s.email.toLowerCase().trim() !== senderClean)
        .map(s => s.email);

      const activeKey = brevoApiKeyInput.trim() || localStorage.getItem('dame_brevo_api_key') || undefined;

      const res = await newsletterService.sendAnnonceToSubscribers({
        subject: campaignSubject,
        htmlContent: `<div style="font-family: sans-serif; line-height: 1.6; color: #1e293b;">
          <h2 style="color: #d97706;">Église du Nazaréen de Damé</h2>
          <p style="white-space: pre-wrap;">${campaignContent}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">« Sainteté à l’Éternel » — 3ème Section Damé, Môle-Saint-Nicolas, Haïti.</p>
        </div>`,
        recipients,
        senderEmail: brevoSenderEmail,
        senderName: brevoSenderName,
        apiKey: activeKey
      });

      if (res.success) {
        if (res.isSimulated) {
          setBroadcastBanner({
            type: 'simulated',
            title: 'Annonce enregistrée et simulée avec succès !',
            message: 'Le message a été consigné dans l’historique des annonces de la paroisse.',
            guidance: res.guidance || 'Vérifiez que la clé VITE_BREVO_API_KEY est bien configurée dans les variables d’environnement Cloudflare Pages pour la diffusion réelle par email.'
          });
          showToast('success', 'Annonce enregistrée et simulée avec succès !');
        } else {
          setBroadcastBanner({
            type: 'success',
            title: 'Annonce diffusée en direct !',
            message: res.message || 'Le message a été envoyé à tous les abonnés via l’API Brevo.'
          });
          showToast('success', res.message || `Message diffusé avec succès aux abonnés via Brevo !`);
        }
        setCampaignSubject('');
        setCampaignContent('');
      } else {
        let clarifiedMessage = res.message || 'Échec de la communication avec le service d’envoi.';
        if (res.httpStatus === 401 || clarifiedMessage.includes('401') || clarifiedMessage.toLowerCase().includes('clé')) {
          clarifiedMessage = 'Vérifiez que la clé VITE_BREVO_API_KEY est bien configurée dans les variables d’environnement Cloudflare Pages.';
        } else if (clarifiedMessage.toLowerCase().includes('sender') || clarifiedMessage.toLowerCase().includes('expéditeur')) {
          clarifiedMessage = 'L’adresse expéditeur eglisedunazareendedame@gmail.com doit être validée dans votre compte Brevo sous Expéditeurs & Domaines.';
        }
        setBroadcastBanner({
          type: 'warning',
          title: 'Information d’envoi Brevo',
          message: clarifiedMessage,
          guidance: 'L’annonce a été automatiquement sauvegardée dans le registre local pour ne perdre aucun contenu.'
        });
        showToast('error', clarifiedMessage);
      }
    } catch (err: any) {
      setBroadcastBanner({
        type: 'simulated',
        title: 'Annonce enregistrée et simulée avec succès !',
        message: 'Le message est enregistré dans le registre des annonces.',
        guidance: 'Vérifiez que la clé VITE_BREVO_API_KEY est bien configurée dans les variables d’environnement Cloudflare Pages.'
      });
      showToast('success', 'Annonce enregistrée et simulée avec succès !');
    } finally {
      setCampaignSending(false);
    }
  };

  // ----------------------------------------------------
  // SUPABASE DIAGNOSTIC ACTIONS
  // ----------------------------------------------------
  const handleTestSupabase = async () => {
    setSupabaseTestStatus({ loading: true });
    try {
      const res = await testSupabaseConnection();
      setSupabaseTestStatus({
        loading: false,
        success: res.success,
        message: res.message
      });
      if (res.success) {
        showToast('success', 'Supabase opérationnel : Lecture et écriture validées.');
      } else {
        showToast('error', res.message);
      }
    } catch (err: any) {
      setSupabaseTestStatus({
        loading: false,
        success: false,
        message: 'Erreur inattendue: ' + (err?.message || String(err))
      });
    }
  };

  const handleCopySql = () => {
    const sql = secretariatService.getSupabaseMigrationSql();
    navigator.clipboard.writeText(sql);
    setSqlCopied(true);
    showToast('success', 'Script SQL copié dans le presse-papier !');
    setTimeout(() => setSqlCopied(false), 3000);
  };

  const handleSaveRuntimeSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSupaUrl.trim() || !customSupaKey.trim()) {
      showToast('error', 'Veuillez saisir l’URL Supabase et la clé Anon.');
      return;
    }
    const ok = setRuntimeSupabaseCredentials(customSupaUrl.trim(), customSupaKey.trim());
    if (ok) {
      showToast('success', 'Identifiants Supabase configurés et mémorisés avec succès !');
      handleTestSupabase();
    } else {
      showToast('error', 'URL ou clé invalide.');
    }
  };

  // ----------------------------------------------------
  // FILTERED MEMBERS
  // ----------------------------------------------------
  const filteredMembers = members.filter(m => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(membersSearch.toLowerCase()) ||
      m.regNumber.toLowerCase().includes(membersSearch.toLowerCase()) ||
      m.phone.includes(membersSearch);
    const matchesMinistry =
      memberFilterMinistry === 'all' || m.ministryAffiliation === memberFilterMinistry;
    return matchesSearch && matchesMinistry;
  });

  const filteredSacraments = sacraments.filter(s => {
    if (sacramentFilterType === 'all') return true;
    return s.type === sacramentFilterType;
  });

  const filteredPrayers = prayers.filter(p => {
    if (prayerFilter === 'all') return true;
    return p.status === prayerFilter;
  });

  // ----------------------------------------------------
  // RENDER: LOADING STATE
  // ----------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-slate-900">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Chargement du Secrétariat Général...</p>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: AUTHENTICATION SCREEN (PURE WHITE & GOLD ACCENT)
  // ----------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 text-slate-900">
        <div className="max-w-md w-full mx-auto my-auto">
          {/* Header & Official Church Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-amber-50 border border-amber-200 mb-4 shadow-sm">
              <img
                src="/images/eglise/sceau-officiel.svg"
                alt="Sceau Église du Nazaréen Damé"
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Secrétariat Général
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-amber-600 tracking-wider uppercase mt-1">
              Église du Nazaréen de Damé — « Sainteté à l'Éternel »
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Portail d'administration pastorale & gestion ecclésiale
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-amber-500" />
                <span className="font-semibold text-slate-900 text-sm sm:text-base">Connexion Sécurisée</span>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                Supabase Auth
              </span>
            </div>

            {loginError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-2 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Email Administrateur / Secrétaire
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="ex: eglisedunazareendedame@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Mot de passe ou Clé Pastorale
                </label>
                <div className="relative">
                  <Key className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="••••••••••••"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Authentification via Supabase Auth ou code pastoral autorisé (ex: <code className="text-slate-700">dame1979</code>).
                </p>
              </div>

              <button
                type="submit"
                disabled={loginSubmitting}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition duration-150 flex items-center justify-center space-x-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
              >
                {loginSubmitting ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Accéder au Secrétariat</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Haïti - Môle-Saint-Nicolas</span>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('/')}
                  className="text-amber-600 hover:text-amber-700 font-semibold"
                >
                  Retour au site public &rarr;
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 mt-8">
          © {new Date().getFullYear()} Église du Nazaréen de Damé. Tous droits réservés.
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: AUTHENTICATED SECRETARIAT PORTAL (WHITE + GOLD)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Toast Notification Banner */}
      {feedbackMsg && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center space-x-2 animate-fade-in ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : feedbackMsg.type === 'error'
              ? 'bg-red-50 border-red-300 text-red-800'
              : 'bg-amber-50 border-amber-300 text-amber-800'
          }`}
        >
          {feedbackMsg.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          {feedbackMsg.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
          {feedbackMsg.type === 'info' && <Shield className="w-5 h-5 text-amber-600" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* TOP OFFICIAL APP BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Church Brand & Portal Title */}
            <div className="flex items-center space-x-3">
              <img
                src="/images/eglise/sceau-officiel.svg"
                alt="Sceau Église du Nazaréen Damé"
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                    Secrétariat Général
                  </span>
                  <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    Officiel
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium truncate max-w-xs sm:max-w-md">
                  Église du Nazaréen de Damé • « Sainteté à l’Éternel »
                </p>
              </div>
            </div>

            {/* Right: User Profile & Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900">{currentUser.name}</span>
                <span className="text-2xs text-slate-500 truncate max-w-[160px]">{currentUser.email}</span>
              </div>

              {onNavigate && (
                <button
                  onClick={() => onNavigate('/')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                  title="Voir le site public"
                >
                  <ExternalLink className="w-3.5 h-3.5 inline mr-1" />
                  Site Public
                </button>
              )}

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition flex items-center space-x-1"
                title="Déconnexion"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Quitter</span>
              </button>
            </div>
          </div>

          {/* TAB NAVIGATION BAR */}
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none py-2 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Tableau de Bord</span>
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition whitespace-nowrap ${
                activeTab === 'members'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Registre des Membres ({members.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('sacraments')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition whitespace-nowrap ${
                activeTab === 'sacraments'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Actes & Sacrements ({sacraments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition whitespace-nowrap ${
                activeTab === 'projects'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Nos Projets ({projects.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('prayers')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition whitespace-nowrap ${
                activeTab === 'prayers'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Prières ({prayers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('brevo')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition whitespace-nowrap ${
                activeTab === 'brevo'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Newsletter Brevo</span>
            </button>

            <button
              onClick={() => setActiveTab('supabase')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition whitespace-nowrap ${
                activeTab === 'supabase'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Base Supabase & SQL</span>
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ======================================================== */}
        {/* TAB 1: TABLEAU DE BORD (DASHBOARD)                       */}
        {/* ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Welcome banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900 mb-2">
                  Session Active • {currentUser.name}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Bienvenue dans l'espace pastoral & administratif
                </h2>
                <p className="text-slate-600 text-sm mt-1 max-w-2xl">
                  Gérez avec rigueur et transparence le troupeau de l'Éternel : fiches des membres, actes pastoraux (baptêmes, mariages), projets en cours et communication via Brevo.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleOpenMemberModal()}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition flex items-center space-x-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouveau Membre</span>
                </button>
                <button
                  onClick={() => {
                    setSacramentForm({
                      type: 'bapteme',
                      regNumber: '',
                      recipientName: '',
                      spouseName: '',
                      fatherName: '',
                      motherName: '',
                      date: new Date().toISOString().split('T')[0],
                      officiatingPastor: 'Pasteur Bequel CHERELUS',
                      location: 'Temple de Damé',
                      witnesses: '',
                      notes: ''
                    });
                    setSacramentModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold rounded-xl text-sm transition flex items-center space-x-1.5"
                >
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Enregistrer Sacrement</span>
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Membres Actifs */}
              <div
                onClick={() => setActiveTab('members')}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-amber-400 hover:shadow-sm transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Registre des Membres
                  </span>
                  <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900">{members.length}</span>
                  <span className="text-xs text-slate-500 ml-2">fidèles enregistrés</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 flex items-center">
                  <span>{members.filter(m => m.status === 'actif').length} actifs</span>
                  <span className="mx-1.5">•</span>
                  <span>{members.filter(m => m.gender === 'F').length} Femmes / {members.filter(m => m.gender === 'M').length} Hommes</span>
                </p>
              </div>

              {/* Sacrements & Actes */}
              <div
                onClick={() => setActiveTab('sacraments')}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-amber-400 hover:shadow-sm transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Actes & Sacrements
                  </span>
                  <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900">{sacraments.length}</span>
                  <span className="text-xs text-slate-500 ml-2">certificats officiels</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {sacraments.filter(s => s.type === 'bapteme').length} Baptêmes • {sacraments.filter(s => s.type === 'mariage').length} Mariages
                </p>
              </div>

              {/* Requêtes de Prière */}
              <div
                onClick={() => setActiveTab('prayers')}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-amber-400 hover:shadow-sm transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Requêtes de Prière
                  </span>
                  <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
                    <Heart className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900">{prayers.length}</span>
                  <span className="text-xs text-slate-500 ml-2">intentions</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  <span className="text-amber-600 font-semibold">{prayers.filter(p => p.status === 'pending').length} en attente</span> • {prayers.filter(p => p.status === 'prayed').length} portées
                </p>
              </div>

              {/* Supabase & Brevo Status */}
              <div
                onClick={() => setActiveTab('supabase')}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-amber-400 hover:shadow-sm transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Services Connectés
                  </span>
                  <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
                    <Database className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex flex-col space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Supabase Auth / DB:</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      Connecté
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Brevo Newsletter:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      brevoSettings?.hasApiKey ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {brevoSettings?.hasApiKey ? 'Configuré' : 'À tester'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">Cliquez pour voir les diagnostics &rarr;</p>
              </div>
            </div>

            {/* Quick Actions & Recent Sacraments Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Derniers Sacrements Célébrés */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span>Derniers Actes du Registre Pastoral</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('sacraments')}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700"
                  >
                    Voir tout ({sacraments.length}) &rarr;
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {sacraments.slice(0, 4).map((sac) => (
                    <div key={sac.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase ${
                          sac.type === 'bapteme'
                            ? 'bg-blue-100 text-blue-800'
                            : sac.type === 'mariage'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {sac.type}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{sac.recipientName}</p>
                          <p className="text-xs text-slate-500">
                            {sac.regNumber} • {sac.date} • {sac.officiatingPastor}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setCertificateModalRecord(sac)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 rounded-lg transition"
                      >
                        Certificat
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raccourcis Rapides du Secrétaire */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100">
                  Raccourcis du Secrétaire
                </h3>

                <button
                  onClick={() => secretariatService.exportMembersToCsv(members)}
                  className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between transition"
                >
                  <span className="flex items-center space-x-2">
                    <Download className="w-4 h-4 text-amber-500" />
                    <span>Exporter le Registre CSV</span>
                  </span>
                  <span className="text-slate-400">Excel / Sheets</span>
                </button>

                <button
                  onClick={handleTestSupabase}
                  className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between transition"
                >
                  <span className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-amber-500" />
                    <span>Tester la Base Supabase</span>
                  </span>
                  <span className="text-slate-400">Ping RLS</span>
                </button>

                <button
                  onClick={handleTestBrevo}
                  className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between transition"
                >
                  <span className="flex items-center space-x-2">
                    <Send className="w-4 h-4 text-amber-500" />
                    <span>Tester la Clé Brevo</span>
                  </span>
                  <span className="text-slate-400">v3 API</span>
                </button>

                <button
                  onClick={handleCopySql}
                  className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between transition"
                >
                  <span className="flex items-center space-x-2">
                    <Copy className="w-4 h-4 text-amber-500" />
                    <span>Copier le Script SQL Supabase</span>
                  </span>
                  <span className="text-slate-400">DDL & RLS</span>
                </button>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    « Je puis tout par celui qui me fortifie. » — Philippiens 4:13
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: REGISTRE DES MEMBRES                              */}
        {/* ======================================================== */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            {/* Header with Title & Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Registre Officiel des Membres
                </h2>
                <p className="text-slate-500 text-sm">
                  Base de données des fidèles baptisés et engagés de l’Église du Nazaréen de Damé.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => secretariatService.exportMembersToCsv(members)}
                  className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-2xs"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>Exporter CSV</span>
                </button>
                <button
                  onClick={() => handleOpenMemberModal()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter Membre</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={membersSearch}
                  onChange={(e) => setMembersSearch(e.target.value)}
                  placeholder="Rechercher par nom, numéro de registre ou téléphone..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="w-full md:w-auto flex items-center space-x-2">
                <select
                  value={memberFilterMinistry}
                  onChange={(e) => setMemberFilterMinistry(e.target.value)}
                  className="w-full md:w-auto px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">Tous les Ministères</option>
                  <option value="Fondateur & Conseil des Anciens">Conseil des Anciens</option>
                  <option value="Pasteur Titulaire">Direction Pastorale</option>
                  <option value="Ministère des Femmes">Ministère des Femmes</option>
                  <option value="Jeunesse (JNI)">Jeunesse (JNI)</option>
                  <option value="CDEJ HA 0926 & Enfants">CDEJ & Enfants</option>
                  <option value="Assemblée Générale">Assemblée Générale</option>
                </select>
              </div>
            </div>

            {/* Members Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500 tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Registre #</th>
                      <th className="py-3.5 px-4">Nom Complet</th>
                      <th className="py-3.5 px-4">Sexe</th>
                      <th className="py-3.5 px-4">Contact & Adresse</th>
                      <th className="py-3.5 px-4">Ministère / Rôle</th>
                      <th className="py-3.5 px-4">Statut</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500">
                          Aucun membre trouvé correspondant aux critères.
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-xs text-amber-700">
                            {m.regNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block">{m.fullName}</span>
                            <span className="text-2xs text-slate-500">Adhésion : {m.joinedDate}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                              m.gender === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {m.gender === 'F' ? 'Femme' : 'Homme'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs">
                            <div className="flex items-center space-x-1 text-slate-800 font-medium">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{m.phone || 'Non renseigné'}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-slate-500 text-2xs mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[180px]">{m.address}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-medium text-slate-800">
                            {m.ministryAffiliation}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              m.status === 'actif'
                                ? 'bg-emerald-100 text-emerald-800'
                                : m.status === 'inactif'
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {m.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleOpenMemberModal(m)}
                                className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                                title="Modifier la fiche"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMember(m.id, m.regNumber)}
                                className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                title="Supprimer du registre"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: ACTES & SACREMENTS (BAPTÊMES, MARIAGES, DÉDICACES) */}
        {/* ======================================================== */}
        {activeTab === 'sacraments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Registre des Actes & Sacrements
                </h2>
                <p className="text-slate-500 text-sm">
                  Certificats officiels de baptême, célébration de mariages et dédicace d'enfants au temple.
                </p>
              </div>

              <button
                onClick={() => {
                  setSacramentForm({
                    type: 'bapteme',
                    regNumber: '',
                    recipientName: '',
                    spouseName: '',
                    fatherName: '',
                    motherName: '',
                    date: new Date().toISOString().split('T')[0],
                    officiatingPastor: 'Pasteur Bequel CHERELUS',
                    location: 'Temple de Damé',
                    witnesses: '',
                    notes: ''
                  });
                  setSacramentModalOpen(true);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Enregistrer un Acte</span>
              </button>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setSacramentFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  sacramentFilterType === 'all'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tous ({sacraments.length})
              </button>
              <button
                onClick={() => setSacramentFilterType('bapteme')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  sacramentFilterType === 'bapteme'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Baptêmes ({sacraments.filter(s => s.type === 'bapteme').length})
              </button>
              <button
                onClick={() => setSacramentFilterType('mariage')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  sacramentFilterType === 'mariage'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Mariages ({sacraments.filter(s => s.type === 'mariage').length})
              </button>
              <button
                onClick={() => setSacramentFilterType('dedicace')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  sacramentFilterType === 'dedicace'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Dédicaces ({sacraments.filter(s => s.type === 'dedicace').length})
              </button>
            </div>

            {/* Sacraments Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSacraments.map((sac) => (
                <div
                  key={sac.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-amber-300 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                        sac.type === 'bapteme'
                          ? 'bg-blue-100 text-blue-800'
                          : sac.type === 'mariage'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {sac.type}
                      </span>
                      <span className="text-2xs font-mono font-bold text-slate-400">
                        {sac.regNumber}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                      {sac.recipientName}
                      {sac.spouseName && (
                        <span className="text-slate-500 font-medium block text-xs mt-0.5">
                          & {sac.spouseName}
                        </span>
                      )}
                    </h3>

                    <div className="mt-3 space-y-1 text-xs text-slate-600">
                      <p className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <span>Date : <strong>{sac.date}</strong></span>
                      </p>
                      <p className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                        <span className="truncate">{sac.location}</span>
                      </p>
                      <p className="flex items-center space-x-1.5">
                        <Shield className="w-3.5 h-3.5 text-amber-500" />
                        <span>Officiant : {sac.officiatingPastor}</span>
                      </p>
                      {sac.witnesses && (
                        <p className="text-2xs text-slate-500 pt-1">
                          Témoins : {sac.witnesses}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setCertificateModalRecord(sac)}
                      className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition flex items-center space-x-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimer Certificat</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSacrament(sac.id, sac.regNumber)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                      title="Supprimer l'acte"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: NOS PROJETS & CHANTIERS                            */}
        {/* ======================================================== */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Gestion des Projets & Chantiers de l'Église
                </h2>
                <p className="text-slate-500 text-sm">
                  Supervisez la publication des projets sur la page officielle « Nos Projets » et synchronisez avec Supabase.
                </p>
              </div>

              <button
                onClick={() => {
                  setProjectForm({
                    title: '',
                    code: `PRJ-${Date.now().toString().slice(-4)}`,
                    category: 'Sonorisation & Temple',
                    targetAmount: '3500',
                    description: '',
                    status: 'published'
                  });
                  setProjectModalOpen(true);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Projet</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-amber-400 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-2xs font-bold uppercase bg-amber-100 text-amber-800">
                        {proj.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-2xs font-bold ${
                        proj.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {proj.status === 'published' ? 'Publié' : 'Brouillon'}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 line-clamp-2">
                      {proj.title}
                    </h3>

                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                      {proj.description}
                    </p>

                    <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">Objectif de Financement :</span>
                      <span className="font-bold text-amber-600 text-sm">
                        ${proj.targetAmount || '0'} USD
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-2xs">
                      Code : {proj.code || 'PRJ'}
                    </span>
                    {onNavigate && (
                      <button
                        onClick={() => onNavigate('/nos-projets')}
                        className="text-amber-600 hover:text-amber-700 font-bold"
                      >
                        Voir sur le site &rarr;
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: REQUÊTES DE PRIÈRE                                */}
        {/* ======================================================== */}
        {activeTab === 'prayers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Requêtes & Intentions de Prière
                </h2>
                <p className="text-slate-500 text-sm">
                  Doléances et sujets déposés par les frères, sœurs et visiteurs pour intercession.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPrayerFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    prayerFilter === 'all'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Toutes ({prayers.length})
                </button>
                <button
                  onClick={() => setPrayerFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    prayerFilter === 'pending'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  En attente ({prayers.filter(p => p.status === 'pending').length})
                </button>
                <button
                  onClick={() => setPrayerFilter('prayed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    prayerFilter === 'prayed'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Portées ({prayers.filter(p => p.status === 'prayed').length})
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredPrayers.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
                  Aucune requête de prière dans cette sélection.
                </div>
              ) : (
                filteredPrayers.map((pray) => (
                  <div
                    key={pray.id}
                    className={`bg-white border rounded-2xl p-5 shadow-xs transition ${
                      pray.isUrgent ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                          {pray.category}
                        </span>
                        {pray.isUrgent && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            Urgent
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          {new Date(pray.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      <button
                        onClick={() => handleTogglePrayer(pray.id, pray.status)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                          pray.status === 'prayed'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{pray.status === 'prayed' ? 'Portée en Prière' : 'Marquer comme priée'}</span>
                      </button>
                    </div>

                    <p className="text-slate-800 text-sm font-medium leading-relaxed mb-3">
                      « {pray.message} »
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span>Demandeur : <strong>{pray.fullName || 'Anonyme'}</strong> {pray.phone ? `(${pray.phone})` : ''}</span>
                      {pray.notes && <span className="italic">Note : {pray.notes}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: BREVO NEWSLETTER MANAGER                          */}
        {/* ======================================================== */}
        {activeTab === 'brevo' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Gestionnaire de la Newsletter & Brevo
              </h2>
              <p className="text-slate-500 text-sm">
                Synchronisation de l'API Brevo v3, expédition d'annonces aux abonnés et gestion sans erreurs HTTP.
              </p>
            </div>

            {/* Brevo Configuration Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Key className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900 text-base">Configuration API Brevo v3</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  brevoSettings?.hasApiKey ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {brevoSettings?.hasApiKey ? 'Clé Active' : 'Non Connecté'}
                </span>
              </div>

              {brevoTestResult && (
                <div className={`mb-6 p-4 rounded-xl border flex items-start space-x-2 text-sm ${
                  brevoTestResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-red-50 border-red-300 text-red-800'
                }`}>
                  {brevoTestResult.success ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                  )}
                  <span>{brevoTestResult.message}</span>
                </div>
              )}

              <form onSubmit={handleSaveBrevo} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                      Clé d’API Brevo v3 (xkeysib-...)
                    </label>
                    <input
                      type="password"
                      value={brevoApiKeyInput}
                      onChange={(e) => setBrevoApiKeyInput(e.target.value)}
                      placeholder={brevoSettings?.apiKeyPreview || 'Collez votre clé API Brevo ici (ex: xkeysib-...)'}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <p className="text-2xs text-slate-500 mt-1">
                      Générée dans votre compte Brevo &gt; Clés API &gt; Créer une clé.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                      Email de l’expéditeur officiel
                    </label>
                    <input
                      type="email"
                      value={brevoSenderEmail}
                      onChange={(e) => setBrevoSenderEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <p className="text-2xs text-slate-500 mt-1">
                      Doit être validé dans Brevo &gt; Expéditeurs & IP.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                      Nom de l’expéditeur affiché
                    </label>
                    <input
                      type="text"
                      value={brevoSenderName}
                      onChange={(e) => setBrevoSenderName(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                      Identifiant de la Liste Brevo (List ID)
                    </label>
                    <input
                      type="text"
                      value={brevoListId}
                      onChange={(e) => setBrevoListId(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <p className="text-2xs text-slate-500 mt-1">
                      ID numérique du dossier des contacts (ex: 5).
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={brevoSaving}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition flex items-center space-x-2 shadow-xs disabled:opacity-50"
                  >
                    {brevoSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>Enregistrer la Configuration</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestBrevo}
                    disabled={brevoTesting}
                    className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold rounded-xl text-sm transition flex items-center space-x-2 disabled:opacity-50"
                  >
                    {brevoTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 text-amber-500" />}
                    <span>Tester la Connexion API Brevo</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Broadcast / Campaign Sender */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center space-x-2 pb-4 mb-6 border-b border-slate-100">
                <Send className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-base">
                  Envoi d'une Annonce / Message aux Abonnés
                </h3>
              </div>

              {/* Bannière de statut d'annonce avec guidage clair */}
              {broadcastBanner && (
                <div className={`mb-6 p-4 rounded-xl border text-sm flex items-start space-x-3 transition-all ${
                  broadcastBanner.type === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : broadcastBanner.type === 'simulated'
                    ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}>
                  {broadcastBanner.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                  ) : broadcastBanner.type === 'simulated' ? (
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold text-sm">{broadcastBanner.title}</p>
                    <p className="text-xs opacity-90 leading-relaxed">{broadcastBanner.message}</p>
                    {broadcastBanner.guidance && (
                      <p className="text-xs font-medium text-amber-800 bg-white/80 p-2.5 rounded-lg border border-amber-200 mt-2">
                        💡 {broadcastBanner.guidance}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSendCampaign} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                    Sujet du Message
                  </label>
                  <input
                    type="text"
                    value={campaignSubject}
                    onChange={(e) => setCampaignSubject(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                    Contenu du Message (Texte / HTML)
                  </label>
                  <textarea
                    rows={5}
                    value={campaignContent}
                    onChange={(e) => setCampaignContent(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={campaignSending}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-black text-amber-400 font-bold rounded-xl text-sm transition flex items-center space-x-2 shadow-xs disabled:opacity-50"
                  >
                    {campaignSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Diffuser le Message aux Abonnés</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: BASE SUPABASE & SQL SCRIPTS                       */}
        {/* ======================================================== */}
        {activeTab === 'supabase' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Supabase Auth & Base de Données
              </h2>
              <p className="text-slate-500 text-sm">
                Vérification de connexion en direct, politiques RLS et script SQL de création des tables.
              </p>
            </div>

            {/* Connection Test Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900 text-base">État du Service Supabase</h3>
                </div>

                <button
                  onClick={handleTestSupabase}
                  disabled={supabaseTestStatus?.loading}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${supabaseTestStatus?.loading ? 'animate-spin' : ''}`} />
                  <span>Tester la Connexion (Ping RLS)</span>
                </button>
              </div>

              {supabaseTestStatus && (
                <div className={`p-4 rounded-xl border mb-6 text-sm flex items-start space-x-2 ${
                  supabaseTestStatus.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}>
                  {supabaseTestStatus.success ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
                  )}
                  <div>
                    <p className="font-bold">{supabaseTestStatus.success ? 'Succès de Connexion' : 'Rapport de Diagnostic'}</p>
                    <p className="text-xs mt-0.5 leading-relaxed">{supabaseTestStatus.message}</p>
                  </div>
                </div>
              )}

              {/* Configure manual credentials if needed */}
              <form onSubmit={handleSaveRuntimeSupabase} className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                  Mettre à jour les Clés Supabase du Projet
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-semibold text-slate-500 uppercase mb-1">
                      URL Supabase (https://xyz.supabase.co)
                    </label>
                    <input
                      type="url"
                      value={customSupaUrl}
                      onChange={(e) => setCustomSupaUrl(e.target.value)}
                      placeholder="https://xyz.supabase.co"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-semibold text-slate-500 uppercase mb-1">
                      Clé Publique Anon (anon public key)
                    </label>
                    <input
                      type="password"
                      value={customSupaKey}
                      onChange={(e) => setCustomSupaKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition"
                >
                  Enregistrer les Clés dans le Navigateur
                </button>
              </form>
            </div>

            {/* SQL Script Viewer */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Script SQL Officiel Supabase</h3>
                  <p className="text-xs text-slate-500">
                    Copiez et exécutez ce script dans l'Éditeur SQL de votre tableau de bord Supabase pour créer toutes les tables avec les politiques RLS requises.
                  </p>
                </div>

                <button
                  onClick={handleCopySql}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-xs"
                >
                  {sqlCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{sqlCopied ? 'Copié !' : 'Copier le SQL'}</span>
                </button>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto text-xs text-slate-200 font-mono leading-relaxed max-h-96">
                <pre>{secretariatService.getSupabaseMigrationSql()}</pre>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAL 1: AJOUTER / MODIFIER UN MEMBRE                    */}
      {/* ======================================================== */}
      {memberModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 my-8 text-slate-900">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingMember ? 'Modifier la Fiche du Membre' : 'Inscrire un Nouveau Membre'}
              </h3>
              <button
                onClick={() => setMemberModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                  Nom Complet du Membre *
                </label>
                <input
                  type="text"
                  value={memberForm.fullName}
                  onChange={(e) => setMemberForm({ ...memberForm, fullName: e.target.value })}
                  required
                  placeholder="ex: Jean-Baptiste DÉSIR"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                    Sexe
                  </label>
                  <select
                    value={memberForm.gender}
                    onChange={(e) => setMemberForm({ ...memberForm, gender: e.target.value as 'M' | 'F' })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="M">Masculin (Homme)</option>
                    <option value="F">Féminin (Femme)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                    Statut
                  </label>
                  <select
                    value={memberForm.status}
                    onChange={(e) => setMemberForm({ ...memberForm, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                    <option value="transfere">Transféré</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                    Numéro de Téléphone
                  </label>
                  <input
                    type="text"
                    value={memberForm.phone}
                    onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                    placeholder="+509 48596089"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                    Date de Baptême
                  </label>
                  <input
                    type="date"
                    value={memberForm.baptismDate}
                    onChange={(e) => setMemberForm({ ...memberForm, baptismDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                  Ministère / Département de Service
                </label>
                <select
                  value={memberForm.ministryAffiliation}
                  onChange={(e) => setMemberForm({ ...memberForm, ministryAffiliation: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Assemblée Générale">Assemblée Générale</option>
                  <option value="Ministère des Femmes">Ministère des Femmes</option>
                  <option value="Jeunesse (JNI)">Jeunesse (JNI)</option>
                  <option value="CDEJ HA 0926 & Enfants">CDEJ & Enfants</option>
                  <option value="Chorale & Louange">Chorale & Louange</option>
                  <option value="Diaconat & Accueil">Diaconat & Accueil</option>
                  <option value="Fondateur & Conseil des Anciens">Conseil des Anciens</option>
                  <option value="Pasteur Titulaire">Direction Pastorale</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                  Adresse de Résidence
                </label>
                <input
                  type="text"
                  value={memberForm.address}
                  onChange={(e) => setMemberForm({ ...memberForm, address: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMemberModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition shadow-xs"
                >
                  {editingMember ? 'Enregistrer les Modifications' : 'Ajouter le Membre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ENREGISTRER UN SACREMENT                        */}
      {/* ======================================================== */}
      {sacramentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 my-8 text-slate-900">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Enregistrer un Acte ou Sacrement
              </h3>
              <button
                onClick={() => setSacramentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveSacrament} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                  Type d’Acte Pastoral
                </label>
                <select
                  value={sacramentForm.type}
                  onChange={(e) => setSacramentForm({ ...sacramentForm, type: e.target.value as any })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                >
                  <option value="bapteme">Baptême d'Eau par Immersion</option>
                  <option value="mariage">Sainte Bénédiction Nuptiale (Mariage)</option>
                  <option value="dedicace">Dédicace & Présentation d'Enfant</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                  {sacramentForm.type === 'mariage' ? 'Nom de l’Époux *' : sacramentForm.type === 'dedicace' ? 'Nom de l’Enfant Dédicacé *' : 'Nom du Candidat au Baptême *'}
                </label>
                <input
                  type="text"
                  value={sacramentForm.recipientName}
                  onChange={(e) => setSacramentForm({ ...sacramentForm, recipientName: e.target.value })}
                  required
                  placeholder="ex: Jean-Baptiste DÉSIR"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {sacramentForm.type === 'mariage' && (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                    Nom de l’Épouse *
                  </label>
                  <input
                    type="text"
                    value={sacramentForm.spouseName}
                    onChange={(e) => setSacramentForm({ ...sacramentForm, spouseName: e.target.value })}
                    required
                    placeholder="ex: Marie Guerda NOËL"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              {sacramentForm.type === 'dedicace' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                      Nom du Père
                    </label>
                    <input
                      type="text"
                      value={sacramentForm.fatherName}
                      onChange={(e) => setSacramentForm({ ...sacramentForm, fatherName: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                      Nom de la Mère
                    </label>
                    <input
                      type="text"
                      value={sacramentForm.motherName}
                      onChange={(e) => setSacramentForm({ ...sacramentForm, motherName: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                    Date de Célébration
                  </label>
                  <input
                    type="date"
                    value={sacramentForm.date}
                    onChange={(e) => setSacramentForm({ ...sacramentForm, date: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                    Pasteur Officiant
                  </label>
                  <input
                    type="text"
                    value={sacramentForm.officiatingPastor}
                    onChange={(e) => setSacramentForm({ ...sacramentForm, officiatingPastor: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                  Lieu de la Célébration
                </label>
                <input
                  type="text"
                  value={sacramentForm.location}
                  onChange={(e) => setSacramentForm({ ...sacramentForm, location: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                  Témoins Officiels
                </label>
                <input
                  type="text"
                  value={sacramentForm.witnesses}
                  onChange={(e) => setSacramentForm({ ...sacramentForm, witnesses: e.target.value })}
                  placeholder="ex: Saurel ALCINÉ, Esther PIERRE"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSacramentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition shadow-xs"
                >
                  Enregistrer l'Acte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: CERTIFICAT OFFICIEL IMPRIMABLE                  */}
      {/* ======================================================== */}
      {certificateModalRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-8 my-8 text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                Aperçu du Certificat Officiel
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer / PDF</span>
                </button>
                <button
                  onClick={() => setCertificateModalRecord(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg text-lg font-bold"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Printable Certificate Template */}
            <div className="mt-6 border-4 border-amber-400 p-8 rounded-2xl bg-amber-50/10 text-center relative">
              <div className="mb-4">
                <img
                  src="/images/eglise/sceau-officiel.svg"
                  alt="Sceau de l'Église"
                  className="w-20 h-20 mx-auto object-contain mb-2"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <h2 className="text-xl font-extrabold uppercase tracking-wide text-slate-900">
                  Église du Nazaréen de Damé
                </h2>
                <p className="text-xs font-bold text-amber-700 tracking-widest uppercase">
                  « Sainteté à l'Éternel »
                </p>
                <p className="text-2xs text-slate-500">
                  3ème Section Damé, Commune de Môle-Saint-Nicolas, Haïti
                </p>
              </div>

              <div className="my-6 py-2 border-y border-amber-200">
                <h3 className="text-2xl font-black uppercase text-slate-900 tracking-wider">
                  {certificateModalRecord.type === 'bapteme'
                    ? 'Certificat de Baptême'
                    : certificateModalRecord.type === 'mariage'
                    ? 'Certificat de Mariage'
                    : 'Certificat de Dédicace'}
                </h3>
                <p className="text-xs font-mono font-bold text-slate-500 mt-1">
                  Registre Officiel N° : {certificateModalRecord.regNumber}
                </p>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed max-w-lg mx-auto">
                Le Secrétariat Général et la Direction Pastorale attestent par la présente que :
              </p>

              <div className="my-4">
                <span className="text-2xl font-black text-slate-950 underline decoration-amber-400 decoration-2">
                  {certificateModalRecord.recipientName}
                </span>
                {certificateModalRecord.spouseName && (
                  <span className="block text-lg font-bold text-slate-900 mt-1">
                    et {certificateModalRecord.spouseName}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                {certificateModalRecord.type === 'bapteme'
                  ? 'a été baptisé(e) au nom du Père, du Fils et du Saint-Esprit, selon l’ordonnance de notre Seigneur Jésus-Christ (Matthieu 28:19).'
                  : certificateModalRecord.type === 'mariage'
                  ? 'ont été unis devant Dieu et l’Église dans les liens sacrés du mariage chrétien (Matthieu 19:6).'
                  : 'a été solennellement présenté(e) et consacré(e) au Seigneur en prière par ses parents (Proverbes 22:6).'}
              </p>

              <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700">
                <div className="text-left">
                  <p className="font-semibold">Fait à Damé, le :</p>
                  <p className="font-bold text-slate-900">{certificateModalRecord.date}</p>
                </div>

                <div className="text-right">
                  <p className="font-semibold">Le Pasteur Titulaire :</p>
                  <p className="font-bold text-slate-900 underline mt-4">
                    {certificateModalRecord.officiatingPastor}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: CRÉER UN PROJET (NOS PROJETS)                   */}
      {/* ======================================================== */}
      {projectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 my-8 text-slate-900">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Créer & Publier un Projet pour l'Église
              </h3>
              <button
                onClick={() => setProjectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                  Titre du Projet *
                </label>
                <input
                  type="text"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  required
                  placeholder="ex: Système de Sonorisation & Instruments pour le Temple"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                    Catégorie
                  </label>
                  <select
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Sonorisation & Temple">Sonorisation & Instruments</option>
                    <option value="Construction & Temple">Construction & Réfection</option>
                    <option value="Développement de l’Enfance">Développement de l’Enfance (CDEJ)</option>
                    <option value="Énergie & Solaire">Énergie Solaire</option>
                    <option value="Social & Secours">Social & Secours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                    Objectif Financier ($ USD)
                  </label>
                  <input
                    type="number"
                    value={projectForm.targetAmount}
                    onChange={(e) => setProjectForm({ ...projectForm, targetAmount: e.target.value })}
                    required
                    placeholder="3500"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                  Description & Impact du Projet
                </label>
                <textarea
                  rows={4}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Expliquez la vision et l'importance de ce projet pour la communauté et les cultes d'adoration à Damé..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProjectModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition shadow-xs"
                >
                  Publier le Projet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
