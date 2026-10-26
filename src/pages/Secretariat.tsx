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
  Info,
  Code
} from 'lucide-react';
import { authService, AdminUser } from '../services/authService';
import { secretariatService } from '../services/secretariatService';
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
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('eglisedunazareendedame@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // MEMBERS & DATA STATE
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

  // SACRAMENTS STATE
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

  // PROJECTS STATE (AVÈK TOUT NOUVO OPSYON YO)
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

  // PRAYERS STATE
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [prayerFilter, setPrayerFilter] = useState<'all' | 'pending' | 'prayed'>('all');

  // BREVO REAL CONFIG & CAMPAIGN
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

  // SUPABASE STATE
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<{ loading: boolean; success?: boolean; message?: string } | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [customSupaUrl, setCustomSupaUrl] = useState('');
  const [customSupaKey, setCustomSupaKey] = useState('');

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
      setMembers(memRes.data);

      const sacRes = await secretariatService.getSacraments();
      setSacraments(sacRes.data);

      const projList = await projectService.getProjects();
      setProjects(projList);

      const prayList = await secretariatService.getPrayerRequests();
      setPrayers(prayList);

      const brevo = await newsletterService.getBrevoSettings();
      if (brevo) {
        setBrevoSettings(brevo);
      }
    } catch (err) {
      console.error('Error loading data:', err);
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
    setLoginSubmitting(true);
    setLoginError('');
    try {
      const res = await authService.login(loginPassword, loginEmail);
      if (res.success) {
        setCurrentUser(authService.getUser());
        showToast('success', 'Bienvenue au Secrétariat Général.');
      } else {
        setLoginError(res.error || 'Identifiants invalides.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Erreur de connexion.');
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    showToast('info', 'Session terminée.');
  };

  // IMAJ SOTI NAN APARÈY OU
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('error', 'Fichiye imaj la twò gwo (mwens pase 2MB).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProjectForm(prev => ({ ...prev, imageUrl: reader.result as string }));
        showToast('success', 'Imaj chaje ak siksè !');
      };
      reader.readAsDataURL(file);
    }
  };

  // SOVE PROJET AK SIKSÈ
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title.trim()) {
      showToast('error', 'Titre projet a obligatwa.');
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
        showToast('success', 'Projet anrejistre epi pibliye ak siksè sou sit la !');
        setProjectModalOpen(false);
        const updatedList = await projectService.getProjects();
        setProjects(updatedList);
      } else {
        showToast('error', 'Echèk nan kreyasyon projet a.');
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
      showToast('error', 'Erreur: ' + err.message);
    }
  };

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

      showToast('success', 'Clé API ak konfigirasyon Brevo anregistre pou tout bon !');
    } catch (err: any) {
      showToast('error', 'Erreur lors de la sauvegarde: ' + err.message);
    } finally {
      setBrevoSaving(false);
    }
  };

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignSubject.trim() || !campaignContent.trim()) {
      showToast('error', 'Sujet ak kontni an obligatwa.');
      return;
    }

    const activeApiKey = brevoApiKeyInput.trim() || localStorage.getItem('dame_brevo_api_key');

    if (!activeApiKey) {
      showToast('error', 'Tanpri mete yon Clé API Brevo ki valid anvan ou voye imel la !');
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
        showToast('error', 'Okenn moun pa abòne nan lis la anko.');
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
        showToast('success', 'Reyèl imel voye bay tout abòne yo !');
        setCampaignSubject('');
        setCampaignContent('');
      } else {
        throw new Error(resData.message || 'Erreur API Brevo');
      }

    } catch (err: any) {
      setBroadcastBanner({
        type: 'warning',
        title: 'Erreur d’envoi Brevo',
        message: err.message || 'Enposib pou kontakte Brevo.'
      });
      showToast('error', 'Erreur Brevo: ' + err.message);
    } finally {
      setCampaignSending(false);
    }
  };

  const handleTestBrevo = async () => {
    setBrevoTesting(true);
    const activeApiKey = brevoApiKeyInput.trim() || localStorage.getItem('dame_brevo_api_key');

    if (!activeApiKey) {
      setBrevoTestResult({ success: false, message: 'Tanpri rantre yon Clé API Brevo.' });
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
          message: `Koneksyon Reysi ! Compte Brevo: ${data.email}`
        });
        showToast('success', 'Clé Brevo an mache 100% !');
      } else {
        setBrevoTestResult({ success: false, message: data.message || 'Clé invalide.' });
        showToast('error', 'Clé API Brevo pa bon.');
      }
    } catch (err: any) {
      setBrevoTestResult({ success: false, message: 'Erreur reseau: ' + err.message });
    } finally {
      setBrevoTesting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-slate-900">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Chargement du Secrétariat...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 text-slate-900">
        <div className="max-w-md w-full mx-auto my-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-slate-900">Secrétariat Général</h1>
            <p className="text-xs font-semibold text-amber-600 uppercase mt-1">Église du Nazaréen de Damé</p>
          </div>
          <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Mot de passe</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loginSubmitting}
                className="w-full py-3 bg-amber-500 font-bold rounded-xl text-slate-950"
              >
                {loginSubmitting ? 'Connexion...' : 'Se Connecter'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {feedbackMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm bg-amber-50 border-amber-300 text-amber-900">
          {feedbackMsg.text}
        </div>
      )}

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-extrabold text-lg">Secrétariat Général - Damé</span>
          <button onClick={handleLogout} className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded-lg">
            Quitter
          </button>
        </div>
        <nav className="flex space-x-2 px-4 py-2 border-t overflow-x-auto">
          {(['dashboard', 'members', 'sacraments', 'projects', 'prayers', 'brevo', 'supabase'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${
                activeTab === tab ? 'bg-amber-500 text-slate-950' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab === 'projects' ? `Nos Projets (${projects.length})` : tab}
            </button>
          ))}
        </nav>
      </header>

      {/* CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        
        {/* TAB: PROJECTS (AVÈK TOUT OPSYON OU Mande YO) */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Gestion des Projets & Chantiers</h2>
                <p className="text-sm text-slate-600 mt-1">Publiez et gérez les projets de l'église avec description texte/HTML et images locales.</p>
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
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1 shadow-xs"
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

        {/* TAB: BREVO */}
        {activeTab === 'brevo' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Envoi Réel d’Annonce par Email</h2>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
              <h3 className="font-bold text-base mb-4">1. Configuration API Brevo</h3>
              {brevoTestResult && (
                <div className={`p-3 rounded-xl text-xs mb-4 ${brevoTestResult.success ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                  {brevoTestResult.message}
                </div>
              )}
              <form onSubmit={handleSaveBrevo} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Clé d'API Brevo v3 (xkeysib-...)</label>
                  <input
                    type="password"
                    value={brevoApiKeyInput}
                    onChange={(e) => setBrevoApiKeyInput(e.target.value)}
                    placeholder="Collez votre vraie clé Brevo ici"
                    className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email Expéditeur</label>
                    <input
                      type="email"
                      value={brevoSenderEmail}
                      onChange={(e) => setBrevoSenderEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Nom Expéditeur</label>
                    <input
                      type="text"
                      value={brevoSenderName}
                      onChange={(e) => setBrevoSenderName(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm"
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button type="submit" disabled={brevoSaving} className="px-4 py-2 bg-amber-500 font-bold rounded-xl text-xs">
                    Sauvegarder la Clé
                  </button>
                  <button type="button" onClick={handleTestBrevo} disabled={brevoTesting} className="px-4 py-2 bg-slate-100 font-semibold rounded-xl text-xs">
                    Tester la Clé
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
              <h3 className="font-bold text-base mb-4">2. Diffuser un vrai Email aux Abonnés</h3>
              {broadcastBanner && (
                <div className={`p-4 rounded-xl text-sm mb-4 ${broadcastBanner.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-amber-50 text-amber-900 border border-amber-300'}`}>
                  <p className="font-bold">{broadcastBanner.title}</p>
                  <p className="text-xs mt-1">{broadcastBanner.message}</p>
                </div>
              )}
              <form onSubmit={handleSendCampaign} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Sujet du Message</label>
                  <input
                    type="text"
                    value={campaignSubject}
                    onChange={(e) => setCampaignSubject(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Contenu de l’Annonce</label>
                  <textarea
                    rows={5}
                    value={campaignContent}
                    onChange={(e) => setCampaignContent(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={campaignSending}
                  className="px-6 py-3 bg-slate-900 text-amber-400 font-bold rounded-xl text-sm flex items-center space-x-2"
                >
                  {campaignSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Voye Imel Reyèl la Kounye a</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl">
            <h2 className="text-xl font-bold">Aperçu du Tableau de Bord</h2>
            <p className="text-sm text-slate-600 mt-1">Sèvi ak meni ki anlè yo pou jere paj yo.</p>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="p-6 bg-white border rounded-2xl shadow-xs">
            <h2 className="text-xl font-bold">Registre des Membres ({members.length})</h2>
          </div>
        )}

        {activeTab === 'sacraments' && (
          <div className="p-6 bg-white border rounded-2xl shadow-xs">
            <h2 className="text-xl font-bold">Actes & Sacrements ({sacraments.length})</h2>
          </div>
        )}

        {activeTab === 'prayers' && (
          <div className="p-6 bg-white border rounded-2xl shadow-xs">
            <h2 className="text-xl font-bold">Requêtes de Prière ({prayers.length})</h2>
          </div>
        )}

        {activeTab === 'supabase' && (
          <div className="p-6 bg-white border rounded-2xl shadow-xs">
            <h2 className="text-xl font-bold">Base Supabase & SQL</h2>
          </div>
        )}
      </main>

      {/* MODAL KREYASYON PROJET */}
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
