import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import PhotoUpload from './PhotoUpload';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: NewEntry) => Promise<void>;
}

export interface NewEntry {
  title: string;
  date: string;
  original_text: string;
  photos: File[];
}

export default function EntryModal({ isOpen, onClose, onSave }: EntryModalProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Speech recognition for text input
  const handleVoiceInput = () => {
    if (!title.trim()) {
      alert(t('lifechonicle_alert_title_first'));
      return;
    }
    if (!date) {
      alert(t('lifechonicle_alert_date_first'));
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(t('lifechonicle_alert_voice_unsupported'));
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText((prev) => prev + (prev ? ' ' : '') + transcript);
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      alert(t('lifechonicle_alert_voice_error', { error: event.error }));
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      alert(t('lifechonicle_alert_title_required'));
      return;
    }
    if (!date) {
      alert(t('lifechonicle_alert_date_required'));
      return;
    }
    if (!text.trim()) {
      alert(t('lifechonicle_alert_story_required'));
      return;
    }

    setLoading(true);
    try {
      await onSave({
        title: title.trim(),
        date,
        original_text: text.trim(),
        photos,
      });

      // Reset form
      setTitle('');
      setDate('');
      setText('');
      setPhotos([]);
      onClose();
    } catch (error) {
      console.error('Failed to save entry:', error);
      alert(t('lifechonicle_alert_create_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setTitle('');
    setDate('');
    setText('');
    setPhotos([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Dark overlay with blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-fadeIn"
        onClick={onClose}
        style={{ backdropFilter: 'blur(4px)' }}
      ></div>

      {/* Modal Container - Centered with padding */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl transform transition-all animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Compact & Sticky */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-emerald-50 sticky top-0 z-10">
            <h2 className="text-2xl font-bold text-teal-700 flex items-center gap-2">
              <span className="text-2xl">✍️</span>
              {t('lifechonicle_form_title')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/70 rounded-lg transition-colors group"
              disabled={loading}
              title="Schließen (ESC)"
            >
              <X className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
            </button>
          </div>

          {/* Form - Scrollable content */}
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-80px)]">
            <div className="px-6 py-5 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('lifechonicle_form_headline_label')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('lifechonicle_form_headline_placeholder')}
                  className="w-full px-4 py-3 text-base bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('lifechonicle_form_date_label')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 text-base bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  required
                  disabled={loading}
                />
              </div>

              {/* Text with Voice Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('lifechonicle_form_story_label')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t('lifechonicle_form_story_placeholder')}
                    rows={6}
                    className="w-full px-4 py-3 pr-14 text-base bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none transition-all"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    disabled={isRecording || loading}
                    className={`absolute bottom-2 right-2 p-2.5 rounded-lg transition-all shadow-sm ${
                      isRecording
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-teal-500 text-white hover:bg-teal-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={isRecording ? t('lifechonicle_voice_recording') : t('lifechonicle_voice_start')}
                  >
                    <span className="text-base">{isRecording ? '🔴' : '🎤'}</span>
                  </button>
                </div>
                {isRecording && (
                  <p className="text-xs text-red-600 mt-1.5 animate-pulse font-medium">
                    🎤 {t('lifechonicle_voice_recording_hint')}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                  <span>💡</span> {t('lifechonicle_voice_tip')}
                </p>
              </div>

              {/* Photo Upload */}
              <PhotoUpload photos={photos} onChange={setPhotos} disabled={loading} />
            </div>

            {/* Buttons - Sticky Footer */}
            <div className="sticky bottom-0 bg-gradient-to-t from-gray-50 to-white border-t border-gray-200 px-6 py-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 text-base bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all shadow-sm hover:shadow"
                  disabled={loading}
                >
                  ❌ {t('lifechonicle_btn_cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 text-base bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-700 hover:to-emerald-700 font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
                  disabled={loading || !title.trim() || !date || !text.trim()}
                >
                  {loading ? '⏳ ' + t('lifechonicle_saving') : '✅ ' + t('lifechonicle_btn_save')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
