import { StateCreator } from "zustand";
import { AppStoreState, SettingsSlice } from "./types";
import { storageService } from "../../services/storageService";
import { STORAGE_KEYS } from "../../constants";

export const createSettingsSlice: StateCreator<
  AppStoreState,
  [],
  [],
  SettingsSlice
> = (set) => ({
  settings: {
    language: storageService.getString(STORAGE_KEYS.APP_LANGUAGE) || "tr",
    theme: storageService.getString(STORAGE_KEYS.THEME) || "light",
    accentColor: storageService.getString("app_accent_color") || "amber",
    notifications: true,
    stickyNotification: storageService.getBoolean(STORAGE_KEYS.STICKY_NOTIFICATION) || false,
  },

  setLanguage: (lang: string) =>
    set((state) => {
      storageService.setString(STORAGE_KEYS.APP_LANGUAGE, lang);
      return { settings: { ...state.settings, language: lang } };
    }),

  setTheme: (theme: string) =>
    set((state) => {
      storageService.setString(STORAGE_KEYS.THEME, theme);
      return { settings: { ...state.settings, theme } };
    }),

  setAccentColor: (accentId: string) =>
    set((state) => {
      storageService.setString("app_accent_color", accentId);
      return { settings: { ...state.settings, accentColor: accentId } };
    }),

  setNotifications: (enabled: boolean) =>
    set((state) => ({
      settings: { ...state.settings, notifications: enabled },
    })),

  setStickyNotification: (enabled: boolean) =>
    set((state) => {
      storageService.setBoolean(STORAGE_KEYS.STICKY_NOTIFICATION, enabled);
      return { settings: { ...state.settings, stickyNotification: enabled } };
    }),
});
