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
  Code,
  DollarSign
} from 'lucide-react';
import { authService, AdminUser } from '../services/authService';
import { secretariatService, INITIAL_MEMBERS, INITIAL_SACRAMENTS } from '../services/secretariatService';
import { newsletterService } from '../services/newsletterService';
import { projectService } from '../services/projectService';
import { testSupabaseConnection } from '../services/supabaseClient';
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

  // DATA STATES
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [sacraments, setSacraments] = useState<SacramentRecord[]>([]);
  const [projects, setProjects] = useState<ManagedProject[]>([]);
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);

  // MEMBERS FILTER & MODAL
  const [membersSearch, setMembersSearch] = useState('');
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [memberForm, setMemberForm] = useState({
    fullName: '',
    gender: 'M' as 'M' | 'F',
    phone: '',
    email: '',
    address: '3ème Section Damé',
    baptismDate: '',
    ministryAffiliation: 'Assemblée Générale',
    status: 'actif' as 'actif' | 'inactif' | 'transfere'
  });

  // PROJECT FORM STATE
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

  // BREVO STATE
  const [brevoApiKeyInput, setBrevoApiKeyInput] = useState(localStorage.getItem('dame_brevo_api_key') || '');
  const [brevoSenderEmail, setBrevoSenderEmail] = useState(localStorage.getItem('dame_brevo_sender_email') || 'eglisedunazareendedame@gmail.com');
  const [brevoSenderName, setBrevoSenderName] = useState(localStorage.getItem('dame_brevo_sender_name') || 'Église du Nazaréen de Damé');
  const [campaignSubject, setCampaignSubject] = useState('Annonce Officielle - Église de Damé');
  const [campaignContent, setCampaignContent] = useState('Chers frères et sœurs,\n\nQue Dieu vous bénisse !\n« Sainteté à l’Éternel »');
  const [campaignSending, setCampaignSending] = useState(false);

  useEffect(() => {
    async function initAuth() {
      setAuthLoading(true);
      try {
        const user = await authService.checkSupabaseSession();
        if (user) setCurrentUser(user);
      } catch (err) {
        console.warn('Auth check error:', err);
      } finally {
        setAuthLoading(false);
      }
    }
    initAuth();
  }, []);

  useEffect(() => {
    if (currentUser) loadAllData();
  }, [currentUser]);

  const loadAllData = async () => {
    try {
      const memRes = await secretariatService.getMembers();
      setMembers(memRes.data || INITIAL_MEMBERS);

      const sacRes = await secretariatService.getSacraments();
      setSacraments(sacRes.data || INITIAL_SACRAMENTS);

      const projList = await projectService.getProjects();
      setProjects(projList || []);

      const prayList = await secretariatService.getPrayerRequests();
      setPrayers(prayList || []);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

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

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title.trim()) {
      showToast('error', 'Titre projet a obligatwa.');
      return;
    }

    setProjectSubmitting(true);
    try {
      const generatedCode = projectForm.code.trim() || `PRJ-${Date.now().toString().slice(-5)}`;
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
        showToast('success', 'Projet pibliye ak siksè !');
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
      showToast('info', 'Projet retiré.');
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      showToast('error', 'Erreur: ' + err.message);
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
      <div className="min-h-screen bg-white flex flex-col justify-between py-12 px-4 text-slate-900">
        <div className="max-w-md w-full mx-auto my-auto bg-white border border-slate-200 shadow-md rounded-2xl p-6">
          <h1 className="text-2xl font-extrabold text-center text-slate-900 mb-6">Connexion Secrétariat</h1>
          {loginError && <p className="mb-4 text-xs text-red-600 bg-red-50 p-2 rounded">{loginError}</p>}
          <form onSubmit={async (e) => {
            e.preventDefault();
            setLoginSubmitting(true);
            const res = await authService.login(loginPassword, loginEmail);
            if (res.success) setCurrentUser(authService.getUser());
            else setLoginError(res.error || 'Erreur de connexion');
            setLoginSubmitting(false);
          }} className="space-y-4">
            <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm" placeholder="Email" />
            <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm" placeholder="Mot de passe" />
            <button type="submit" disabled={loginSubmitting} className="w-full py-3 bg-amber-500 font-bold rounded-xl text-slate-950">Se Connecter</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {feedbackMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-bold bg-amber-50 border-amber-300 text-amber-900">
          {feedbackMsg.text}
        </div>
      )}

      {/* HEADER & TABS */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-amber-500" />
            <span className="font-extrabold text-base sm:text-lg">Secrétariat Général — Église de Damé</span>
          </div>
          <div className="flex items-center space-x-3">
            {onNavigate && (
              <button onClick={() => onNavigate('/')} className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg">
                Site Public
              </button>
            )}
            <button onClick={() => { authService.logout(); setCurrentUser(null); }} className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg">
              Quitter
            </button>
          </div>
        </div>
        <nav className="flex space-x-2 px-4 py-2 border-t overflow-x-auto bg-slate-50">
          {[
            { id: 'dashboard', label: 'Tableau de Bord' },
            { id: 'members', label: `Membres (${members.length})` },
            { id: 'sacraments', label: `Sacrements (${sacraments.length})` },
            { id: 'projects', label: `Nos Projets (${projects.length})` },
            { id: 'prayers', label: `Prières (${prayers.length})` },
            { id: 'brevo', label: 'Newsletter Brevo' },
            { id: 'supabase', label: 'Base Supabase' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab.id ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        
        {/* TAB 1: TABLEAU DE BORD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-8">
              <h2 className="text-2xl font-black text-slate-900">Tableau de Bord Pastoral</h2>
              <p className="text-slate-600 text-sm mt-1">Byenveni nan pòtay administrasyon ofisyèl Legliz Nazareen Damé a. Sèvi ak onglets anwo yo pou jere tout sèvis yo.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div onClick={() => setActiveTab('members')} className="bg-white border p-5 rounded-2xl shadow-xs cursor-pointer hover:border-amber-400">
                <Users className="w-6 h-6 text-amber-500 mb-2" />
                <p className="text-2xl font-bold">{members.length}</p>
                <p className="text-xs text-slate-500">Membres Inscrits</p>
              </div>
              <div onClick={() => setActiveTab('sacraments')} className="bg-white border p-5 rounded-2xl shadow-xs cursor-pointer hover:border-amber-400">
                <Award className="w-6 h-6 text-amber-500 mb-2" />
                <p className="text-2xl font-bold">{sacraments.length}</p>
                <p className="text-xs text-slate-500">Actes & Sacrements</p>
              </div>
              <div onClick={() => setActiveTab('projects')} className="bg-white border p-5 rounded-2xl shadow-xs cursor-pointer hover:border-amber-400">
                <Briefcase className="w-6 h-6 text-amber-500 mb-2" />
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-xs text-slate-500">Projets & Chantiers</p>
              </div>
              <div onClick={() => setActiveTab('prayers')} className="bg-white border p-5 rounded-2xl shadow-xs cursor-pointer hover:border-amber-400">
                <Heart className="w-6 h-6 text-amber-500 mb-2" />
                <p className="text-2xl font-bold">{prayers.length}</p>
                <p className="text-xs text-slate-500">Requêtes de Prière</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MEMBRES */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Registre des Membres</h2>
                <p className="text-slate-500 text-sm">Lis tout fidèl ak responsab legliz la.</p>
              </div>
              <button onClick={() => setMemberModalOpen(true)} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1">
                <Plus className="w-4 h-4" /><span>Ajouter Membre</span>
              </button>
            </div>

            <div className="bg-white border rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Registre #</th>
                    <th className="py-3 px-4">Non</th>
                    <th className="py-3 px-4">Téléphone</th>
                    <th className="py-3 px-4">Ministère</th>
                    <th className="py-3 px-4">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {members.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-amber-700">{m.regNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{m.fullName}</td>
                      <td className="py-3 px-4 text-xs">{m.phone || 'N/A'}</td>
                      <td className="py-3 px-4 text-xs">{m.ministryAffiliation}</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-emerald-100 text-emerald-800">{m.status}</span></td>
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
            <div>
              <h2 className="text-2xl font-black text-slate-900">Actes & Sacrements</h2>
              <p className="text-slate-500 text-sm">Sètifika batèm, maryaj ak dedikasyon.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sacraments.map(s => (
                <div key={s.id} className="bg-white border rounded-2xl p-4 shadow-xs">
                  <span className="px-2 py-0.5 rounded text-2xs font-bold uppercase bg-blue-100 text-blue-800">{s.type}</span>
                  <h3 className="font-bold text-base mt-2">{s.recipientName}</h3>
                  <p className="text-xs text-slate-500 mt-1">Dat: {s.date} • {s.officiatingPastor}</p>
                </div>
              ))}
              {sacraments.length === 0 && (
                <p className="text-slate-500 text-sm">Okenn ak anrejistre pou kounye a.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: NOS PROJETS */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Gestion des Projets & Chantiers</h2>
                <p className="text-slate-500 text-sm">Publiez des projets avec description texte/HTML, images locales et options de don.</p>
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
                  Aucun projet enregistré pour le moment. Klike sou "Nouveau Projet" pou ajoute youn.
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

        {/* TAB 5: PRIÈRES */}
        {activeTab === 'prayers' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Requêtes de Prière</h2>
              <p className="text-slate-500 text-sm">Entansyon ak doléances ki voye pou lapriyè.</p>
            </div>
            <div className="space-y-3">
              {prayers.map(p => (
                <div key={p.id} className="bg-white border rounded-2xl p-4 shadow-xs">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-amber-700">{p.category}</span>
                    <span className="text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-800 font-medium">« {p.message} »</p>
                  <p className="text-2xs text-slate-500 mt-2">Par: {p.fullName || 'Anonyme'}</p>
                </div>
              ))}
              {prayers.length === 0 && <p className="text-slate-500 text-sm">Okenn demann lapriyè pou kounye a.</p>}
            </div>
          </div>
        )}

        {/* TAB 6: BREVO */}
        {activeTab === 'brevo' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Newsletter Brevo</h2>
              <p className="text-slate-500 text-sm">Voye imel an dirèk bay tout abone yo.</p>
            </div>
            <div className="bg-white border p-6 rounded-2xl shadow-xs space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Sujet du Message</label>
                <input type="text" value={campaignSubject} onChange={e => setCampaignSubject(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Contenu</label>
                <textarea rows={4} value={campaignContent} onChange={e => setCampaignContent(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm" />
              </div>
              <button onClick={() => showToast('success', 'Anons anrejistre!')} className="px-5 py-2.5 bg-slate-900 text-amber-400 font-bold rounded-xl text-xs">
                Diffuser le Message
              </button>
            </div>
          </div>
        )}

        {/* TAB 7: SUPABASE */}
        {activeTab === 'supabase' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Base Supabase & SQL</h2>
              <p className="text-slate-500 text-sm">Estati koneksyon baz done a.</p>
            </div>
            <div className="bg-white border p-6 rounded-2xl shadow-xs space-y-4">
              <button onClick={() => testSupabaseConnection().then(r => showToast(r.success ? 'success' : 'error', r.message))} className="px-4 py-2 bg-amber-500 font-bold rounded-xl text-xs">
                Tester la Connexion (Ping RLS)
              </button>
            </div>
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
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Photo du Projet</label>
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
