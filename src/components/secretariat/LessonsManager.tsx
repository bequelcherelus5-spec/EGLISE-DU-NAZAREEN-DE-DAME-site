import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Share2, 
  ExternalLink, 
  Calendar, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X,
  MessageSquare,
  Copy
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  targetGroup: 'children' | 'youth' | 'adults' | 'teachers';
  weekDate: string;
  passage: string;
  memoryVerse: string;
  contentHtml: string;
  teacherNotes?: string;
  author: string;
  createdAt?: string;
}

export const LessonsManager: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    targetGroup: 'adults' as Lesson['targetGroup'],
    weekDate: new Date().toLocaleDateString('fr-HT', { day: 'numeric', month: 'long', year: 'numeric' }),
    passage: '',
    memoryVerse: '',
    contentHtml: '',
    teacherNotes: '',
    author: 'Pasteur Bequel CHERELUS'
  });

  const [statusMsg, setStatusMsg] = useState<{ type: 'idle' | 'success' | 'error'; text: string }>({
    type: 'idle',
    text: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchLessons = () => {
    fetch('/api/lessons')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLessons(data);
      })
      .catch(err => console.warn('Erreur chargement leçons:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      title: '',
      targetGroup: 'adults',
      weekDate: new Date().toLocaleDateString('fr-HT', { day: 'numeric', month: 'long', year: 'numeric' }),
      passage: '',
      memoryVerse: '',
      contentHtml: '',
      teacherNotes: '',
      author: 'Pasteur Bequel CHERELUS'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (l: Lesson) => {
    setEditingId(l.id);
    setForm({
      title: l.title,
      targetGroup: l.targetGroup,
      weekDate: l.weekDate,
      passage: l.passage,
      memoryVerse: l.memoryVerse,
      contentHtml: l.contentHtml,
      teacherNotes: l.teacherNotes || '',
      author: l.author
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Èske w sèten ou vle efase leson sa a ?')) return;
    try {
      const res = await fetch(`/api/lessons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLessons(prev => prev.filter(l => l.id !== id));
      }
    } catch {
      alert('Erè pandan efasman leson an.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.passage.trim()) {
      setStatusMsg({ type: 'error', text: 'Tanpri ranpli tit la ak pasaj biblik la.' });
      return;
    }

    setSaving(true);
    setStatusMsg({ type: 'idle', text: '' });

    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/api/lessons/${editingId}` : '/api/lessons';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({ type: 'success', text: 'Leson an anrejistre epi pibliye ak siksè !' });
        fetchLessons();
        setTimeout(() => {
          setIsModalOpen(false);
          setStatusMsg({ type: 'idle', text: '' });
        }, 1500);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Erè anrejistreman.' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Erè koneksyon ak sèvè a.' });
    } finally {
      setSaving(false);
    }
  };

  const handleShareWhatsApp = (l: Lesson) => {
    const text = encodeURIComponent(
      `📖 *Nouvo Leson Lekòl Dimanch – Église du Nazaréen de Damé*\n\n*Tit :* ${l.title}\n*Kategori :* ${l.targetGroup.toUpperCase()}\n*Pasaj :* ${l.passage}\n*Vèsè pou memorize :* ${l.memoryVerse}\n\nLi leson konplè a sou sit la : ${window.location.origin}/leson-biblik\n\n« Sainteté à l'Éternel »`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Opsyon 7 : Lekòl Dimanch &amp; Resous Biblik</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            Jesyon &amp; Piblikasyon Leson yo
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pibliye leson pou timoun, jèn ak granmoun, epi pataje yo dirèkteman ak monitè yo sou WhatsApp.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => onNavigate('/leson-biblik')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center space-x-1.5"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <span>Wè Paj Piblik la</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition flex items-center space-x-2 shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Ajoute yon Nouvo Leson</span>
          </button>
        </div>
      </div>

      {/* List of lessons */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
          <p className="text-xs text-slate-500 mt-2 font-mono">Chajman leson yo...</p>
        </div>
      ) : lessons.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8">
          <BookOpen className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-60" />
          <h3 className="font-serif font-bold text-slate-800 text-base">Pa gen okenn leson ki anrejistre kounye a.</h3>
          <p className="text-xs text-slate-500 mt-1">Klike sou bouton anlè a pou pibliye premye leson lekòl dimanch la.</p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
          >
            Kreye yon Leson
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {lessons.map(l => (
            <div 
              key={l.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {l.targetGroup}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {l.weekDate}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-slate-900 text-base">
                  {l.title}
                </h3>

                <div className="p-3 rounded-xl bg-amber-50 text-xs text-amber-900 font-mono">
                  📖 {l.passage}
                </div>

                {l.memoryVerse && (
                  <p className="text-xs italic text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 line-clamp-2">
                    « {l.memoryVerse} »
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Otè : <strong>{l.author}</strong>
                </span>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleShareWhatsApp(l)}
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                    title="Pataje leson an sou WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(l)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold"
                  >
                    Modifye
                  </button>

                  <button
                    onClick={() => handleDelete(l.id)}
                    className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                    title="Efase leson an"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Kreye / Modifye Leson */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-bold text-slate-900 text-lg">
                  {editingId ? 'Modifye Leson an' : 'Kreye yon Nouvo Leson Lekòl Dimanch'}
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
                <label className="block font-bold text-slate-700 mb-1">Tit Leson an *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Mache nan Sentite devan Bondye"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gwoup Moun yo</label>
                  <select
                    value={form.targetGroup}
                    onChange={e => setForm({ ...form, targetGroup: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 bg-white text-xs"
                  >
                    <option value="adults">Granmoun</option>
                    <option value="youth">Jeunesse (JNI)</option>
                    <option value="children">Timoun</option>
                    <option value="teachers">Gid Monitè</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dat pou Dimanch la</label>
                  <input
                    type="text"
                    placeholder="Ex : Dimanche 19 Octobre 2026"
                    value={form.weekDate}
                    onChange={e => setForm({ ...form, weekDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pasaj Biblik *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : 1 Pyè 1:13-16"
                    value={form.passage}
                    onChange={e => setForm({ ...form, passage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Otè / Enstriktè</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={e => setForm({ ...form, author: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vèsè pou memorize</label>
                <input
                  type="text"
                  placeholder="Ex : « Menm jan moun ki rele nou an sen, se pou nou menm tou nou sen nan tout kondwit nou » (1 Pyè 1:15)"
                  value={form.memoryVerse}
                  onChange={e => setForm({ ...form, memoryVerse: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kontni Leson an (HTML / Tèks) *</label>
                <textarea
                  rows={6}
                  required
                  placeholder="<p>Entwodiksyon sou tèm nan...</p><h3>1. Prensip Sentite</h3><p>Eksplikasyon...</p>"
                  value={form.contentHtml}
                  onChange={e => setForm({ ...form, contentHtml: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 leading-relaxed font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nòt Espesyal pou Monitè / Pwofesè a</label>
                <textarea
                  rows={2}
                  placeholder="Konsèy pedagojik pou fè timoun yo konprann oswa aktivite pratik pou klas la..."
                  value={form.teacherNotes}
                  onChange={e => setForm({ ...form, teacherNotes: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 leading-relaxed text-xs"
                />
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
                  Anile
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition flex items-center space-x-2 shadow-md disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Anrejistreman...</span>
                    </>
                  ) : (
                    <span>{editingId ? 'Mete a Jou' : 'Pibliye Leson an'}</span>
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
