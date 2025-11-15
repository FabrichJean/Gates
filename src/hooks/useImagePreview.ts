import { useEffect, useRef, useState } from 'react';

export default function useImagePreview() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        try {
          URL.revokeObjectURL(objectUrlRef.current);
        } catch {}
        objectUrlRef.current = null;
      }
    };
  }, []);

  const setFile = (f: File | null) => {
    fileRef.current = f;
    if (objectUrlRef.current) {
      try {
        URL.revokeObjectURL(objectUrlRef.current);
      } catch {}
      objectUrlRef.current = null;
    }
    if (f) {
      const url = URL.createObjectURL(f);
      objectUrlRef.current = url;
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const clear = () => setFile(null);

  return {
    previewUrl,
    setFile,
    clear,
    getFile: () => fileRef.current,
  } as const;
}
