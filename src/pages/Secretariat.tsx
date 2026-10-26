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
  Key,
  Flame,
  Code
} from 'lucide-react';
import { authService, AdminUser } from '../services/authService';
import { secretariatService, INITIAL_MEMBERS, INITIAL_SACRAMENTS } from '../services/secretariatService';
import { newsletterService } from '../services/newsletterService';
import { projectService } from '../services/projectService';
import { testSupabaseConnection, setRuntimeSupabaseCredentials } from '../services/supabaseClient';
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
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [projectSubmitting, setProjectSubmitting] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    code: '',
    category: 'Construction & Temple',
    targetAmount: '5000',
    currentAmount: '0',
    fundingStatus: 'seeking' as 'seeking' | 'funded',
    showDonateButton: true,
    summary: '',
    description: '',
    imageUrl: '',
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
  const [brevoApiKeyInput, setBrevoApiKeyInput] = useState(localStorage.getItem('dame_brevo_api_key') || '');
  const [brevoSenderEmail, setBrevoSenderEmail] = useState(localStorage.getItem('dame_brevo_sender_email') || 'eglisedunazareendedame@gmail.com');
  const [brevoSenderName, setBrevoSenderName] = useState(localStorage.getItem('dame_brevo_sender_name') || 'Église du Nazaréen de Damé');
  const [brevoListId, setBrevoListId] = useState(localStorage.getItem('dame_brevo_list_id') || '5');
  const [brevoTesting, setBrevoTesting] = useState(false);
  const [brevoSaving, setBrevoSaving] = useState(false);
  const [brevoTestResult, setBrevoTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [campaignSubject, setCampaignSubject] = useState('Annonce Officielle - Église du Nazaréen de Damé');
  const [campaignContent, setCampaignContent] = useState(
    'Chers frères et sœurs,\n\nNous vous remercions pour votre fidélité et votre engagement envers le Seigneur et l’Église de Damé.\n\nQue Dieu vous bénisse abondamment !\n« Sainteté à l’Éternel »'
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

  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser]);

  const loadAllData = async () => {
    setMembersLoading(true);
    setProjectsLoading(true);

    try {
      const memRes = await secretariatService.getMembers();
      setMembers(memRes.data || INITIAL_MEMBERS);

      const sacRes = await secretariatService.getSacraments();
      setSacraments(sacRes.data || INITIAL_SACRAMENTS);

      const projList = await projectService.getProjects();
      setProjects(projList || []);

      const prayList = await secretariatService.getPrayerRequests();
      setPrayers(prayList || []);

      const brevo = await newsletterService.getBrevoSettings();
      if (brevo) {
        setBrevoSettings(brevo);
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
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('error', 'Imaj la twò gwo (chwazi yon imaj ki mwens pase 2MB).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProjectForm(prev => ({ ...prev, imageUrl: reader.result as string }));
        showToast('success', 'Imaj aparèy ou an chaje ak siksè !');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title.trim()) {
      showToast('error', 'Le titre du projet est obligatoire.');
      return;
    }

    setProjectSubmitting(true);
    try {
      const generatedCode = projectForm.code.trim() || `PRJ-${Date.now().toString().slice(-4)}`;
      const defaultImg = projectForm.imageUrl.trim() || '/images/eglise/sound-system.jpg';

      const created = await projectService.createProject({
        title: projectForm.title.trim(),
        code: generatedCode,
        category: projectForm.category,
        summary: projectForm.summary || projectForm.title,
        description: projectForm.description,
        targetAmount: projectForm.targetAmount,
        currentAmount: projectForm.currentAmount,
        status: projectForm.status,
        author: currentUser?.name || 'Secrétariat Général',
        partner: projectForm.fundingStatus === 'funded' ? 'Financé / Équipé' : 'En recherche de fonds',
        images: [defaultImg]
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
    } finally {
      setProjectSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce projet ?')) return;
    try {
      await projectService.deleteProject(id);
      showToast('info', 'Projet retiré avec succès.');
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      showToast('error', 'Erreur de suppression: ' + err.message);
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
  // BREVO ACTIONS
  // ----------------------------------------------------
  const handleSaveBrevo = async (e: React.FormEvent) => {
    e.preventDefault();
    setBrevoSaving(true);
    try {
      const apiKey = brevoApiKeyInput.trim();
      if (apiKey) {
        localStorage.setItem('dame_brevo_api_key', apiKey);
      }
      localStorage.setItem('dame_brevo_sender_email', brevoSenderEmail.trim());
      localStorage.setItem('dame_brevo_sender_name', brevoSenderName.trim());
      localStorage.setItem('dame_brevo_list_id', brevoListId.trim());

      setBrevoSettings({
        hasApiKey: true,
        apiKeyPreview: apiKey ? '••••••••••••••••' : undefined,
        senderEmail: brevoSenderEmail.trim(),
        senderName: brevoSenderName.trim(),
        brevoListId: brevoListId.trim()
      });

      showToast('success', 'Configuration Brevo enregistrée avec succès !');
    } catch (err: any) {
      showToast('error', 'Erreur de sauvegarde: ' + err.message);
    } finally {
      setBrevoSaving(false);
    }
  };

  const handleTestBrevo = async () => {
    setBrevoTesting(true);
    setBrevoTestResult(null);
    const activeApiKey = brevoApiKeyInput.trim() || localStorage.getItem('dame_brevo_api_key');

    if (!activeApiKey) {
      setBrevoTestResult({ success: false, message: 'Veuillez entrer une clé d’API Brevo.' });
      setBrevoTesting(false);
      return;
    }

    try {
      const res = await fetch('https://api.brevo.com/v3/account', {
        headers: { 'api-key': activeApiKey }
      });
      const data = await res.json();

      if (res.ok) {
        setBrevoTestResult({
          success: true,
          message: `Connexion Réussie ! Compte: ${data.email} (${data.companyName || 'Actif'})`
        });
        showToast('success', 'Connexion API Brevo validée !');
      } else {
        setBrevoTestResult({ success: false, message: data.message || 'Clé API Invalide.' });
        showToast('error', 'Clé API Invalide.');
      }
    } catch (err: any) {
      setBrevoTestResult({ success: false, message: 'Erreur réseau: ' + err.message });
      showToast('error', 'Erreur réseau.');
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

    const activeApiKey = brevoApiKeyInput.trim() || localStorage.getItem('dame_brevo_api_key');

    if (!activeApiKey) {
      showToast('error', 'Veuillez configurer une clé API Brevo valide avant l’envoi !');
      return;
    }

    setCampaignSending(true);
    setBroadcastBanner(null);

    try {
      const subscribers = await newsletterService.getSubscribers();
      const recipientsList = subscribers
        .filter(s => s.isActive)
        .map(s => ({ email: s.email }));

      if (recipientsList.length === 0) {
        showToast('error', 'Aucun abonné actif trouvé dans la liste.');
        setCampaignSending(false);
        return;
      }

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': activeApiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: brevoSenderName,
            email: brevoSenderEmail
          },
          to: recipientsList,
          subject: campaignSubject,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc;">
              <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <h2 style="color: #d97706; margin-top: 0;">${brevoSenderName}</h2>
                <div style="font-size: 15px; line-height: 1.6; color: #334155; white-space: pre-wrap;">${campaignContent}</div>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
                <p style="font-size: 12px; color: #64748b; text-align: center;">
                  « Sainteté à l’Éternel » — 3ème Section Damé, Môle-Saint-Nicolas, Haïti.
                </p>
              </div>
            </div>
          `
        })
      });

      const resData = await response.json();

      if (response.ok) {
        setBroadcastBanner({
          type: 'success',
          title: '✅ Imel voye vre ak siksè !',
          message: `Mesaj la pati nan bwat imel ${recipientsList.length} abòne yo.`
        });
        showToast('success', 'Message envoyé avec succès !');
        setCampaignSubject('');
        setCampaignContent('');
      } else {
        throw new Error(resData.message || 'Erreur API Brevo');
      }

    } catch (err: any) {
      setBroadcastBanner({
        type: 'warning',
        title: 'Erreur d’envoi Brevo',
        message: err.message || 'Impossible de contacter Brevo.'
      });
      showToast('error', 'Erreur Brevo: ' + err.message);
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
      showToast('success', 'Identifiants Supabase configurés !');
      handleTestSupabase();
    } else {
      showToast('error', 'URL ou clé invalide.');
    }
  };

  // FILTERED LISTS
  const filteredMembers = members.filter(m => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(membersSearch.toLowerCase()) ||
      m.regNumber.toLowerCase().includes(membersSearch.toLowerCase()) ||
      m.phone.includes(membersSearch);
    const matchesMinistry = memberFilterMinistry === 'all' || m.ministryAffiliation === memberFilterMinistry;
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-slate-900">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Chargement du Secrétariat Général...</p>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 text-slate-900">
        <div className="max-w-md w-full mx-auto my-auto">
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
          </div>

          <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-amber-500" />
                <span className="font-semibold text-slate-900 text-sm sm:text-base">Connexion Sécurisée</span>
              </div>
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
                  Email Administrateur
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
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
          </div>
        </div>
      </div>
    );
  }

  // MAIN PORTAL VIEW
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {feedbackMsg && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center space-x-2 ${
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

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
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
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight block">
                  Secrétariat Général
                </span>
                <p className="text-xs text-slate-500 font-medium truncate">
                  Église du Nazaréen de Damé • « Sainteté à l’Éternel »
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {onNavigate && (
                <button
                  onClick={() => onNavigate('/')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 inline mr-1" />
                  Site Public
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition flex items-center space-x-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Quitter</span>
              </button>
            </div>
          </div>

          {/* TABS */}
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-slate-100">
            {[
              { id: 'dashboard', icon: Flame, label: 'Tableau de Bord' },
              { id: 'members', icon: Users, label: `Membres (${members.length})` },
              { id: 'sacraments', icon: Award, label: `Sacrements (${sacraments.length})` },
              { id: 'projects', icon: Briefcase, label: `Nos Projets (${projects.length})` },
              { id: 'prayers', icon: Heart, label: `Prières (${prayers.length})` },
              { id: 'brevo', icon: Send, label: 'Newsletter Brevo' },
              { id: 'supabase', icon: Database, label: 'Base Supabase' }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900 mb-2">
                  Session Active • {currentUser.name}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Bienvenue dans l'espace pastoral & administratif
                </h2>
                <p className="text-slate-600 text-sm mt-1 max-w-2xl">
                  Gérez les fiches des membres, actes pastoraux, projets de l'église et communications Brevo.
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
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div onClick={() => setActiveTab('members')} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-amber-400 transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500">Membres</span>
                  <Users className="w-5 h-5 text-amber-600" />
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900">{members.length}</span>
                </div>
              </div>

              <div onClick={() => setActiveTab('sacraments')} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-amber-400 transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500">Sacrements</span>
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900">{sacraments.length}</span>
                </div>
              </div>

              <div onClick={() => setActiveTab('projects')} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-amber-400 transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500">Nos Projets</span>
                  <Briefcase className="w-5 h-5 text-amber-600" />
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900">{projects.length}</span>
                </div>
              </div>

              <div onClick={() => setActiveTab('prayers')} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-amber-400 transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500">Prières</span>
                  <Heart className="w-5 h-5 text-amber-600" />
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900">{prayers.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MEMBERS */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900">Registre Officiel des Membres</h2>
              <button
                onClick={() => handleOpenMemberModal()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter Membre</span>
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-3.5 px-4">Registre #</th>
                    <th className="py-3.5 px-4">Nom Complet</th>
                    <th className="py-3.5 px-4">Sexe</th>
                    <th className="py-3.5 px-4">Téléphone</th>
                    <th className="py-3.5 px-4">Ministère</th>
                    <th className="py-3.5 px-4">Statut</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-amber-700">{m.regNumber}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{m.fullName}</td>
                      <td className="py-3.5 px-4">{m.gender === 'F' ? 'Femme' : 'Homme'}</td>
                      <td className="py-3.5 px-4">{m.phone}</td>
                      <td className="py-3.5 px-4">{m.ministryAffiliation}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button onClick={() => handleDeleteMember(m.id, m.regNumber)} className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SACRAMENTS */}
        {activeTab === 'sacraments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900">Registre des Actes & Sacrements</h2>
              <button
                onClick={() => setSacramentModalOpen(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Enregistrer un Acte</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sacraments.map((sac) => (
                <div key={sac.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase bg-blue-100 text-blue-800">
                    {sac.type}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 mt-2">{sac.recipientName}</h3>
                  <p className="text-xs text-slate-500 mt-1">Date: {sac.date} • {sac.officiatingPastor}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: NOS PROJETS */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Gestion des Projets & Chantiers</h2>
                <p className="text-slate-500 text-sm">Publiez et gérez les projets de l'église avec description texte/HTML, images locales et options de don.</p>
              </div>
              <button
                onClick={() => {
                  setProjectForm({
                    title: '',
                    code: `PRJ-${Date.now().toString().slice(-4)}`,
                    category: 'Sonorisation & Temple',
                    targetAmount: '3500',
                    currentAmount: '0',
                    fundingStatus: 'seeking',
                    showDonateButton: true,
                    summary: '',
                    description: '',
                    imageUrl: '',
                    status: 'published'
                  });
                  setIsHtmlMode(false);
                  setProjectModalOpen(true);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Projet</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.length === 0 ? (
                <div className="col-span-3 p-12 bg-white border border-slate-200 rounded-2xl text-center text-slate-500">
                  Aucun projet enregistré. Klike sou "Nouveau Projet" pou ajoute youn.
                </div>
              ) : (
                projects.map((proj) => (
                  <div key={proj.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      {proj.images?.[0] && (
                        <img src={proj.images[0]} alt={proj.title} className="w-full h-40 object-cover rounded-xl mb-3 border" />
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-2xs font-bold uppercase bg-amber-100 text-amber-800">{proj.category}</span>
                        <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-emerald-100 text-emerald-800">{proj.status}</span>
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900">{proj.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{proj.summary || proj.description}</p>
                      
                      <div className="mt-4 p-3 rounded-xl bg-slate-50 border flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600">Objectif :</span>
                        <span className="font-bold text-amber-600">${proj.targetAmount || '0'} USD</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t flex items-center justify-between text-xs">
                      {onNavigate && (
                        <button onClick={() => onNavigate('/nos-projets')} className="text-amber-600 font-bold hover:underline">
                          Voir sur le site &rarr;
                        </button>
                      )}
                      <button onClick={() => handleDeleteProject(proj.id)} className="text-red-600 p-1 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: PRAYERS */}
        {activeTab === 'prayers' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Requêtes de Prière</h2>
            <div className="space-y-4">
              {filteredPrayers.map((pray) => (
                <div key={pray.id} className="bg-white border rounded-2xl p-5 shadow-xs">
                  <p className="text-slate-800 text-sm font-medium">« {pray.message} »</p>
                  <span className="text-xs text-slate-500 block mt-2">Demandeur: {pray.fullName || 'Anonyme'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: BREVO */}
        {activeTab === 'brevo' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Newsletter Brevo</h2>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <form onSubmit={handleSaveBrevo} className="space-y-4">
                <input
                  type="password"
                  value={brevoApiKeyInput}
                  onChange={(e) => setBrevoApiKeyInput(e.target.value)}
                  placeholder="Clé d’API Brevo v3"
                  className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm"
                />
                <button type="submit" className="px-4 py-2 bg-amber-500 font-bold rounded-xl text-xs">
                  Enregistrer Brevo
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 7: SUPABASE */}
        {activeTab === 'supabase' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Base Supabase & SQL</h2>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <button onClick={handleTestSupabase} className="px-4 py-2 bg-amber-500 font-bold rounded-xl text-xs">
                Tester la Connexion (Ping RLS)
              </button>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: MEMBRE */}
      {memberModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border shadow-2xl max-w-lg w-full p-6 text-slate-900">
            <h3 className="text-lg font-bold mb-4">{editingMember ? 'Modifier Membre' : 'Inscrire Membre'}</h3>
            <form onSubmit={handleSaveMember} className="space-y-4">
              <input
                type="text"
                value={memberForm.fullName}
                onChange={(e) => setMemberForm({ ...memberForm, fullName: e.target.value })}
                placeholder="Nom complet"
                required
                className="w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-sm"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setMemberModalOpen(false)} className="px-4 py-2 text-xs">Annuler</button>
                <button type="submit" className="px-5 py-2 text-xs font-bold bg-amber-500 rounded-xl">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PROJET */}
      {projectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border shadow-2xl max-w-xl w-full p-6 sm:p-8 my-8 text-slate-900">
            <div className="flex items-center justify-between pb-4 mb-4 border-b">
              <h3 className="text-lg font-bold text-slate-900">Créer & Publier un Projet</h3>
              <button onClick={() => setProjectModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">&times;</button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Titre du Projet *</label>
                <input
                  type="text"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  required
                  placeholder="ex: Système de Sonorisation"
                  className="w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Catégorie</label>
                  <select
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-sm"
                  >
                    <option value="Sonorisation & Temple">Sonorisation & Instruments</option>
                    <option value="Construction & Temple">Construction & Réfection</option>
                    <option value="Développement de l’Enfance">Développement de l’Enfance (CDEJ)</option>
                    <option value="Énergie & Solaire">Énergie Solaire</option>
                    <option value="Social & Secours">Social & Secours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Objectif ($ USD)</label>
                  <input
                    type="number"
                    value={projectForm.targetAmount}
                    onChange={(e) => setProjectForm({ ...projectForm, targetAmount: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-700">Statut du Financement</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="fundingStatus"
                      checked={projectForm.fundingStatus === 'seeking'}
                      onChange={() => setProjectForm({ ...projectForm, fundingStatus: 'seeking' })}
                      className="text-amber-500"
                    />
                    <span>En recherche de fonds</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="fundingStatus"
                      checked={projectForm.fundingStatus === 'funded'}
                      onChange={() => setProjectForm({ ...projectForm, fundingStatus: 'funded' })}
                      className="text-amber-500"
                    />
                    <span>Déjà Financé / Équipé</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
                <div>
                  <span className="block text-xs font-bold text-amber-900">Afficher le bouton de Don ?</span>
                  <span className="text-2xs text-amber-700">Dirige vers la page /dimes-et-offrandes</span>
                </div>
                <input
                  type="checkbox"
                  checked={projectForm.showDonateButton}
                  onChange={(e) => setProjectForm({ ...projectForm, showDonateButton: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Photo du Projet (Stockage Local)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-900 cursor-pointer"
                />
                {projectForm.imageUrl && (
                  <img src={projectForm.imageUrl} alt="Preview" className="mt-2 h-24 rounded-lg border object-cover" />
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase text-slate-700">Description du Projet</label>
                  <button
                    type="button"
                    onClick={() => setIsHtmlMode(!isHtmlMode)}
                    className={`px-2.5 py-1 rounded-lg text-2xs font-bold flex items-center space-x-1 transition ${
                      isHtmlMode ? 'bg-slate-900 text-amber-400' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Code className="w-3 h-3" />
                    <span>{isHtmlMode ? 'Mode Kòd HTML Active' : 'Passer en Mode HTML'}</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder={isHtmlMode ? "<b>HTML code...</b>" : "Deskripsyon pwojè a..."}
                  className="w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-sm font-mono"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t">
                <button type="button" onClick={() => setProjectModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Annuler</button>
                <button type="submit" disabled={projectSubmitting} className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-xs">
                  {projectSubmitting ? 'Enregistrement...' : 'Publier le Projet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
