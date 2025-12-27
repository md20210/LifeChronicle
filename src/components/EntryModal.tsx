import { useState, useEffect } from 'react';
import { X, Calendar, Type, FileText, Mic, MicOff, Save } from 'lucide-react';
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

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

    recognition.onstart = () => setIsRecording(true);
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
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
    setTitle('');
    setDate('');
    setText('');
    setPhotos([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('lifechonicle_form_title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Type className="w-4 h-4" />
                {t('lifechonicle_form_headline_label')}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('lifechonicle_form_headline_placeholder')}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
                required
                disabled={loading}
                autoFocus
              />
            </div>

            {/* Date Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4" />
                {t('lifechonicle_form_date_label')}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
                required
                disabled={loading}
              />
            </div>

            {/* Text Input with Voice */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FileText className="w-4 h-4" />
                {t('lifechonicle_form_story_label')}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t('lifechonicle_form_story_placeholder')}
                  rows={5}
                  className="w-full px-4 py-2.5 pr-12 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none transition-shadow"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={isRecording || loading}
                  className={`absolute bottom-2 right-2 w-9 h-9 rounded-md flex items-center justify-center transition-all ${
                    isRecording
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50`}
                  title={isRecording ? t('lifechonicle_voice_recording') : t('lifechonicle_voice_start')}
                >
                  {isRecording ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>
              </div>
              {isRecording && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                  {t('lifechonicle_voice_recording_hint')}
                </p>
              )}
            </div>

            {/* Photo Upload */}
            <PhotoUpload photos={photos} onChange={setPhotos} disabled={loading} />
          </div>

          {/* Footer Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-50"
            >
              {t('lifechonicle_btn_cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !date || !text.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('lifechonicle_saving')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t('lifechonicle_btn_save')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
