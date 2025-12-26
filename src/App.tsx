import { useState, useEffect } from 'react';
import TimelineEntry from './components/TimelineEntry';
import { LanguageToggle } from './components/LanguageToggle';
import EntryModal, { type NewEntry } from './components/EntryModal';
import { lifeChronicleApi } from './services/api';
import type { TimelineEntry as TimelineEntryType } from './types';
import { useLanguage } from './contexts/LanguageContext';

// Color palette for timeline entries (like in timeline.jpg)
const COLORS = [
  { bgColor: '#e9d5ff', borderColor: '#c084fc', textColor: '#581c87', dotColor: '#9333ea' }, // Purple
  { bgColor: '#ccfbf1', borderColor: '#5eead4', textColor: '#134e4a', dotColor: '#14b8a6' }, // Teal
  { bgColor: '#d1fae5', borderColor: '#6ee7b7', textColor: '#065f46', dotColor: '#10b981' }, // Green
  { bgColor: '#fef3c7', borderColor: '#fcd34d', textColor: '#78350f', dotColor: '#f59e0b' }, // Yellow
  { bgColor: '#fed7aa', borderColor: '#fdba74', textColor: '#7c2d12', dotColor: '#f97316' }, // Orange
  { bgColor: '#fce7f3', borderColor: '#f9a8d4', textColor: '#831843', dotColor: '#ec4899' }, // Pink
];

function App() {
  const { t, language } = useLanguage();
  const [llmType, setLlmType] = useState<'ollama' | 'grok'>('ollama');
  const [entries, setEntries] = useState<TimelineEntryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  const handleSaveEntry = async (entry: NewEntry) => {
    try {
      await lifeChronicleApi.createEntry({
        title: entry.title,
        date: entry.date,
        original_text: entry.original_text,
        photos: entry.photos,
      });
      await loadEntries();
    } catch (error) {
      console.error('Failed to create entry:', error);
      throw error; // Re-throw so EntryModal can handle it
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
      setProcessingId(id); // Show loading spinner
      console.log('Processing entry:', id, 'with provider:', llmType);
      const result = await lifeChronicleApi.processEntry(id, llmType);
      console.log('Process result:', result);
      await loadEntries();
    } catch (error: any) {
      console.error('Failed to process entry:', error);
      console.error('Error response:', error.response?.data);
      alert(t('lifechonicle_alert_process_error', { error: error.response?.data?.detail || error.message }));
    } finally {
      setProcessingId(null); // Hide loading spinner
    }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-teal-600">{t('lifechonicle_app_title')}</h1>

          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <LanguageToggle />

            {/* LLM Toggle */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setLlmType('ollama')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  llmType === 'ollama'
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('lifechonicle_llm_toggle_local')}
              </button>
              <button
                onClick={() => setLlmType('grok')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  llmType === 'grok'
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('lifechonicle_llm_toggle_grok')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Add Entry Button - Left aligned */}
        <div className="mb-8">
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-all shadow-sm"
          >
            ➕ {t('lifechonicle_btn_new_entry')}
          </button>
        </div>

        {/* Entry Modal */}
        <EntryModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveEntry}
        />

        {/* Timeline */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-12 text-center">
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
            <div className="relative max-w-5xl mx-auto">
              {/* Central Timeline Line (thick, 10px) - SEHR SICHTBAR */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  top: 0,
                  bottom: 0,
                  width: '12px',
                  backgroundColor: '#9ca3af',
                  borderRadius: '6px',
                  zIndex: 5
                }}
              ></div>

              {/* Timeline Entries - Alternating left/right */}
              <div className="space-y-20">
                {entries.map((entry, index) => {
                  const color = COLORS[index % COLORS.length];
                  const isLeft = index % 2 === 0;

                  // Format date for display (e.g., "Juni 1985")
                  const formattedDate = new Date(entry.date).toLocaleDateString(
                    language === 'de' ? 'de-DE' : language === 'es' ? 'es-ES' : 'en-US',
                    { month: 'long', year: 'numeric' }
                  );

                  return (
                    <div key={entry.id} className="relative">
                      {/* Large Year Circle on the center line - SEHR GROSS UND BUNT */}
                      <div
                        className="absolute flex items-center justify-center rounded-full shadow-xl font-bold"
                        style={{
                          left: '50%',
                          transform: 'translateX(-50%)',
                          top: '-16px',
                          width: '100px',
                          height: '100px',
                          backgroundColor: color.dotColor,
                          color: 'white',
                          fontSize: '2rem',
                          zIndex: 10,
                          border: '4px solid white'
                        }}
                      >
                        {getYearFromDate(entry.date)}
                      </div>

                      {/* Entry Card - Left or Right */}
                      <div className={`relative ${isLeft ? 'pr-[55%]' : 'pl-[55%]'} pt-20`}>
                        <div
                          className="rounded-xl p-6 shadow-lg relative"
                          style={{
                            backgroundColor: color.bgColor,
                            border: `2px solid ${color.borderColor}`
                          }}
                        >
                          {/* Arrow pointing to center line - SAME COLOR AS BOX */}
                          <div
                            style={{
                              position: 'absolute',
                              top: '40px',
                              [isLeft ? 'right' : 'left']: '-30px',
                              width: 0,
                              height: 0,
                              borderTop: '15px solid transparent',
                              borderBottom: '15px solid transparent',
                              [isLeft ? 'borderLeft' : 'borderRight']: `30px solid ${color.bgColor}`,
                              zIndex: 8
                            }}
                          ></div>

                          <TimelineEntry
                            entry={entry}
                            formattedDate={formattedDate}
                            color={color}
                            onDelete={handleDelete}
                            onProcess={handleProcess}
                            isProcessing={processingId === entry.id}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {/* PDF Export Section */}
        {entries.length > 0 && (
          <section className="mt-16 bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 rounded-2xl p-10 border-2 border-teal-200 shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
                <span className="text-6xl">📖</span>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                Weiterführend
              </h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Exportiere deine Timeline als professionell formatiertes PDF-Dokument.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-all">
                <div className="text-3xl mb-3">🎨</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Farbige Timeline</h3>
                <p className="text-sm text-gray-600">
                  Alle Timeline-Farben und -Pfeile werden im PDF übernommen
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-teal-500 hover:shadow-lg transition-all">
                <div className="text-3xl mb-3">✨</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">LLM-Texte</h3>
                <p className="text-sm text-gray-600">
                  Literarisch überarbeitete Kapitel von deinem gewählten LLM
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-amber-500 hover:shadow-lg transition-all">
                <div className="text-3xl mb-3">📄</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Professionelles Layout</h3>
                <p className="text-sm text-gray-600">
                  Schön formatiert mit Inhaltsverzeichnis und Kapiteln
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleExportPDF}
                className="px-10 py-5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xl font-bold rounded-xl hover:from-teal-700 hover:to-emerald-700 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center gap-3"
              >
                <span className="text-3xl">📖</span>
                PDF-Buch herunterladen
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  {entries.length} Kapitel
                </span>
              </button>
            </div>
          </section>
        )}

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
            • {t('lifechonicle_footer_local_gdpr')}
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
