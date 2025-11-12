import { create } from 'zustand';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ModalState {
  isConfirmModalOpen: boolean;
  confirmModalProps: ConfirmModalProps;
  openConfirmModal: (props: ConfirmModalProps) => void;
  closeConfirmModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isConfirmModalOpen: false,
  confirmModalProps: {
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    onConfirm: () => {},
    onCancel: () => {},
  },
  openConfirmModal: (props: ConfirmModalProps) => 
    set({ 
      isConfirmModalOpen: true, 
      confirmModalProps: { 
        ...props, 
        onCancel: () => {
          if (props.onCancel) props.onCancel();
          set({ isConfirmModalOpen: false });
        }
      } 
    }),
  closeConfirmModal: () => set({ isConfirmModalOpen: false }),
}));
