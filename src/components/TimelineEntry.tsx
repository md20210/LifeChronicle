import { useState } from 'react';
import type { TimelineEntry as TimelineEntryType } from '../types';
import { ttsService } from '../services/tts';
import { useLanguage } from '../contexts/LanguageContext';

interface TimelineEntryProps {
  entry: TimelineEntryType;
  onDelete: (id: string) => void;
  onProcess: (id: string) => void;
}

const TimelineEntry: React.FC<TimelineEntryProps> = ({ entry, onDelete, onProcess }) => {
  const { t } = useLanguage();
  const [showFull, setShowFull] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr; // Return as-is if not a valid date (e.g., just a year)
    }
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Truncate text to 3 lines (approx 150 chars)
  const getTruncatedText = (text: string): string => {
    if (text.length <= 150) return text;
    return text.substring(0, 150) + '...';
  };

  const displayText = entry.processed_text || entry.original_text;
  const truncatedText = getTruncatedText(displayText);

  const handleSpeak = () => {
    if (isSpeaking) {
      ttsService.stop();
      setIsSpeaking(false);
    } else {
      ttsService.speak(displayText, 'de-DE');
      setIsSpeaking(true);

      // Auto-stop indicator after speech ends
      setTimeout(() => setIsSpeaking(false), displayText.length * 50);
    }
  };

  const handleDelete = () => {
    if (confirm(t('lifechonicle_confirm_delete'))) {
      onDelete(entry.id);
    }
  };

  return (
    <div
      className={`rounded-lg border shadow-sm p-4 mb-4 transition-all ${
        entry.status === 'processed'
          ? 'bg-green-50 border-green-200'
          : 'bg-yellow-50 border-yellow-200'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📅</span>
          <div>
            <p className="font-semibold text-gray-800">{formatDate(entry.date)}</p>
            <span
              className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                entry.status === 'processed'
                  ? 'bg-green-200 text-green-800'
                  : 'bg-yellow-200 text-yellow-800'
              }`}
            >
              {entry.status === 'processed' ? '✅ Überarbeitet' : '🟡 Wartet'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSpeak}
            className={`p-2 rounded-lg transition-all ${
              isSpeaking
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
            }`}
            title={t('lifechonicle_btn_speak')}
          >
            {isSpeaking ? '⏸️' : '🔊'}
          </button>

          {entry.status === 'pending' && (
            <button
              onClick={() => onProcess(entry.id)}
              className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-all"
              title={t('lifechonicle_btn_process')}
            >
              ✨
            </button>
          )}

          <button
            onClick={handleDelete}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
            title={t('lifechonicle_btn_delete')}
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="text-gray-700">
        <p className="whitespace-pre-wrap">
          {showFull ? displayText : truncatedText}
        </p>

        {displayText.length > 150 && (
          <button
            onClick={() => setShowFull(!showFull)}
            className="mt-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            {showFull ? t('lifechonicle_btn_show_less') : t('lifechonicle_btn_show_more')}
          </button>
        )}
      </div>
    </div>
  );
};

export default TimelineEntry;
