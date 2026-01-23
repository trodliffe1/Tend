import { supabase } from '../lib/supabase';
import { encryptData, decryptData } from './encryption';
import { exportAllData, importAllData } from '../database/database';
import { Person, AppSettings } from '../types';

export interface BackupMetadata {
  exists: boolean;
  updatedAt: string | null;
}

interface BackupData {
  persons: Person[];
  settings: AppSettings;
  version: number;
  exportedAt: string;
}

export async function getBackupStatus(): Promise<BackupMetadata> {
  try {
    const { data, error } = await supabase
      .from('user_backups')
      .select('updated_at')
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine
      console.error('Error fetching backup status:', error);
    }

    return {
      exists: !!data,
      updatedAt: data?.updated_at ?? null,
    };
  } catch {
    return { exists: false, updatedAt: null };
  }
}

export async function createBackup(
  password: string
): Promise<{ error: string | null }> {
  try {
    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // 2. Export all local data
    const localData = await exportAllData();

    // 3. Add metadata
    const backupData: BackupData = {
      ...localData,
      version: 1,
      exportedAt: new Date().toISOString(),
    };

    // 4. Encrypt with user's password
    const { encrypted, salt, iv } = await encryptData(backupData, password);

    // 5. Upsert to Supabase
    const { error } = await supabase
      .from('user_backups')
      .upsert({
        user_id: user.id,
        encrypted_data: encrypted,
        salt,
        iv,
        version: 1,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('Supabase upsert error:', error);
      return { error: 'Failed to save backup to cloud' };
    }

    return { error: null };
  } catch (e) {
    console.error('Backup error:', e);
    return { error: 'Backup failed. Please try again.' };
  }
}

export async function restoreBackup(
  password: string
): Promise<{ error: string | null }> {
  try {
    // 1. Fetch encrypted backup
    const { data, error } = await supabase
      .from('user_backups')
      .select('encrypted_data, salt, iv')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { error: 'No backup found for this account' };
      }
      console.error('Supabase fetch error:', error);
      return { error: 'Failed to fetch backup from cloud' };
    }

    if (!data) {
      return { error: 'No backup found for this account' };
    }

    // 2. Decrypt with password
    const decrypted = decryptData<BackupData>(
      data.encrypted_data,
      password,
      data.salt,
      data.iv
    );

    if (!decrypted) {
      return { error: 'Incorrect password. Please try again.' };
    }

    // 3. Import into local database
    await importAllData({
      persons: decrypted.persons,
      settings: decrypted.settings,
    });

    return { error: null };
  } catch (e) {
    console.error('Restore error:', e);
    return { error: 'Restore failed. Please try again.' };
  }
}

export async function deleteBackup(): Promise<{ error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('user_backups')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Delete backup error:', error);
      return { error: 'Failed to delete backup' };
    }

    return { error: null };
  } catch (e) {
    console.error('Delete error:', e);
    return { error: 'Delete failed. Please try again.' };
  }
}
