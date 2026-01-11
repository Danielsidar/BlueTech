import React, { useState } from 'react';
import { CheckCircle2, X, ArrowLeft, ArrowRight, RotateCcw, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLocalized } from '../utils/i18n';

interface QuizModalProps {
  questions: any[];
  onComplete: (score: number) => void;
  onClose: () => void;
  title: string;
  minScore?: number;
}

const QuizModal: React.FC<QuizModalProps> = ({ questions, onComplete, onClose, title, minScore = 80 }) => {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  const score = Math.round((questions.reduce((acc, q, i) => acc + (answers[i] === q.correctAnswer ? 1 : 0), 0) / questions.length) * 100);
  const isPassed = score >= minScore;

  const handleSelect = (idx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIdx] = idx;
    setAnswers(newAnswers);
  };

  const next = () => {
    if (currentIdx < questions.length - 1) setCurrentIdx(currentIdx + 1);
    else {
      onComplete(score);
      setShowResult(true);
    }
  };

  const handleRetry = () => {
    setAnswers([]);
    setCurrentIdx(0);
    setShowResult(false);
  };

  if (!questions || questions.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-navy/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-navy">{title}</h2>
            {!showResult && <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{t('quiz.min_score_hint', { score: minScore })}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="p-8 md:p-12 overflow-y-auto">
          {!showResult ? (
            <div className="space-y-8 text-inline-start">
              <div className="flex items-center justify-between text-sm text-gray-400 font-bold uppercase tracking-wider">
                <span>{t('quiz.question_progress', { current: currentIdx + 1, total: questions.length })}</span>
                <div className="w-32 bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full transition-all duration-500" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}></div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-navy leading-tight">
                {getLocalized(questions[currentIdx], 'question', lng)}
              </h3>

              <div className="space-y-3">
                {((getLocalized(questions[currentIdx], 'options', lng) || questions[currentIdx].options) as string[]).map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    className={`w-full p-5 rounded-2xl border-2 text-inline-start transition-all font-bold ${
                      answers[currentIdx] === i 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-gray-100 hover:border-gray-200 text-gray-600'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="pt-8 flex justify-between gap-4">
                <button 
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(currentIdx - 1)}
                  className="flex-1 py-4 px-6 rounded-2xl border-2 border-gray-100 font-bold text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
                >
                  {lng === 'he' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                  {t('quiz.prev')}
                </button>
                <button 
                  disabled={answers[currentIdx] === undefined}
                  onClick={next}
                  className="flex-[2] py-4 px-6 rounded-2xl bg-primary text-white font-bold hover:bg-primary-dark shadow-xl shadow-primary/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {currentIdx === questions.length - 1 ? t('quiz.finish') : t('quiz.next')}
                  {lng === 'he' ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-8 py-4">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-500 ${isPassed ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                {isPassed ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
              </div>
              
              <div>
                <h3 className="text-3xl font-black text-navy">{isPassed ? t('quiz.passed') : t('quiz.failed')}</h3>
                <p className="text-4xl font-black text-primary mt-4">{t('quiz.score', { score })}</p>
              </div>

              <div className="bg-gray-50 rounded-3xl p-6 text-inline-start space-y-4">
                <h4 className="font-black text-navy uppercase tracking-wider text-sm">{t('quiz.summary')}</h4>
                <div className="space-y-3">
                  {questions.map((q, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-bold">
                      {answers[i] === q.correctAnswer ? 
                        <CheckCircle2 size={18} className="text-green-500 shrink-0" /> : 
                        <XCircle size={18} className="text-red-500 shrink-0" />
                      }
                      <span className="text-gray-600 line-clamp-1">{getLocalized(q, 'question', lng)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                {!isPassed && (
                  <button onClick={handleRetry} className="flex-1 flex items-center justify-center gap-2 border-2 border-primary text-primary px-8 py-4 rounded-2xl font-bold hover:bg-primary/5 transition-all">
                    <RotateCcw size={20} />
                    {t('quiz.retry')}
                  </button>
                )}
                <button onClick={onClose} className="flex-[2] bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all">
                  {t('quiz.back_button')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
