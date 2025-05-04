
import { create } from "zustand"; 

interface UIState {
  snackbarMessage: string | null;
  showSnackbar: (message: string) => void;
  hideSnackbar: () => void;

  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
  loginAction: () => void;
  logoutAction: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  snackbarMessage: null,
  showSnackbar: (message) => set({ snackbarMessage: message }),
  hideSnackbar: () => set({ snackbarMessage: null }),

  isLoggedIn: false, 

  setIsLoggedIn: (status) => set({ isLoggedIn: status }),

  loginAction: () => set({ isLoggedIn: true }),

  logoutAction: () => set({ isLoggedIn: false }),
}));

export const triggerErrorSnackbar = (message: string) => {
  useUIStore.getState().showSnackbar(message);
};

export const setLoginStatus = (status: boolean) => {
  useUIStore.getState().setIsLoggedIn(status);
};

export const triggerLogin = () => {
  useUIStore.getState().loginAction();
};

export const triggerLogout = () => {
  useUIStore.getState().logoutAction();
};
