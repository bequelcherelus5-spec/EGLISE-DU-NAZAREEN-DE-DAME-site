import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X, 
  Code, 
  Eye, 
  Sparkles, 
  FileCode, 
  Layers, 
  Download, 
  Upload, 
  Check, 
  Copy
} from 'lucide-react';
import { faqService, FAQItem } from '../../services/faqService';

export const FAQManager: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  
  // Navigation entre les modes (Liste standard ou Session HTML)
  const [activeSession, setActiveSession] = useState<'standard' | 'html_editor'>('standard');

  // Modal Ajout / Modification Standard
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewAnswerHtml, setPreviewAnswerHtml] = useState(false);

  const [form, setForm] = useState({
    question: '',
    answer: '',
    category: 'general' as FAQItem['category']
  });

  // États pour la Session Code HTML
  const [customHtml, setCustomHtml] = useState<string>('');
  const [htmlCategory, setHtmlCategory] = useState<FAQItem['category']>('general');
  const [htmlPreviewMode, setHtmlPreviewMode] = useState<boolean>(true);
  const [htmlNotice, setHtmlNotice] = useState<{ type: 'idle' | 'success' | 'error'; text: string }>({
    type: 'idle',
    text: ''
  });
  const [htmlSaving, setHtmlSaving] = useState(false);

  const [statusMsg, setStatusMsg] = useState<{ type: 'idle' | 'success' | 'error'; text: string }>({
    type: 'idle',
    text: ''
  });
  const [saving, setSaving] = useState(false);

  const loadFaqs = async () => {
    setLoading(true);
    try {
      const data = await faqService.getFAQs();
      setFaqs(data);
      setCustomHtml(faqService.getCustomHtml());
    } catch {
      // Ignorer
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      question: '',
      answer: '',
      category: 'general'
    });
    setPreviewAnswerHtml(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: FAQItem) => {
    setEditingId(item.id);
    setForm({
      question: item.question,
      answer: item.answer,
      category: item.category
    });
    setPreviewAnswerHtml(false);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Confirmez-vous la suppression de cette question de la FAQ ?')) return;
    const ok = await faqService.deleteFAQ(id);
    if (ok) {
      setFaqs(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      setStatusMsg({ type: 'error', text: 'Veuillez saisir la question et la réponse.' });
      return;
    }

    setSaving(true);
    setStatusMsg({ type: 'idle', text: '' });

    try {
      if (editingId) {
        const updated = await faqService.updateFAQ(editingId, form);
        if (updated) {
          setStatusMsg({ type: 'success', text: 'Question mise à jour avec succès !' });
        }
      } else {
        await faqService.createFAQ(form);
        setStatusMsg({ type: 'success', text: 'Nouvelle question ajoutée à la FAQ avec succès !' });
      }
      await loadFaqs();
      setTimeout(() => {
        setIsModalOpen(false);
        setStatusMsg({ type: 'idle', text: '' });
      }, 1500);
    } catch {
      setStatusMsg({ type: 'error', text: 'Erreur lors de l’enregistrement.' });
    } finally {
      setSaving(false);
    }
  };

  // Helper pour insérer des balises HTML dans le formulaire
  const insertHtmlTag = (tagOpen: string, tagClose: string = '') => {
    setForm(prev => ({
      ...prev,
      answer: prev.answer + `${tagOpen}${tagClose}`
    }));
  };

  // Sauvegarder la section HTML officielle
  const handleSaveCustomHtml = () => {
    setHtmlSaving(true);
    try {
      faqService.saveCustomHtml(customHtml);
      setHtmlNotice({
        type: 'success',
        text: 'Section HTML personnalisée enregistrée avec succès ! Elle s’affiche maintenant sur la page FAQ publique.'
      });
      setTimeout(() => setHtmlNotice({ type: 'idle', text: '' }), 4000);
    } catch {
      setHtmlNotice({ type: 'error', text: 'Erreur lors de la sauvegarde du code HTML.' });
    } finally {
      setHtmlSaving(false);
    }
  };

  // Extraire les FAQ du code HTML pour les injecter dans la liste structurée
  const handleExtractAndImportFaqs = async () => {
    if (!customHtml.trim()) {
      setHtmlNotice({ type: 'error', text: 'Veuillez d’abord saisir ou coller du code HTML.' });
      return;
    }

    setHtmlSaving(true);
    try {
      const extracted = faqService.extractFaqsFromHtml(customHtml, htmlCategory);
      if (extracted.length === 0) {
        setHtmlNotice({
          type: 'error',
          text: 'Aucune question détectée. Utilisez des balises <details><summary>Question</summary><p>Réponse</p></details> ou <h3>Question</h3><p>Réponse</p>.'
        });
        return;
      }

      const count = await faqService.batchCreateFAQs(extracted);
      await loadFaqs();
      setHtmlNotice({
        type: 'success',
        text: `${count} question(s) extraite(s) avec succès du code HTML et ajoutée(s) à la liste officielle !`
      });
      setTimeout(() => setHtmlNotice({ type: 'idle', text: '' }), 5000);
    } catch (err: any) {
      setHtmlNotice({ type: 'error', text: 'Erreur d’extraction : ' + (err?.message || 'Format invalide') });
    } finally {
      setHtmlSaving(false);
    }
  };

  // Modèles HTML prêts à l'emploi
  const applyHtmlTemplate = (type: 'details' | 'headings' | 'cards' | 'verses') => {
    let tpl = '';
    if (type === 'details') {
      tpl = `<!-- Modèle Liste FAQ en Akòdeyon HTML -->
<details class="mb-3 p-4 bg-white rounded-2xl border border-slate-200">
  <summary class="font-bold text-slate-900 cursor-pointer text-sm">
    Ki lè kil adorasyon dimanch la kòmanse nan Damé ?
  </summary>
  <div class="mt-2 text-xs text-slate-600 leading-relaxed border-t pt-2">
    Grand Culte d’Adoration an kòmanse <strong>chak Dimanch a 08h30 AM</strong> nan tanp prensipal la.
  </div>
</details>

<details class="mb-3 p-4 bg-white rounded-2xl border border-slate-200">
  <summary class="font-bold text-slate-900 cursor-pointer text-sm">
    Kijan pou m kontakte Pasteur Bequel CHERELUS ?
  </summary>
  <div class="mt-2 text-xs text-slate-600 leading-relaxed border-t pt-2">
    Ou ka rele oswa ekri sou WhatsApp nan <strong>+509 48596089</strong> oswa pase nan biwo pastoral la madi ak jedi.
  </div>
</details>`;
    } else if (type === 'headings') {
      tpl = `<!-- Modèle Tit H3 ak Paragraf -->
<div class="space-y-4">
  <div class="p-5 bg-white rounded-2xl border border-slate-200">
    <h3 class="text-base font-bold text-slate-900 mb-2">Ki kondisyon pou fè batèm nan dlo ?</h3>
    <p class="text-xs text-slate-600 leading-relaxed">
      Kandida a dwe fin pase nan <em>klas fòmasyon batèm</em>, fè konfesyon lafwa nan Jezi Kris, epi dakò pou viv yon lavi sen dapre Bib la.
    </p>
  </div>

  <div class="p-5 bg-white rounded-2xl border border-slate-200">
    <h3 class="text-base font-bold text-slate-900 mb-2">Kisa Pwojè CDEJ HA 0926 ye ?</h3>
    <p class="text-xs text-slate-600 leading-relaxed">
      Se sant devlopman timoun legliz la avèk <strong>Compassion International</strong> k ap ede plis pase 265 timoun nan Damé.
    </p>
  </div>
</div>`;
    } else if (type === 'cards') {
      tpl = `<!-- Modèle Kat FAQ Elegans -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div class="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
    <h4 class="font-bold text-sm text-amber-900 mb-1">📍 Ki kote legliz la ye egzakteman ?</h4>
    <p class="text-xs text-slate-700">
      Nan 3ème Section Damé, Komin Môle-Saint-Nicolas, Depatman Nòdwès Haïti.
    </p>
  </div>
  <div class="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
    <h4 class="font-bold text-sm text-emerald-900 mb-1">📻 Èske gen yon radyo an liy ?</h4>
    <p class="text-xs text-slate-700">
      Wi, ou ka koute <strong>Radyo Nazaréen Damé 24/7</strong> dirèkteman sou sit web ofisyèl sa a.
    </p>
  </div>
</div>`;
    } else if (type === 'verses') {
      tpl = `<!-- Modèle FAQ Doktrin ak Vèsè Biblik -->
<div class="p-5 bg-slate-900 text-white rounded-2xl border border-amber-500/40 space-y-2">
  <h3 class="text-sm font-bold text-amber-400">Poukisa deviz nou se « Sainteté à l’Éternel » ?</h3>
  <p class="text-xs text-slate-300 leading-relaxed">
    Paske nou kwè nan sanktifikasyon total selon <strong>1 Tesalonisyen 5:23</strong> : 
    <blockquote class="italic border-l-2 border-amber-400 pl-3 my-2 text-amber-200">
      « Que le Dieu de paix vous sanctifie lui-même tout entiers... »
    </blockquote>
  </p>
</div>`;
    }
    setCustomHtml(prev => (prev ? prev + '\n\n' + tpl : tpl));
  };

  const categoryLabels: Record<string, string> = {
    doctrinal: 'Doctrine & Foi',
    membership: 'Adhésion & Membres',
    sacraments: 'Sacrements & Célébrations',
    social: 'Social & CDEJ',
    general: 'Général & Pratique'
  };

  const filtered = faqs.filter(f => {
    const matchCat = filterCat === 'all' || f.category === filterCat;
    if (!matchCat) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Gestion de la FAQ Pastorale</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            Foire Aux Questions (FAQ) &amp; Code HTML
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gérez les questions fréquentes soit question par question, soit directement avec du code HTML enrichi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('/faq')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center space-x-1.5"
            title="Ouvrir la page FAQ sur le site public"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <span>Voir la Page FAQ Publique</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition flex items-center space-x-2 shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une Question</span>
          </button>
        </div>
      </div>

      {/* Onglets de Session : Mode Standard VS Session Code HTML */}
      <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200">
        <button
          onClick={() => setActiveSession('standard')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSession === 'standard'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-500" />
          <span>Liste des Questions ({faqs.length})</span>
        </button>

        <button
          onClick={() => setActiveSession('html_editor')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSession === 'html_editor'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Code className="w-4 h-4 text-amber-400" />
          <span>Session &amp; Liste FAQ avec Code HTML</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-400 text-slate-950">
            HTML
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SESSION 1 : LISTE STANDARD DES QUESTIONS */}
      {/* ========================================================================= */}
      {activeSession === 'standard' && (
        <div className="space-y-6">
          {/* Controls: Search & Category filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="relative flex-grow max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Rechercher une question ou mot-clé..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto">
              {[
                { id: 'all', label: 'Toutes les catégories' },
                { id: 'doctrinal', label: 'Doctrine' },
                { id: 'membership', label: 'Adhésion' },
                { id: 'sacraments', label: 'Sacrements' },
                { id: 'social', label: 'Social & CDEJ' },
                { id: 'general', label: 'Général' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterCat(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    filterCat === tab.id
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
              <p className="text-xs text-slate-500 mt-2 font-mono">Chargement des questions...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Aucune question trouvée dans cette catégorie.</p>
              <button
                onClick={handleOpenAdd}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
              >
                Créer une nouvelle question
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filtered.map(item => (
                <div 
                  key={item.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4 transition"
                >
                  <div className="space-y-2 flex-grow">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {categoryLabels[item.category] || item.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {item.id}</span>
                    </div>

                    <h4 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                      {item.question}
                    </h4>

                    {/* Contenu rendu avec support HTML */}
                    <div 
                      className="text-xs text-slate-600 leading-relaxed font-sans line-clamp-3 prose prose-xs max-w-none"
                      dangerouslySetInnerHTML={{ __html: item.answer }}
                    />
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition text-xs font-bold flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                      title="Supprimer la question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SESSION 2 : ÉDITEUR ET GESTION FAQ AVEC CODE HTML */}
      {/* ========================================================================= */}
      {activeSession === 'html_editor'}
      {activeSession === 'html_editor' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <FileCode className="w-4 h-4" />
              <span>Sesyon Kòd HTML &amp; Lis Kesyon FAQ</span>
            </div>

            <h3 className="font-serif text-2xl font-bold text-white">
              Éditeur FAQ avec Code HTML Enrichi
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Nan sesyon sa a, ou ka mete oswa kole yon lis FAQ konplè avèk kòd HTML (tit, paragraf, lis, lyen, akòdeyon). 
              Ou gen 2 opsyon puisan :
              <br />
              <strong>1. Enregistrer kòm Seksyon HTML Ofisyèl :</strong> Kòd la ap parèt dirèkteman sou paj piblik la <code className="text-amber-300">/faq</code>.
              <br />
              <strong>2. Ekstrè &amp; Enpòte nan Lis FAQ :</strong> Sistèm nan ap dekonpoze kòd HTML la pou kreye kesyon ak repons endividyèl otomatikman !
            </p>

            {/* Boutons d'insertion de Modèles HTML */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-amber-300 font-semibold mr-1">Mete yon modèl vit :</span>
              <button
                type="button"
                onClick={() => applyHtmlTemplate('details')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition"
              >
                + Modèl Akòdeyon (&lt;details&gt;)
              </button>
              <button
                type="button"
                onClick={() => applyHtmlTemplate('headings')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                + Modèl Tit &amp; Paragraf (&lt;h3&gt;)
              </button>
              <button
                type="button"
                onClick={() => applyHtmlTemplate('cards')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition"
              >
                + Modèl Kat Koulè
              </button>
              <button
                type="button"
                onClick={() => applyHtmlTemplate('verses')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition"
              >
                + Doktrin &amp; Vèsè Biblik
              </button>
            </div>
          </div>

          {/* Zone d'édition et aperçu */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colonne Gauche : Éditeur de Code HTML */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center space-x-2">
                  <Code className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Kòd HTML pou FAQ la
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={htmlCategory}
                    onChange={e => setHtmlCategory(e.target.value as any)}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 focus:outline-none"
                    title="Catégorie par défaut pour l'import"
                  >
                    <option value="general">Général &amp; Pratique</option>
                    <option value="doctrinal">Doctrine &amp; Foi</option>
                    <option value="membership">Adhésion &amp; Membres</option>
                    <option value="sacraments">Sacrements</option>
                    <option value="social">Social &amp; CDEJ</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setCustomHtml('')}
                    className="text-[11px] text-rose-600 hover:underline font-medium"
                  >
                    Efase tout
                  </button>
                </div>
              </div>

              <textarea
                rows={16}
                value={customHtml}
                onChange={e => setCustomHtml(e.target.value)}
                placeholder="Tape oswa kole kòd HTML FAQ ou la isit la... Egzamp :&#10;<details>&#10;  <summary>Keksyon ?</summary>&#10;  <p>Repons pastoral...</p>&#10;</details>"
                className="w-full p-3.5 font-mono text-xs rounded-2xl border border-slate-300 bg-slate-950 text-emerald-400 focus:outline-none focus:border-amber-400 leading-relaxed shadow-inner"
              />

              {/* Messages d'état */}
              {htmlNotice.type === 'success' && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{htmlNotice.text}</span>
                </div>
              )}

              {htmlNotice.type === 'error' && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{htmlNotice.text}</span>
                </div>
              )}

              {/* Boutons d'action pour le HTML */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSaveCustomHtml}
                  disabled={htmlSaving}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Anrejistre kòm Seksyon HTML Ofisyèl</span>
                </button>

                <button
                  type="button"
                  onClick={handleExtractAndImportFaqs}
                  disabled={htmlSaving}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition shadow flex items-center justify-center space-x-2 disabled:opacity-50"
                  title="Extraire chaque question/réponse du HTML et les ajouter à la liste FAQ"
                >
                  <Upload className="w-4 h-4" />
                  <span>Ekstrè &amp; Enpòte nan Lis FAQ</span>
                </button>
              </div>
            </div>

            {/* Colonne Droite : Aperçu en Direct du Rendu HTML */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-indigo-500" />
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Wè Rezilta a an Dirèk (Aperçu HTML)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Rendu Visuel en Temps Réel
                  </span>
                </div>

                {customHtml.trim() ? (
                  <div 
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 min-h-[300px] max-h-[500px] overflow-y-auto prose prose-sm max-w-none text-slate-800"
                    dangerouslySetInnerHTML={{ __html: customHtml }}
                  />
                ) : (
                  <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 space-y-2">
                    <Code className="w-8 h-8 opacity-40" />
                    <p className="text-xs">
                      Kòd HTML ou a ap parèt isit la an tan reyèl pou w ka wè jan fidèl yo ap wè l sou sit la.
                    </p>
                    <button
                      type="button"
                      onClick={() => applyHtmlTemplate('details')}
                      className="text-xs text-amber-600 font-bold hover:underline"
                    >
                      Klike la a pou w mete yon egzanp
                    </button>
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  Tout balise HTML estanda yo sipòte : &lt;details&gt;, &lt;summary&gt;, &lt;strong&gt;, &lt;a href&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;h3&gt;, &lt;blockquote&gt;.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL AJOUTER / MODIFIER UNE QUESTION INDIVIDUELLE AVEC OUTILS HTML */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-bold text-slate-900 text-lg">
                  {editingId ? 'Modifier la Question FAQ' : 'Ajouter une Question à la FAQ'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Catégorie</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 bg-white"
                >
                  <option value="doctrinal">Doctrine &amp; Foi</option>
                  <option value="membership">Adhésion &amp; Membres</option>
                  <option value="sacraments">Sacrements &amp; Célébrations</option>
                  <option value="social">Social &amp; CDEJ Compassion</option>
                  <option value="general">Général &amp; Pratique</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Question posée *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Quels sont les horaires exacts du Culte du Dimanche ?"
                  value={form.question}
                  onChange={e => setForm({ ...form, question: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 text-xs font-semibold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Réponse pastorale officielle *</label>
                  
                  {/* Barre d'outils HTML rapide */}
                  <div className="flex items-center space-x-1 text-[10px]">
                    <span className="text-slate-400 mr-1">Balises :</span>
                    <button
                      type="button"
                      onClick={() => insertHtmlTag('<strong>', '</strong>')}
                      className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-bold"
                      title="Texte en gras"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => insertHtmlTag('<em>', '</em>')}
                      className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 italic font-serif"
                      title="Texte en italique"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => insertHtmlTag('<a href="https://" target="_blank">', '</a>')}
                      className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 underline"
                      title="Lien hypertexte"
                    >
                      Lien
                    </button>
                    <button
                      type="button"
                      onClick={() => insertHtmlTag('<ul>\n  <li>', '</li>\n</ul>')}
                      className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200"
                      title="Liste à puces"
                    >
                      • Liste
                    </button>
                    <button
                      type="button"
                      onClick={() => insertHtmlTag('<br/>')}
                      className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-mono"
                      title="Saut de ligne"
                    >
                      &lt;br&gt;
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewAnswerHtml(!previewAnswerHtml)}
                      className={`ml-1 px-2 py-0.5 rounded font-bold transition ${
                        previewAnswerHtml ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-700'
                      }`}
                      title="Basculer l'aperçu du rendu"
                    >
                      {previewAnswerHtml ? 'Masquer Aperçu' : 'Aperçu HTML'}
                    </button>
                  </div>
                </div>

                {previewAnswerHtml ? (
                  <div 
                    className="w-full p-3.5 rounded-xl border border-amber-400 bg-amber-50/50 min-h-[120px] max-h-56 overflow-y-auto text-xs leading-relaxed prose prose-xs"
                    dangerouslySetInnerHTML={{ __html: form.answer || '<em>Aucun texte pour l’aperçu.</em>' }}
                  />
                ) : (
                  <textarea
                    rows={6}
                    required
                    placeholder="Rédigez la réponse... Vous pouvez utiliser du code HTML pour enrichir le texte (ex: <strong>gras</strong>, vœux, liens...)"
                    value={form.answer}
                    onChange={e => setForm({ ...form, answer: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 leading-relaxed text-xs font-sans"
                  />
                )}
              </div>

              {statusMsg.type === 'success' && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{statusMsg.text}</span>
                </div>
              )}

              {statusMsg.type === 'error' && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{statusMsg.text}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition flex items-center space-x-2 shadow-md disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <span>{editingId ? 'Mettre à jour' : 'Publier dans la FAQ'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
