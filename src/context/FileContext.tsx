"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface FileContextType {
  files: File[];
  setFiles: (files: File[]) => void;
  clearFiles: () => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [files, setFilesState] = useState<File[]>([]);

  const setFiles = useCallback((newFiles: File[]) => {
    setFilesState(newFiles);
  }, []);

  const clearFiles = useCallback(() => {
    setFilesState([]);
  }, []);

  return (
    <FileContext.Provider value={{ files, setFiles, clearFiles }}>
      {children}
    </FileContext.Provider>
  );
}

export function useFiles() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error("useFiles must be used within a FileProvider");
  }
  return context;
}
