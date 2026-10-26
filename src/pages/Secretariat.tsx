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

  // PROJECTS STATE
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

  // ----------------------------------------------------
  // ANREJISTRE CLE REYÈL LA AK SENDER AN
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

      showToast('success', 'Clé API ak konfigirasyon Brevo anregistre pou tout bon !');
    } catch (err: any) {
      showToast('error', 'Erreur lors de la sauvegarde: ' + err.message);
    } finally {
      setBrevoSaving(false);
    }
  };

  // ----------------------------------------------------
  // ENVOI REYÈL AK BREVO API (DIRECT SMTP/TRANSACTIONS)
  // ----------------------------------------------------
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
      // 1. Chache tout moun ki abòne nan newsletter a
      const subscribers = await newsletterService.getSubscribers();
      const recipientsList = subscribers
        .filter(s => s.isActive)
        .map(s => ({ email: s.email }));

      if (recipientsList.length === 0) {
        showToast('error', 'Okenn moun pa abòne nan lis la anko.');
        setCampaignSending(false);
        return;
      }

      // 2. Apèl API dirèk bay Sèvè Brevo
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
          message: `Mesaj la pati nan bwat imel ${recipientsList.length} abòne yo. (ID Brevo: ${resData.messageId || 'OK'})`
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
        message: err.message || 'Enposib pou kontakte Brevo. Tcheke si clé API a ak ekspeditè a bon.',
        guidance: 'Aswitew ke imel expéditeur a (eglisedunazareendedame@gmail.com) konfime nan kont Brevo w la.'
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
      setBrevoTestResult({ success: false, message: 'Tanpri rantre yon Clé API Brevo prensipal.' });
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
          message: `Koneksyon Reysi ! Compte Brevo: ${data.email} (${data.companyName || 'Actif'})`
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

  // MEMBER, SACRAMENT, PROJECT MODALS & RENDER LOGIC
  const handleOpenMemberModal = (member?: MemberRecord) => {
    if (member) {
      setEditingMember(member);
      setMemberForm({ ...member, email: member.email || '', baptismDate: member.baptismDate || '' });
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
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {/* CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'brevo' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Envoi Réel d’Annonce par Email</h2>

            {/* CONFIGURATION FORM */}
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

            {/* REAL EMAIL SENDER FORM */}
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
      </main>
    </div>
  );
};
