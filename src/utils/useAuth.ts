import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";

interface UserInfo {
  username: string;
  display_name: string;
}

interface LoginState {
  is_logged_in: boolean;
  user: UserInfo | null;
}

interface AuthState extends LoginState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkLoginState: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  is_logged_in: false,
  user: null,

  login: async (username: string, password: string) => {
    try {
      const state = await invoke<LoginState>("login", { username, password });
      set(state);
      return true;
    } catch (error) {
      throw new Error(error as string);
    }
  },

  logout: async () => {
    await invoke("logout");
    set({ is_logged_in: false, user: null });
  },

  checkLoginState: async () => {
    const state = await invoke<LoginState>("get_login_state");
    set(state);
  },
}));
