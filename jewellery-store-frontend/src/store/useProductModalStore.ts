import { create } from 'zustand';

interface ProductModalState {
  isUpdateOpen: boolean;
  openUpdateModal: () => void;
  closeUpdateModal: () => void;
}

export const useProductModalStore = create<ProductModalState>((set) => ({
  isUpdateOpen: false,
  openUpdateModal: () => set({ isUpdateOpen: true }),
  closeUpdateModal: () => set({ isUpdateOpen: false }),
}));