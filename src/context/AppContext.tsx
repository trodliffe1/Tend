import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Person, AppSettings, Note, Interaction } from '../types';
import * as db from '../database/database';
import { generateId } from '../utils/helpers';

interface AppContextType {
  persons: Person[];
  settings: AppSettings;
  loading: boolean;
  refreshPersons: () => Promise<void>;
  addPerson: (person: Omit<Person, 'id' | 'notes' | 'interactions' | 'createdAt'>) => Promise<void>;
  updatePerson: (person: Partial<Person> & { id: string }) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  addNote: (personId: string, content: string) => Promise<void>;
  deleteNote: (noteId: string, personId: string) => Promise<void>;
  logInteraction: (personId: string, type: Interaction['type'], note?: string) => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;
  exportData: () => Promise<string>;
}

const defaultSettings: AppSettings = {
  notifications: {
    enabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    preferredTime: '09:00',
    quietDays: [],
  },
  dateReminders: {
    earlyWarningEnabled: true,
    earlyWarningDays: 7,
    onTheDayEnabled: true,
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [persons, setPersons] = useState<Person[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const refreshPersons = useCallback(async () => {
    const data = await db.getAllPersons();
    setPersons(data);
  }, []);

  const loadSettings = useCallback(async () => {
    const data = await db.getSettings();
    setSettings(data);
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      await refreshPersons();
      await loadSettings();
      setLoading(false);
    }
    init();
  }, [refreshPersons, loadSettings]);

  const addPerson = async (personData: Omit<Person, 'id' | 'notes' | 'interactions' | 'createdAt'>) => {
    const person = {
      ...personData,
      id: generateId(),
      kids: personData.kids || [],
      createdAt: new Date().toISOString(),
    };
    await db.createPerson(person);
    await refreshPersons();
  };

  const updatePerson = async (person: Partial<Person> & { id: string }) => {
    await db.updatePerson(person);
    await refreshPersons();
  };

  const deletePerson = async (id: string) => {
    await db.deletePerson(id);
    await refreshPersons();
  };

  const addNote = async (personId: string, content: string) => {
    const note: Note = {
      id: generateId(),
      content,
      createdAt: new Date().toISOString(),
    };
    await db.addNote(personId, note);
    await refreshPersons();
  };

  const deleteNote = async (noteId: string, personId: string) => {
    await db.deleteNote(noteId);
    await refreshPersons();
  };

  const logInteraction = async (personId: string, type: Interaction['type'], note?: string) => {
    const interaction: Interaction = {
      id: generateId(),
      type,
      date: new Date().toISOString(),
      note,
    };
    await db.addInteraction(personId, interaction);
    await refreshPersons();
  };

  const updateSettings = async (newSettings: AppSettings) => {
    await db.updateSettings(newSettings);
    setSettings(newSettings);
  };

  const exportData = async (): Promise<string> => {
    const data = await db.exportAllData();
    return JSON.stringify(data, null, 2);
  };

  return (
    <AppContext.Provider
      value={{
        persons,
        settings,
        loading,
        refreshPersons,
        addPerson,
        updatePerson,
        deletePerson,
        addNote,
        deleteNote,
        logInteraction,
        updateSettings,
        exportData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
