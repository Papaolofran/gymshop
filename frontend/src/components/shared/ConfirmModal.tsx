import { LuInfo, LuX } from 'react-icons/lu';
import { FiAlertTriangle } from 'react-icons/fi';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar', 
  onConfirm, 
  onCancel 
}: Props) => {
  if (!isOpen) return null;

  const isDestructive = title.toLowerCase().includes('eliminar') || title.toLowerCase().includes('cancelar');

  return (
    <div className="fixed bottom-6 right-6 z-[100] sm:bottom-8 sm:right-8 animate-slide-in pointer-events-none">
      <div 
        className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 w-full max-w-sm sm:w-96 overflow-hidden pointer-events-auto ring-1 ring-black/5"
      >
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full flex-shrink-0 ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                {isDestructive ? <FiAlertTriangle size={20} /> : <LuInfo size={20} />}
              </div>
              <h3 className="text-base font-bold text-gray-900">{title}</h3>
            </div>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors p-1" title="Cerrar">
              <LuX size={18} />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-5 pl-12">{message}</p>
          
          <div className="flex justify-end gap-3 pl-12">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm ${
                isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
