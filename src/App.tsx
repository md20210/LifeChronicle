import { useState, useEffect } from 'react';
import TimelineEntry from './components/TimelineEntry';
import { lifeChronicleApi } from './services/api';
import type { TimelineEntry as TimelineEntryType, CreateEntryRequest } from './types';

function App() {
  const [entries, setEntries] = useState<TimelineEntryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDate, setNewDate] = useState('');
  const [newText, setNewText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

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
    if (!newDate || !newText.trim()) {
      alert('Bitte Datum und Text eingeben!');
      return;
    }

    try {
      const request: CreateEntryRequest = {
        date: newDate,
        original_text: newText.trim(),
      };
      await lifeChronicleApi.createEntry(request);
      setNewDate('');
      setNewText('');
      setShowAddForm(false);
      loadEntries();
    } catch (error) {
      console.error('Failed to create entry:', error);
      alert('Fehler beim Erstellen des Eintrags');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await lifeChronicleApi.deleteEntry(id);
      loadEntries();
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('Fehler beim Löschen');
    }
  };

  const handleProcess = async (id: string) => {
    try {
      await lifeChronicleApi.processEntry(id);
      loadEntries();
    } catch (error) {
      console.error('Failed to process entry:', error);
      alert('Fehler bei der LLM-Verarbeitung');
    }
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
      alert('Fehler beim PDF-Export');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Lädt...</p>
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
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                📖 LifeChronicle
              </h1>
              <p className="text-gray-600">
                Meine Lebensgeschichte - lokal & DSGVO-konform
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-md"
              >
                ➕ Neue Geschichte
              </button>

              <button
                onClick={handleExportPDF}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-all shadow-md"
              >
                📖 PDF Export
              </button>
            </div>
          </div>
        </header>

        {/* Add Entry Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Neue Geschichte erzählen
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Datum oder Jahr
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deine Geschichte
                </label>
                <textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Erzähle deine Geschichte... z.B. 'Mein erster Arbeitstag bei IBM war aufregend...'"
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreate}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all"
                >
                  ✅ Speichern
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewDate('');
                    setNewText('');
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition-all"
                >
                  ❌ Abbrechen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            📅 Meine Timeline ({entries.length})
          </h2>

          {entries.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">
                Noch keine Einträge vorhanden
              </p>
              <p className="text-gray-400 text-sm">
                Klicke auf "Neue Geschichte", um deine erste Lebensgeschichte zu erzählen!
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline Container with left border acting as vertical line */}
              <div className="border-l-4 border-gradient pl-12 space-y-8" style={{
                borderImageSource: 'linear-gradient(to bottom, #3b82f6, #a855f7, #ec4899)',
                borderImageSlice: 1
              }}>
                {/* Timeline Arrow at Top */}
                <div className="absolute left-0 -top-3 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[16px] border-l-transparent border-r-transparent border-b-blue-500 transform -translate-x-[6px]"></div>

                {/* Timeline Entries */}
                {entries.map((entry) => (
                  <div key={entry.id} className="relative">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[52px] top-4 w-5 h-5 rounded-full bg-blue-600 border-4 border-white shadow-lg ring-2 ring-blue-200"></div>

                    {/* Entry Content */}
                    <TimelineEntry
                      entry={entry}
                      onDelete={handleDelete}
                      onProcess={handleProcess}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            Powered by{' '}
            <a
              href="https://www.dabrock.info"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              General Backend
            </a>{' '}
            • 100% lokal & DSGVO-konform
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
