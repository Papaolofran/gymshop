import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { LuLoaderCircle, LuUpload, LuX, LuImage } from 'react-icons/lu';
import { uploadProductImage } from '../../services/productAdminService';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export const ImageUploader = ({ images, onChange }: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages = [...images];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validar tipo
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`"${file.name}" no es un formato válido. Solo JPEG, PNG o WebP.`);
        continue;
      }

      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" es demasiado grande. Máximo 5MB.`);
        continue;
      }

      try {
        const url = await uploadProductImage(file);
        newImages.push(url);
        toast.success(`"${file.name}" subida correctamente`);
      } catch {
        toast.error(`Error al subir "${file.name}"`);
      }
    }

    // Limpiar slots vacíos que ya no se necesitan
    const cleaned = newImages.filter(img => img.trim() !== '');
    onChange(cleaned.length > 0 ? cleaned : ['']);
    setUploading(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input para permitir subir el mismo archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages.length > 0 ? newImages : ['']);
  };

  const handleUrlChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    onChange(newImages);
  };

  const handleAddUrlSlot = () => {
    onChange([...images, '']);
  };

  // Filtrar imágenes con URL (ya subidas o pegadas)
  const uploadedImages = images.filter(img => img.trim() !== '');

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium mb-2">
        Imágenes del producto
      </label>

      {/* Zona de drag & drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <LuLoaderCircle className="animate-spin text-blue-600" size={40} />
            <p className="text-sm text-gray-500">Subiendo imagen...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <LuUpload className="text-gray-400" size={40} />
            <p className="text-sm text-gray-600 font-medium">
              Arrastrá y soltá imágenes aquí
            </p>
            <p className="text-xs text-gray-400">
              o hacé clic para seleccionar • JPEG, PNG, WebP • Máx. 5MB
            </p>
          </div>
        )}
      </div>

      {/* Preview de imágenes subidas */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {uploadedImages.map((img, index) => (
            <div
              key={`${img}-${index}`}
              className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square"
            >
              <img
                src={img}
                alt={`Producto ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '';
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.classList.add('bg-gray-100');
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <button
                type="button"
                onClick={() => handleRemoveImage(images.indexOf(img))}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Eliminar imagen"
              >
                <LuX size={14} />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                  Principal
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Opción de agregar por URL */}
      <div className="border-t border-gray-200 pt-3">
        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
          <LuImage size={12} />
          También podés agregar imágenes por URL:
        </p>
        {images.map((image, index) => {
          // Solo mostrar inputs de URL para slots vacíos o si el usuario quiere agregar por URL
          if (image.trim() !== '' && uploadedImages.includes(image)) return null;
          return (
            <div key={`url-${index}`} className="flex gap-2 mb-2">
              <input
                type="url"
                value={image}
                onChange={(e) => handleUrlChange(index, e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                >
                  Quitar
                </button>
              )}
            </div>
          );
        })}
        <button
          type="button"
          onClick={handleAddUrlSlot}
          className="text-xs text-blue-600 hover:underline"
        >
          + Agregar URL de imagen
        </button>
      </div>
    </div>
  );
};
