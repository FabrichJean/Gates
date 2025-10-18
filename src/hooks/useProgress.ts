import { useState, useEffect, useCallback } from "react";
import {useStore} from 'zustand'

export interface ProgressItem {
  id: string;
  name: string;
  type: "upload" | "download";
  progress: number; // 0 à 100
  status: "pending" | "completed" | "failed";
}

const STORAGE_KEY = "transfer_progress_list";

// const storeProgress = useStore<ProgressItem[]>((set) => [])

export const useProgress = () => {
  const [progressList, setProgressList] = useState<ProgressItem[]>([]);

  // 🧠 Charger les transferts sauvegardés au démarrage
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProgressList(JSON.parse(stored));
      } catch {
        console.error("Erreur parsing sessionStorage");
      }
    }
  }, []);

  // 💾 Sauvegarder les transferts à chaque mise à jour
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progressList));
  }, [progressList]);

  // ➕ Ajouter un transfert
  const addProgress = useCallback((item: Omit<ProgressItem, "id" | "status" | "progress">) => {
    const newItem: ProgressItem = {
      id: Date.now().toString(),
      progress: 0,
      status: "pending",
      ...item,
    };
    setProgressList((prev) => [newItem, ...prev]);
    return newItem.id; // renvoyer l'id pour le suivre facilement
  }, []);

  // 🔄 Mettre à jour la progression
  const updateProgress = useCallback((id: string, newProgress: number) => {
    setProgressList((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              progress: newProgress,
              status: newProgress >= 100 ? "completed" : "pending",
            }
          : p
      )
    );
  }, []);

  // ❌ Supprimer une progression
  const removeProgress = useCallback((id: string) => {
    setProgressList((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // 🧹 Nettoyer tout
  const clearAll = useCallback(() => {
    setProgressList([]);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    progressList,
    addProgress,
    updateProgress,
    removeProgress,
    clearAll,
  };
};
