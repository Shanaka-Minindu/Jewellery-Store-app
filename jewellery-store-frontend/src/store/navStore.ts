import { create } from 'zustand';

interface navState {
  isUpdateOpen: boolean;
  isMenOpen:boolean;
  isWomenOpen:boolean;
  openNavModal: () => void;
  closeNavModal: () => void;
  openMen:()=>void;
  openWomen:()=>void;
  clearGender:()=>void;
}

export const useNavSateStore = create<navState>((set) => ({
  isUpdateOpen: false,
  isMenOpen: false,
  isWomenOpen : false,
  openNavModal: () => set({ isUpdateOpen: true }),
  closeNavModal: () => set({ isUpdateOpen: false }),
  openMen: ()=>set({isMenOpen:true, isWomenOpen:false, isUpdateOpen: true}),
  openWomen:()=>set({isWomenOpen:true, isMenOpen:false,isUpdateOpen: true}),
  clearGender:()=>set({isMenOpen:false,isWomenOpen:false,isUpdateOpen: false})
}));