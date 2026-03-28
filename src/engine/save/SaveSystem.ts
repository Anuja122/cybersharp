import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PlayerStats } from '../rpg/RPGSystem';
import { vec3 } from 'gl-matrix';

export class SaveSystem {
  private supabase: SupabaseClient | null = null;
  private currentSaveSlot: number = 1;

  constructor() {
    this.initializeSupabase();
  }

  private initializeSupabase() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      console.log('Supabase initialized for save system');
    } else {
      console.warn('Supabase not configured, using localStorage only');
    }
  }

  async saveGame(saveData: SaveData): Promise<boolean> {
    const saveKey = `cybersharp-save-${this.currentSaveSlot}`;

    try {
      localStorage.setItem(saveKey, JSON.stringify(saveData));

      if (this.supabase) {
        const { error } = await this.supabase
          .from('saves')
          .upsert({
            slot: this.currentSaveSlot,
            data: saveData,
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Failed to save to Supabase:', error);
        }
      }

      console.log('Game saved successfully');
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  async loadGame(slot: number = 1): Promise<SaveData | null> {
    this.currentSaveSlot = slot;
    const saveKey = `cybersharp-save-${slot}`;

    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('saves')
          .select('data')
          .eq('slot', slot)
          .maybeSingle();

        if (!error && data) {
          return data.data as SaveData;
        }
      }

      const localSave = localStorage.getItem(saveKey);
      if (localSave) {
        return JSON.parse(localSave) as SaveData;
      }

      return null;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  async deleteSave(slot: number): Promise<boolean> {
    const saveKey = `cybersharp-save-${slot}`;

    try {
      localStorage.removeItem(saveKey);

      if (this.supabase) {
        await this.supabase
          .from('saves')
          .delete()
          .eq('slot', slot);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  }

  async listSaves(): Promise<SaveSlotInfo[]> {
    const slots: SaveSlotInfo[] = [];

    for (let i = 1; i <= 3; i++) {
      const saveKey = `cybersharp-save-${i}`;
      const localSave = localStorage.getItem(saveKey);

      if (localSave) {
        try {
          const data = JSON.parse(localSave) as SaveData;
          slots.push({
            slot: i,
            timestamp: data.timestamp,
            playerLevel: data.playerStats.level,
            playtime: data.playtime,
            location: 'Night City',
          });
        } catch (error) {
          console.error(`Failed to parse save slot ${i}:`, error);
        }
      }
    }

    return slots;
  }

  setCurrentSlot(slot: number) {
    this.currentSaveSlot = slot;
  }

  getCurrentSlot(): number {
    return this.currentSaveSlot;
  }
}

export interface SaveData {
  version: string;
  timestamp: number;
  playtime: number;
  playerStats: PlayerStats;
  playerPosition: [number, number, number];
  activeQuests: string[];
  completedQuests: string[];
  inventory: string[];
  settings: GameSettings;
}

export interface SaveSlotInfo {
  slot: number;
  timestamp: number;
  playerLevel: number;
  playtime: number;
  location: string;
}

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  mouseSensitivity: number;
  fov: number;
  graphics: {
    bloom: boolean;
    chromatic: boolean;
    scanlines: boolean;
    rainQuality: 'low' | 'medium' | 'high';
  };
}
