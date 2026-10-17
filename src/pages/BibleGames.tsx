import React, { useState, useEffect } from 'react';
import { BIBLE_QUESTIONS } from '../data/churchData';
import { BibleQuestion, HighScore } from '../types';
import { SEOHead } from '../components/SEOHead';
import { 
  Trophy, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Clock, 
  BookOpen, 
  Flame, 
  Star,
  Users,
  ChevronRight,
  Download,
  Printer,
  Share2,
  MessageSquare,
  Scroll
} from 'lucide-react';
import churchSealImg from '../assets/images/regenerated_image_1792011564270.x-icon';

interface BibleGamesProps {
  onNavigate: (path: string) => void;
}

export const BibleGames: React.FC<BibleGamesProps> = ({ onNavigate }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [highScores, setHighScores] = useState<HighScore[]>([
    { id: '1', playerName: 'Élie Jean', score: 10, total: 10, percentage: 100, date: '10 Oct 2026', mode: 'Mode Défi' },
    { id: '2', playerName: 'Esther Pierre', score: 9, total: 10, percentage: 90, date: '08 Oct 2026', mode: 'Mode Défi' },
    { id: '3', playerName: 'Pasteur Cherelus', score: 10, total: 10, percentage: 100, date: '05 Oct 2026', mode: 'Mode Défi' },
    { id: '4', playerName: 'Jeunesse JNI', score: 8, total: 10, percentage: 80, date: '02 Oct 2026', mode: 'Mode Défi' }
  ]);

  const questions: BibleQuestion[] = BIBLE_QUESTIONS;
  const currentQ = questions[currentQuestionIndex];

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    setGameStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setGameFinished(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setGameFinished(true);
      // Save HighScore
      const newScore: HighScore = {
        id: 'score-' + Date.now(),
        playerName: playerName || 'Joueur Anonyme',
        score: score + (selectedAnswer === currentQ.correctIndex ? 1 : 0),
        total: questions.length,
        percentage: Math.round(((score + (selectedAnswer === currentQ.correctIndex ? 1 : 0)) / questions.length) * 100),
        date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
        mode: 'Mode Défi'
      };
      setHighScores(prev => [newScore, ...prev].sort((a, b) => b.score - a.score).slice(0, 10));
    }
  };

  const restartQuiz = () => {
    setGameStarted(false);
    setGameFinished(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  return (
    <div className="space-y-16 pb-16">
      <SEOHead 
        title="Jeux Bibliques & Mode Défi – Testez vos Connaissances | Damé"
        description="Participez au Défi Biblique interactif de l'Église du Nazaréen de Damé : quiz chronométré, versets, doctrine de sainteté et tableau des meilleurs scores."
        path="/jeux-bibliques"
        image="/images/eglise/sceau-officiel.svg"
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-[#071322] to-[#0b1b33] text-white py-16 px-4 border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Trophy className="w-3.5 h-3.5" />
            <span>Édification Ludique &amp; Connaissance Biblique</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white">
            Jeux Bibliques &amp; Mode Défi
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            « Ta parole est une lampe à mes pieds, et une lumière sur mon sentier. » (Psaume 119:105)
          </p>
        </div>
      </section>

      {/* Main Game Interface */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {!gameStarted ? (
          /* Start Screen */
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-200 text-center space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">
                Prêt pour le Défi Biblique de Damé ?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                10 questions sélectionnées sur les Saintes Écritures, les personnages bibliques, l'histoire de l'Église de Damé et la doctrine de la sainteté.
              </p>
            </div>

            <form onSubmit={handleStartGame} className="max-w-xs mx-auto space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 text-left mb-1">
                  Votre Prénom ou Pseudo :
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Frère Samuel"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 text-center font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition flex items-center justify-center space-x-2"
              >
                <Flame className="w-4 h-4" />
                <span>Commencer le Quiz</span>
              </button>
            </form>
          </div>
        ) : !gameFinished ? (
          /* Active Question Screen */
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200 space-y-6">
            {/* Top status */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded">
                  Question {currentQuestionIndex + 1} / {questions.length}
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  Joueur : <strong className="text-slate-700">{playerName}</strong>
                </span>
              </div>

              <div className="flex items-center space-x-1.5 text-xs font-extrabold text-amber-600 bg-amber-100/60 px-3 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Score : {score} pts</span>
              </div>
            </div>

            {/* Question title */}
            <div className="space-y-2">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {currentQ.question}
              </h3>
            </div>

            {/* Options list */}
            <div className="space-y-3">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let optionStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';
                if (isAnswered) {
                  if (isCorrect) {
                    optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                  } else if (isSelected) {
                    optionStyle = 'bg-rose-50 border-rose-500 text-rose-900 font-bold';
                  } else {
                    optionStyle = 'bg-slate-50 border-slate-200 opacity-40 text-slate-500';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition flex items-center justify-between ${optionStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after answer */}
            {isAnswered && (
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-900">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>Référence : {currentQ.reference}</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {currentQ.explanation}
                </p>
                <div className="pt-2 text-right">
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-amber-300 hover:bg-slate-800 transition"
                  >
                    {currentQuestionIndex < questions.length - 1 ? 'Question Suivante →' : 'Voir mon résultat final ★'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Finished Screen */
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-200 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-xl">
              <Trophy className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">
                Félicitations, {playerName} !
              </h2>
              <p className="text-xs text-slate-500">
                Vous avez achevé le Défi Biblique officiel de l'Église du Nazaréen de Damé.
              </p>
            </div>

            {/* Big Score Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 max-w-sm mx-auto border border-amber-500/30 space-y-2">
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                Votre Score Final
              </span>
              <div className="font-serif text-4xl sm:text-5xl font-extrabold text-white">
                {score} / {questions.length}
              </div>
              <p className="text-xs text-slate-300">
                Taux de réussite : <strong className="text-amber-300">{Math.round((score / questions.length) * 100)}%</strong>
              </p>
            </div>

            {/* OPSYON 17: OFFICIAL DOWNLOADABLE / PRINTABLE CERTIFICATE */}
            <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-amber-50 border-4 border-double border-amber-600/60 shadow-xl text-center space-y-4 my-6 print:border-none print:shadow-none" id="certificate-print-area">
              <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                <img 
                  src={churchSealImg} 
                  alt="Sceau de l'Église" 
                  className="w-14 h-14 object-contain filter drop-shadow" 
                />
                <div>
                  <h3 className="font-serif font-black text-xs sm:text-sm text-slate-900 uppercase tracking-widest">
                    Église du Nazaréen de Damé
                  </h3>
                  <p className="text-[10px] text-amber-700 italic font-serif">
                    « Sainteté à l’Éternel » • Fondée en 1979
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold text-xs font-serif">
                  ★ EXCELLENCE ★
                </div>
              </div>

              <div className="py-2 space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-800 bg-amber-200/60 px-4 py-1 rounded-full inline-block">
                  SÈTIFIKA D’ONÈ &amp; EKSELANS BIBLIK
                </span>
                <p className="text-xs text-slate-500">Se rekonesans ofisyèl sa a ki bay bay :</p>
                <h2 className="font-serif text-2xl sm:text-3xl font-black text-slate-900 underline decoration-amber-500 underline-offset-4">
                  {playerName || 'Chanpyon Biblik'}
                </h2>
                <p className="text-xs text-slate-700 max-w-lg mx-auto leading-relaxed pt-1">
                  Pou bèl konesans li ak siksè li nan <strong>Défi Biblique de Damé</strong> avèk yon nòt de <strong>{score} sou {questions.length} ({Math.round((score / questions.length) * 100)}%)</strong>.
                </p>
              </div>

              <div className="pt-4 border-t border-amber-200 flex items-center justify-between text-[11px] text-slate-600">
                <div className="text-left">
                  <span className="block text-[10px] text-slate-400">Dat Livrezon :</span>
                  <span className="font-mono font-bold">
                    {new Date().toLocaleDateString('fr-HT', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block font-serif font-bold text-slate-900">Pasteur Bequel CHERELUS</span>
                  <span className="text-[10px] text-slate-500 italic">Pasteur Principal de Damé</span>
                </div>
              </div>
            </div>

            {/* Certificate Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition flex items-center space-x-2 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Enprime / Telechaje Sètifika a</span>
              </button>

              <button
                onClick={() => {
                  const text = encodeURIComponent(
                    `🏆 *Mwen soti resevwa Sètifika Ekselans nan Défi Biblique Église du Nazaréen de Damé !*\n\nNon m : *${playerName}*\nNòt mwen : *${score}/${questions.length} (${Math.round((score / questions.length) * 100)}%)*\n\nVin teste konesans biblik ou tou isit : ${window.location.origin}/jeux-bibliques\n\n« Sainteté à l'Éternel »`
                  );
                  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center space-x-2 shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Pataje Rezilta w sou WhatsApp</span>
              </button>

              <button
                onClick={restartQuiz}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 transition flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Rejouer un Défi</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Hall of Fame / High Scores Table */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="font-serif font-bold text-slate-900 text-lg">
                Tableau des Meilleurs Scores Bibliques
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">Mise à jour en temps réel</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Rang</th>
                  <th className="py-2.5 px-3">Joueur</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Pourcentage</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {highScores.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-bold font-mono text-slate-700">
                      #{index + 1}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {item.playerName}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-amber-600">
                      {item.score} / {item.total}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px]">
                        {item.percentage}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {item.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
