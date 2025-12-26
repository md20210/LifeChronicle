import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface PhotoUploadProps {
  photos: File[];
  onChange: (photos: File[]) => void;
  disabled?: boolean;
}

export default function PhotoUpload({ photos, onChange, disabled = false }: PhotoUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_PHOTOS = 5;
  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addFiles(files);
    }
  };

  const addFiles = (newFiles: File[]) => {
    // Filter valid image files
    const validFiles = newFiles.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isSizeOk = file.size <= MAX_SIZE;

      if (!isImage) {
        alert(`${file.name} ist kein Bild`);
        return false;
      }
      if (!isSizeOk) {
        alert(`${file.name} ist zu groß (max. 10 MB)`);
        return false;
      }
      return true;
    });

    // Add to existing photos (max 5 total)
    const totalPhotos = [...photos, ...validFiles].slice(0, MAX_PHOTOS);
    onChange(totalPhotos);

    if ([...photos, ...validFiles].length > MAX_PHOTOS) {
      alert(`Maximal ${MAX_PHOTOS} Fotos erlaubt`);
    }
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        📷 Fotos (optional, max. {MAX_PHOTOS})
      </label>

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          dragActive
            ? 'border-teal-500 bg-teal-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {photos.length === 0 ? (
          <>
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-2 font-medium">
              Fotos hierher ziehen
            </p>
            <p className="text-sm text-gray-500 mb-4">
              oder klicke, um Dateien auszuwählen
            </p>
            <button
              type="button"
              onClick={() => !disabled && inputRef.current?.click()}
              disabled={disabled}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ImageIcon className="w-4 h-4 inline mr-2" />
              Fotos auswählen
            </button>
          </>
        ) : (
          <div className="text-sm text-gray-600">
            <ImageIcon className="w-6 h-6 inline mr-2 text-teal-600" />
            {photos.length} Foto{photos.length > 1 ? 's' : ''} ausgewählt
            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => !disabled && inputRef.current?.click()}
                disabled={disabled}
                className="ml-4 text-teal-600 hover:text-teal-700 font-medium underline disabled:opacity-50"
              >
                + Weitere hinzufügen
              </button>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Photo Previews Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative aspect-square group">
              <img
                src={URL.createObjectURL(photo)}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover rounded-lg shadow-md"
              />
              {/* File info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                {(photo.size / 1024 / 1024).toFixed(1)} MB
              </div>
              {/* Remove button */}
              <button
                type="button"
                onClick={() => !disabled && removePhoto(index)}
                disabled={disabled}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Foto entfernen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Helper text */}
      <p className="text-xs text-gray-500 mt-2">
        💡 JPG, PNG oder HEIC • Max. {MAX_SIZE / 1024 / 1024} MB pro Foto • EXIF-Daten werden automatisch extrahiert
      </p>
    </div>
  );
}
