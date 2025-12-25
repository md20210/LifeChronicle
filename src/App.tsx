import { useState, useEffect } from 'react';
import TimelineEntry from './components/TimelineEntry';
import { lifeChronicleApi } from './services/api';
import type { TimelineEntry as TimelineEntryType } from './types';
import { useLanguage } from './contexts/LanguageContext';

// Color palette for timeline entries (like in the image)
const COLORS = [
  { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-900', dot: 'bg-purple-500' },
  { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-900', dot: 'bg-teal-500' },
  { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-900', dot: 'bg-green-500' },
  { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-900', dot: 'bg-yellow-500' },
  { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-900', dot: 'bg-orange-500' },
  { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-900', dot: 'bg-pink-500' },
];

function App() {
  const { t, language, setLanguage } = useLanguage();
  const [entries, setEntries] = useState<TimelineEntryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newText, setNewText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const data = await lifeChronicleApi.getEntries();
      // Sort by date (newest first)
      const sorted = data.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setEntries(sorted);
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      alert(t('lifechonicle_alert_title_required'));
      return;
    }
    if (!newDate) {
      alert(t('lifechonicle_alert_date_required'));
      return;
    }
    if (!newText.trim()) {
      alert(t('lifechonicle_alert_story_required'));
      return;
    }

    try {
      await lifeChronicleApi.createEntry({
        title: newTitle.trim(),
        date: newDate,
        original_text: newText.trim(),
      });
      setNewTitle('');
      setNewDate('');
      setNewText('');
      setShowAddForm(false);
      loadEntries();
    } catch (error) {
      console.error('Failed to create entry:', error);
      alert(t('lifechonicle_alert_create_error'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await lifeChronicleApi.deleteEntry(id);
      loadEntries();
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert(t('lifechonicle_alert_delete_error'));
    }
  };

  const handleProcess = async (id: string) => {
    try {
      console.log('Processing entry:', id);
      const result = await lifeChronicleApi.processEntry(id);
      console.log('Process result:', result);
      await loadEntries();
    } catch (error: any) {
      console.error('Failed to process entry:', error);
      console.error('Error response:', error.response?.data);
      alert(t('lifechonicle_alert_process_error', { error: error.response?.data?.detail || error.message }));
    }
  };

  // Speech recognition for text input
  const handleVoiceInput = () => {
    if (!newTitle.trim()) {
      alert(t('lifechonicle_alert_title_first'));
      return;
    }
    if (!newDate) {
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
      setNewText((prev) => prev + (prev ? ' ' : '') + transcript);
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

  // Extract year from date string
  const getYearFromDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      const yearMatch = dateStr.match(/\d{4}/);
      return yearMatch ? yearMatch[0] : dateStr;
    }
    return date.getFullYear().toString();
  };

  const handleExportPDF = async () => {
    try {
      const blob = await lifeChronicleApi.exportPDF();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'my-life-chronicle.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert(t('lifechonicle_alert_pdf_error'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-gray-600 text-lg">{t('lifechonicle_loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-teal-600 mb-2 flex items-center gap-3">
                <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="32" r="32" fill="#14B8A6"/>
                  <text x="32" y="42" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="white" textAnchor="middle">LC</text>
                </svg>
                LifeChronicle
              </h1>
              <p className="text-gray-600">
                {t('lifechonicle_app_subtitle')}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Language Toggle */}
              <div className="flex items-center gap-2">
                {['de', 'en', 'es'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang as 'de' | 'en' | 'es')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                      language === lang
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                onClick={handleExportPDF}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-all shadow-md"
              >
                📖 {t('lifechonicle_btn_export_pdf')}
              </button>
            </div>
          </div>
        </header>

        {/* Add Entry Button - Centered */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-8 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium transition-all shadow-md text-lg"
          >
            ➕ {t('lifechonicle_btn_new_entry')}
          </button>
        </div>

        {/* Add Entry Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t('lifechonicle_form_title')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('lifechonicle_form_headline_label')}
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={t('lifechonicle_form_headline_placeholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('lifechonicle_form_date_label')}
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('lifechonicle_form_story_label')}
                </label>
                <div className="relative">
                  <textarea
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder={t('lifechonicle_form_story_placeholder')}
                    rows={6}
                    className="w-full px-4 py-2 pr-14 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    disabled={isRecording}
                    className={`absolute bottom-3 right-3 p-2 rounded-lg transition-all ${
                      isRecording
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-teal-500 text-white hover:bg-teal-600'
                    }`}
                    title={isRecording ? t('lifechonicle_voice_recording') : t('lifechonicle_voice_start')}
                  >
                    {isRecording ? '🔴' : '🎤'}
                  </button>
                </div>
                {isRecording && (
                  <p className="text-sm text-red-600 mt-1 animate-pulse">
                    🎤 {t('lifechonicle_voice_recording_hint')}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  💡 {t('lifechonicle_voice_tip')}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreate}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all"
                >
                  ✅ {t('lifechonicle_btn_save')}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTitle('');
                    setNewDate('');
                    setNewText('');
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition-all"
                >
                  ❌ {t('lifechonicle_btn_cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            📅 {t('lifechonicle_timeline_title', { count: entries.length })}
          </h2>

          {entries.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">
                {t('lifechonicle_empty_state')}
              </p>
              <p className="text-gray-400 text-sm">
                {t('lifechonicle_empty_hint')}
              </p>
            </div>
          ) : (
            <div className="relative pl-16">
              {/* Vertical Timeline Line */}
              <div className="absolute left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 via-teal-500 to-teal-600"></div>

              {/* Timeline Entries */}
              <div className="space-y-8">
                {entries.map((entry, index) => {
                  const color = COLORS[index % COLORS.length];

                  return (
                    <div key={entry.id} className="relative">
                      {/* Year Label */}
                      <div className="absolute -left-16 top-0 w-12 text-right">
                        <span className="inline-block px-2 py-1 bg-teal-500 text-white font-bold rounded text-sm shadow-md">
                          {getYearFromDate(entry.date)}
                        </span>
                      </div>

                      {/* Timeline Dot */}
                      <div className={`absolute -left-[50px] top-4 w-4 h-4 rounded-full ${color.dot} border-2 border-white shadow-lg`}></div>

                      {/* Entry Card */}
                      <div className={`${color.bg} ${color.border} border-2 rounded-xl p-5 shadow-md`}>
                        {/* Title & Status */}
                        <div className="flex justify-between items-start mb-3">
                          <h3 className={`text-xl font-bold ${color.text}`}>
                            {entry.title}
                          </h3>

                          {/* Status Badge */}
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              entry.status === 'processed'
                                ? 'bg-green-200 text-green-800'
                                : 'bg-yellow-200 text-yellow-800'
                            }`}
                          >
                            {entry.status === 'processed' ? t('lifechonicle_status_processed') : t('lifechonicle_status_pending')}
                          </span>
                        </div>

                        {/* Entry Component */}
                        <TimelineEntry
                          entry={entry}
                          onDelete={handleDelete}
                          onProcess={handleProcess}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            {t('lifechonicle_footer_powered_by')}{' '}
            <a
              href="https://www.dabrock.info"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              General Backend
            </a>{' '}
            • {t('lifechonicle_footer_privacy')}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
