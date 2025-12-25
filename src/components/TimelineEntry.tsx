import { useState } from 'react';
import type { TimelineEntry as TimelineEntryType } from '../types';
import { ttsService } from '../services/tts';
import { useLanguage } from '../contexts/LanguageContext';

interface TimelineEntryProps {
  entry: TimelineEntryType;
  formattedDate: string; // e.g., "Juni 1985"
  color: { bgColor: string; borderColor: string; textColor: string; dotColor: string };
  onDelete: (id: string) => void;
  onProcess: (id: string) => void;
  isProcessing?: boolean;
}

const TimelineEntry: React.FC<TimelineEntryProps> = ({ entry, formattedDate, color, onDelete, onProcess, isProcessing = false }) => {
  const { t } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Get year from date
  const year = new Date(entry.date).getFullYear();

  // Display processed text if available, otherwise original
  const displayText = entry.processed_text || entry.original_text;

  const handleSpeak = () => {
    if (isSpeaking) {
      ttsService.stop();
      setIsSpeaking(false);
    } else {
      ttsService.speak(displayText, 'de-DE');
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), displayText.length * 50);
    }
  };

  const handleDelete = () => {
    if (confirm(t('lifechonicle_alert_delete_confirm'))) {
      onDelete(entry.id);
    }
  };

  return (
    <div>
      {/* Line 1: Year + Title (Date) */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold" style={{ color: color.textColor }}>
          {year} {entry.title} <span className="text-base font-normal text-gray-600">({formattedDate})</span>
        </h3>

        {/* Inline Action Buttons (subtle) */}
        <div className="flex gap-1 ml-4">
          <button
            onClick={handleSpeak}
            className={`p-1 text-sm rounded transition-all ${
              isSpeaking ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-blue-600'
            }`}
            title={t('lifechonicle_action_speak')}
          >
            {isSpeaking ? '⏸️' : '🔊'}
          </button>

          {entry.status === 'pending' && (
            <button
              onClick={() => onProcess(entry.id)}
              disabled={isProcessing}
              className={`p-1 text-sm transition-all ${
                isProcessing
                  ? 'text-gray-400 cursor-wait'
                  : 'text-purple-500 hover:text-purple-700'
              }`}
              title={isProcessing ? t('lifechonicle_action_processing') : t('lifechonicle_action_process')}
            >
              {isProcessing ? (
                <span className="inline-block animate-spin">⏳</span>
              ) : (
                '✨'
              )}
            </button>
          )}

          <button
            onClick={handleDelete}
            className="p-1 text-sm text-red-500 hover:text-red-700 transition-all"
            title={t('lifechonicle_action_delete')}
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Line 2: Summary Text (LLM-generated or original) */}
      <p className="text-gray-700 leading-relaxed">
        {displayText}
      </p>
    </div>
  );
};

export default TimelineEntry;
