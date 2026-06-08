import type { KeyType, ScaleType, NoteRange } from '../types';

export interface UserSettings {
  keyType: KeyType;
  scaleType: ScaleType;
  noteRange: NoteRange;
  startKey: number | null;
  endKey: number | null;
  bpm: number;
  volume: number;
  playChords: boolean;
  repeatCurrent: boolean;
  reverseSelection: boolean;
}

export class CookieService {
  private static readonly SETTINGS_KEY = 'vocal-piano-settings';
  private static readonly EXPIRY_DAYS = 365;

  static saveSettings(settings: UserSettings): void {
    try {
      const settingsJson = JSON.stringify(settings);
      const expiryDate = new Date();
      expiryDate.setTime(expiryDate.getTime() + (this.EXPIRY_DAYS * 24 * 60 * 60 * 1000));
      
      document.cookie = `${this.SETTINGS_KEY}=${encodeURIComponent(settingsJson)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    } catch (error) {
      console.warn('Failed to save settings to cookie:', error);
    }
  }

  static loadSettings(): UserSettings | null {
    try {
      const cookies = document.cookie.split(';');
      const settingsCookie = cookies.find(cookie => 
        cookie.trim().startsWith(`${this.SETTINGS_KEY}=`)
      );

      if (!settingsCookie) {
        return null;
      }

      const settingsValue = settingsCookie.split('=')[1];
      const decodedValue = decodeURIComponent(settingsValue);
      const settings = JSON.parse(decodedValue) as UserSettings;

      // Validate the loaded settings
      if (this.isValidSettings(settings)) {
        return settings;
      } else {
        console.warn('Invalid settings found in cookie, ignoring');
        return null;
      }
    } catch (error) {
      console.warn('Failed to load settings from cookie:', error);
      return null;
    }
  }

  static clearSettings(): void {
    try {
      document.cookie = `${this.SETTINGS_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    } catch (error) {
      console.warn('Failed to clear settings cookie:', error);
    }
  }

  private static isValidSettings(settings: any): settings is UserSettings {
    return (
      typeof settings === 'object' &&
      settings !== null &&
      (settings.keyType === 'major' || settings.keyType === 'minor') &&
      (settings.scaleType === 'scales' || settings.scaleType === 'arpeggios' || settings.scaleType === 'chromatic') &&
      (settings.noteRange === 3 || settings.noteRange === 5 || settings.noteRange === 8) &&
      (settings.startKey === null || (typeof settings.startKey === 'number' && settings.startKey >= 1 && settings.startKey <= 76)) &&
      (settings.endKey === null || (typeof settings.endKey === 'number' && settings.endKey >= 1 && settings.endKey <= 76)) &&
      typeof settings.bpm === 'number' &&
      settings.bpm >= 40 &&
      settings.bpm <= 250 &&
      typeof settings.volume === 'number' &&
      settings.volume >= 0 &&
      settings.volume <= 1 &&
      typeof settings.playChords === 'boolean' &&
      (typeof settings.repeatCurrent === 'boolean' || typeof settings.repeatCurrent === 'undefined') &&
      (typeof settings.reverseSelection === 'boolean' || typeof settings.reverseSelection === 'undefined')
    );
  }
}

export const cookieService = CookieService; 