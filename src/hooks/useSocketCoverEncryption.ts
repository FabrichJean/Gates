import { useEffect, useState } from 'react';
import { socket } from '../utils/socket';

export interface CoverEncryptionState {
  status: 'idle' | 'encrypting' | 'complete' | 'error' | 'skipped';
  progress: number;
  message: string;
  error?: string;
  newCoverUrl?: string;
  timestamp?: string;
}

const initialState: CoverEncryptionState = {
  status: 'idle',
  progress: 0,
  message: '',
};

export const useSocketCoverEncryption = (videoId?: number) => {
  const [encryptionState, setEncryptionState] = useState<CoverEncryptionState>(initialState);

  useEffect(() => {
    if (!videoId) return;

    // Join the video encryption room
    socket.emit('join-video', videoId);

    // Listen for encryption start
    socket.on('cover-encryption:start', (data: any) => {
      console.log(`[${videoId}] Cover encryption started`, data);
      setEncryptionState({
        status: 'encrypting',
        progress: 10,
        message: 'Encryptage démarré...',
        timestamp: data.timestamp,
      });
    });

    // Listen for encryption progress
    socket.on('cover-encryption:progress', (data: any) => {
      console.log(`[${videoId}] Cover encryption progress`, data);
      setEncryptionState({
        status: 'encrypting',
        progress: data.progress || 50,
        message: data.message || 'Encryptage en cours...',
        timestamp: data.timestamp,
      });
    });

    // Listen for encryption complete
    socket.on('cover-encryption:complete', (data: any) => {
      console.log(`[${videoId}] Cover encryption complete`, data);
      setEncryptionState({
        status: 'complete',
        progress: 100,
        message: 'Encryptage réussi !',
        newCoverUrl: data.newCoverUrl,
        timestamp: data.timestamp,
      });
      // Reset after 2 seconds
      setTimeout(() => {
        setEncryptionState(initialState);
      }, 2000);
    });

    // Listen for encryption error
    socket.on('cover-encryption:error', (data: any) => {
      console.error(`[${videoId}] Cover encryption error`, data);
      setEncryptionState({
        status: 'error',
        progress: 0,
        message: `Erreur: ${data.error}`,
        error: data.error,
        timestamp: data.timestamp,
      });
      // Reset after 3 seconds
      setTimeout(() => {
        setEncryptionState(initialState);
      }, 3000);
    });

    // Listen for encryption skipped
    socket.on('cover-encryption:skipped', (data: any) => {
      console.log(`[${videoId}] Cover encryption skipped`, data);
      setEncryptionState({
        status: 'skipped',
        progress: 0,
        message: 'Cover déjà encrypté',
        timestamp: data.timestamp,
      });
      // Reset after 1 second
      setTimeout(() => {
        setEncryptionState(initialState);
      }, 1000);
    });

    // Cleanup: leave room and remove listeners when component unmounts
    return () => {
      socket.emit('leave-video', videoId);
      socket.off('cover-encryption:start');
      socket.off('cover-encryption:progress');
      socket.off('cover-encryption:complete');
      socket.off('cover-encryption:error');
      socket.off('cover-encryption:skipped');
    };
  }, [videoId]);

  const isEncrypting = encryptionState.status === 'encrypting';

  return {
    encryptionState,
    isEncrypting,
    progress: encryptionState.progress,
    message: encryptionState.message,
  };
};
