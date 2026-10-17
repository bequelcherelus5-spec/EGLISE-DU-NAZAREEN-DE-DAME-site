import React, { useState, useEffect } from 'react';
import { CustomPage } from '../types';
import { pageService } from '../services/pageService';
import { 
  FilePlus, 
  FileText, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  X, 
  Globe, 
  Clock, 
  Image as ImageIcon,
  ExternalLink,
  Code2,
  LayoutTemplate,
  Sparkles,
  Compass
} from 'lucide-react';

interface ContentManagerProps {
  onNavigateToPage?: (slug: string) => void;
}

export const ContentManager: React.FC<ContentManagerProps> = ({ onNavigateToPage }) => {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [showInMenu, setShowInMenu] = useState(true);
  const [author, setAuthor] = useState('Secrétariat Général');

  // Preview tab mode in modal
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Notice
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setLoading(true);
    try {
      const data = await pageService.getPages();
      setPages(data);
    } catch {
      // Ignorer
    } finally {
      setLoading(false);
    }
  };

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  const openCreateModal = () => {
    setEditingPage(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setHtmlContent('');
    setFeaturedImage('');
    setIsActive(true);
    setShowInMenu(true);
    setAuthor('Secrétariat Général');
    setActiveTab('editor');
    setModalOpen(true);
  };

  const openEditModal = (page: CustomPage) => {
    setEditingPage(page);
    setTitle(page.title);
    setSlug(page.slug);
    setExcerpt(page.excerpt || '');
    setContent(page.content);
    setHtmlContent(page.htmlContent || '');
    setFeaturedImage(page.featuredImage || '');
    setIsActive(page.isActive);
    setShowInMenu(page.showInMenu !== false);
    setAuthor(page.author);
    setActiveTab('editor');
    setModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingPage) {
      const generatedSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
    }
  };

  // Insertion de snippets HTML prêts à l'emploi
  const insertHtmlSnippet = (snippet: string) => {
    setHtmlContent((prev) => (prev ? prev + '\n\n' + snippet : snippet));
    showNotice('success', 'Modèle HTML inséré avec succès dans l’éditeur !');
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      showNotice('error', 'Le titre et l’identifiant URL (slug) de la page sont obligatoires.');
      return;
    }

    // Si le texte simple est vide mais le HTML est fourni, on génère un extrait automatique
    let finalContent = content.trim();
    if (!finalContent && htmlContent.trim()) {
      finalContent = htmlContent.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
    }

    if (!finalContent && !htmlContent.trim()) {
      showNotice('error', 'Veuillez saisir du texte ou du code HTML pour le contenu de la page.');
      return;
    }

    const payload = {
      title: title.trim(),
      slug: slug.trim().toLowerCase(),
      excerpt: excerpt.trim() || undefined,
      content: finalContent || title.trim(),
      htmlContent: htmlContent.trim() || undefined,
      featuredImage: featuredImage.trim() || undefined,
      isActive,
      showInMenu,
      author: author.trim() || 'Secrétariat Général'
    };

    if (editingPage) {
      const updated = await pageService.updatePage(editingPage.id, payload);
      if (updated) {
        showNotice(
          'success', 
          `Page « ${updated.title} » mise à jour avec succès ! ${updated.showInMenu && updated.isActive ? 'Elle est visible dans le menu.' : ''}`
        );
      } else {
        showNotice('error', 'Erreur de mise à jour.');
      }
    } else {
      const created = await pageService.createPage(payload);
      if (created) {
        showNotice(
          'success', 
          `Nouvelle page HTML « ${created.title} » publiée avec succès ! ${created.showInMenu && created.isActive ? 'Elle apparaît automatiquement dans le menu de navigation.' : ''}`
        );
      } else {
        showNotice('error', 'Erreur de création de la page.');
      }
    }

    setModalOpen(false);
    loadPages();
  };

  const handleDeletePage = async (id: string, pageTitle: string) => {
    if (!window.confirm(`Supprimer définitivement la page « ${pageTitle} » ?`)) {
      return;
    }
    const ok = await pageService.deletePage(id);
    if (ok) {
      showNotice('success', `Page « ${pageTitle} » supprimée.`);
      loadPages();
    } else {
      showNotice('error', 'Erreur lors de la suppression.');
    }
  };

  const handleToggleActive = async (id: string) => {
    const updated = await pageService.togglePageStatus(id);
    if (updated) {
      showNotice(
        'success',
        `La page « ${updated.title} » est maintenant ${updated.isActive ? 'Active (visible sur le site et dans le menu)' : 'Inactive (masquée)'}.`
      );
      loadPages();
    }
  };

  const handleToggleMenu = async (p: CustomPage) => {
    const nextMenuState = p.showInMenu === false ? true : false;
    const updated = await pageService.updatePage(p.id, { showInMenu: nextMenuState });
    if (updated) {
      showNotice(
        'success',
        `La page « ${updated.title} » ${nextMenuState ? 'apparaît désormais dans le menu' : 'est masquée du menu'}.`
      );
      loadPages();
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5" />
              <span>Gestionnaire de Contenu Web &amp; Pages HTML</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Gestion &amp; Publication de Pages HTML
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Rédigez et publiez de nouvelles pages d’information en texte ou en <strong>HTML complet</strong>.
              Dès qu’une page est publiée, elle s'affiche <strong>automatiquement dans le menu de navigation</strong> du site.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
          >
            <FilePlus className="w-4 h-4" />
            <span>Publier une Nouvelle Page HTML</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center space-x-2 animate-in fade-in duration-200 ${
          notice.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {notice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <X className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span className="font-medium">{notice.message}</span>
        </div>
      )}

      {/* Pages Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-amber-500" />
              <span>Pages Personnalisées Publiées ({pages.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Toutes les pages actives avec l'option « Menu » cochée sont accessibles directement dans la Navbar et le menu mobile.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-medium">
              <Compass className="w-3.5 h-3.5" />
              <span>{pages.filter(p => p.isActive && p.showInMenu !== false).length} dans le menu</span>
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Chargement des pages...</div>
        ) : pages.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">Aucune page personnalisée créée pour le moment.</p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              Vous pouvez ajouter des pages spécifiques telles que l’historique de l'Église, un communiqué spécial,
              ou un rapport d’activités en HTML complet.
            </p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
            >
              Publier la première page HTML
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b">
                <tr>
                  <th className="py-3 px-4">Titre de la Page</th>
                  <th className="py-3 px-4">URL (Chemin)</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Dans le Menu ?</th>
                  <th className="py-3 px-4">Auteur</th>
                  <th className="py-3 px-4">Date de Création</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pages.map((p) => {
                  const inMenu = p.showInMenu !== false;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center space-x-2">
                        <span>{p.title}</span>
                        {p.htmlContent && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-indigo-50 text-indigo-700 font-bold border border-indigo-200" title="Contient du code HTML enrichi">
                            HTML
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                        /page/{p.slug}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>En ligne</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Brouillon / Inactive</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleMenu(p)}
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold transition ${
                            inMenu && p.isActive
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                          title="Cliquer pour afficher ou masquer du menu"
                        >
                          <Compass className="w-3 h-3" />
                          <span>{inMenu && p.isActive ? 'Oui (Visible)' : 'Non (Masquée)'}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{p.author}</td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {p.isActive && (
                          <button
                            onClick={() => {
                              if (onNavigateToPage) {
                                onNavigateToPage(p.slug);
                              } else {
                                window.location.href = `/page/${p.slug}`;
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="Voir la page sur le site"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleActive(p.id)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                            p.isActive
                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {p.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition"
                          title="Modifier"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePage(p.id, p.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Page Form avec Éditeur HTML et Aperçu en direct */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900 flex items-center space-x-2">
                  <Code2 className="w-5 h-5 text-amber-500" />
                  <span>{editingPage ? 'Modifier la Page HTML' : 'Publier une Nouvelle Page en HTML'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Une fois enregistrée et active, cette page sera <strong>automatiquement insérée dans le menu de navigation</strong>.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Selector Tabs: Éditeur vs Aperçu */}
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  activeTab === 'editor'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Rédacteur &amp; Code HTML</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  activeTab === 'preview'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Aperçu en Direct du Rendu</span>
              </button>
            </div>

            {activeTab === 'preview' ? (
              /* APERÇU EN DIRECT DU RENDU HTML */
              <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                  {featuredImage && (
                    <div className="h-48 rounded-xl overflow-hidden bg-slate-900">
                      <img src={featuredImage} alt={title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="border-b pb-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                      Aperçu Page Publique : /page/{slug || 'mon-url'}
                    </span>
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                      {title || 'Titre de la page'}
                    </h1>
                    {excerpt && <p className="text-sm text-slate-600 italic mt-1">{excerpt}</p>}
                    <p className="text-[11px] text-slate-400 mt-2">
                      Par {author} • Date de publication : {new Date().toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  {content && (
                    <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                      {content}
                    </div>
                  )}

                  {htmlContent ? (
                    <div 
                      className="prose prose-slate max-w-none pt-4 border-t border-slate-100"
                      dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                  ) : (
                    <p className="text-xs text-slate-400 italic">Aucun code HTML additionnel rédigé.</p>
                  )}
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('editor')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition"
                  >
                    Retourner à l’éditeur pour ajuster
                  </button>
                </div>
              </div>
            ) : (
              /* ÉDITEUR HTML ET PARAMÈTRES */
              <form onSubmit={handleSavePage} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Titre de la Page *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex : Historique &amp; Témoignages de l'Église"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Identifiant URL (Slug) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                        /page/
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="historique-temoignages"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                        className="w-full pl-16 pr-3.5 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Option Menu Automatique (Demandée explicitement par l'utilisateur) */}
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300/80 flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="showInMenu"
                    checked={showInMenu}
                    onChange={(e) => setShowInMenu(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="showInMenu" className="cursor-pointer select-none">
                    <span className="text-xs font-bold text-slate-900 block flex items-center space-x-1">
                      <Compass className="w-3.5 h-3.5 text-amber-600 inline" />
                      <span>Faire apparaître cette page dans le menu de navigation (Navbar &amp; Mobile)</span>
                    </span>
                    <span className="text-[11px] text-slate-600 block mt-0.5">
                      Dès que vous enregistrez cette page avec le statut « Active », les visiteurs verront un lien direct dans la barre de navigation du site.
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Image principale (Bannière ou URL d'illustration)
                    </label>
                    <div className="relative">
                      <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="/images/eglise/og-banner.svg ou lien web"
                        value={featuredImage}
                        onChange={(e) => setFeaturedImage(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Bref résumé (Chapô d'introduction)
                    </label>
                    <input
                      type="text"
                      placeholder="Une ou deux phrases d'introduction..."
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Barre d'outils d'insertion rapide HTML */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <Code2 className="w-4 h-4 text-amber-500" />
                      <span>Contenu HTML Enrichi</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Modèles préformatés en 1 clic :</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => insertHtmlSnippet('<div class="bg-amber-50 p-6 rounded-2xl border border-amber-200 text-amber-950 my-4">\n  <h3 class="font-serif text-lg font-bold text-amber-900 mb-2">Annonce Spéciale de l’Église</h3>\n  <p class="text-sm">Votre message d’annonce ici...</p>\n</div>')}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 transition"
                    >
                      + Boîte Annonce Dorée
                    </button>
                    <button
                      type="button"
                      onClick={() => insertHtmlSnippet('<blockquote class="border-l-4 border-amber-500 pl-4 py-2 italic text-slate-700 bg-slate-50 my-4 rounded-r-xl">\n  « Car je connais les projets que j\'ai formés sur vous, dit l\'Éternel, projets de paix et non de malheur... »\n  <span class="block font-bold text-amber-600 not-italic text-xs mt-1">— Jérémie 29:11</span>\n</blockquote>')}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                    >
                      + Verset / Citation
                    </button>
                    <button
                      type="button"
                      onClick={() => insertHtmlSnippet('<div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">\n  <div class="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">\n    <h4 class="font-bold text-sm text-slate-900 mb-2">Section 1</h4>\n    <p class="text-xs text-slate-600">Détails de la section...</p>\n  </div>\n  <div class="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">\n    <h4 class="font-bold text-sm text-slate-900 mb-2">Section 2</h4>\n    <p class="text-xs text-slate-600">Détails de la section...</p>\n  </div>\n</div>')}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                    >
                      + 2 Colonnes
                    </button>
                    <button
                      type="button"
                      onClick={() => insertHtmlSnippet('<div class="text-center my-6">\n  <a href="/contact" class="inline-block px-6 py-3 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md transition">\n    Prendre Contact avec l’Église\n  </a>\n</div>')}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                    >
                      + Bouton d'Action
                    </button>
                    <button
                      type="button"
                      onClick={() => insertHtmlSnippet('<div class="aspect-video w-full rounded-2xl overflow-hidden shadow-lg my-6">\n  <iframe class="w-full h-full" src="https://www.youtube.com/embed/LIVE_ID" title="Vidéo" frameborder="0" allowfullscreen></iframe>\n</div>')}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                    >
                      + Vidéo YouTube
                    </button>
                  </div>

                  <textarea
                    rows={8}
                    placeholder="Tapez ou collez votre code HTML ici (balises <h2>, <p>, <div>, <img>, <iframe> acceptées)..."
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 bg-slate-900 text-emerald-400 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Texte descriptif ou transcription (Optionnel si vous utilisez le code HTML ci-dessus)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Texte brut complémentaire..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Auteur ou Responsable
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Statut de Publication
                    </label>
                    <select
                      value={isActive ? 'active' : 'inactive'}
                      onChange={(e) => setIsActive(e.target.value === 'active')}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 bg-white font-bold"
                    >
                      <option value="active">Active (Publiée &amp; Visible sur le site)</option>
                      <option value="inactive">Inactive (Brouillon)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Voir l’Aperçu avant de publier</span>
                  </button>

                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
                    >
                      {editingPage ? 'Enregistrer les modifications' : 'Publier et Afficher dans le Menu'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
