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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
            <h2 className="text-2xl font-bold text-gray-800">
              {t('lifechonicle_form_title')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('lifechonicle_form_headline_label')} *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('lifechonicle_form_headline_placeholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('lifechonicle_form_date_label')} *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]} // No future dates
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            {/* Text with Voice Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('lifechonicle_form_story_label')} *
              </label>
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t('lifechonicle_form_story_placeholder')}
                  rows={8}
                  className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={isRecording || loading}
                  className={`absolute bottom-3 right-3 p-2 rounded-lg transition-all ${
                    isRecording
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-teal-500 text-white hover:bg-teal-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isRecording ? t('lifechonicle_voice_recording') : t('lifechonicle_voice_start')}
                >
                  {isRecording ? '🔴' : '🎤'}
                </button>
              </div>
              {isRecording && (
                <p className="text-sm text-red-600 mt-2 animate-pulse">
                  🎤 {t('lifechonicle_voice_recording_hint')}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                💡 {t('lifechonicle_voice_tip')}
              </p>
            </div>

            {/* Photo Upload */}
            <PhotoUpload photos={photos} onChange={setPhotos} disabled={loading} />

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-all shadow-sm"
                disabled={loading}
              >
                ❌ {t('lifechonicle_btn_cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !title.trim() || !date || !text.trim()}
              >
                {loading ? '⏳ ' + t('lifechonicle_saving') : '✅ ' + t('lifechonicle_btn_save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
