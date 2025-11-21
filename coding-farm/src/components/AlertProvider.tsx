"use client";

import { createContext, useContext, useState, ReactNode } from "react";

import "./AlertModal.css";

type AlertContextType = {
  alert: (title: string, message: string) => Promise<void>;
};

const AlertContext = createContext<AlertContextType | null>(null);

export const useAlert = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be inside <AlertProvider>");
  return ctx.alert;
};

export function AlertProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [resolver, setResolver] = useState<(() => void) | null>(null);

  const alert = (title: string, message: string) => {
    return new Promise<void>((resolve) => {
      setTitle(title);
      setMessage(message);
      setResolver(() => resolve);
      setOpen(true);
    });
  };

  const close = () => {
    setOpen(false);
    resolver?.(); // 触发 resolve()
    setResolver(null);
  };

  return (
    <AlertContext.Provider value={{ alert }}>
      {children}

      {/* Modal UI */}
      {open && (
        <div id="alert-overlay" className="overlay">
          <div id="alert-dialog" className="dialog">
            <div id="alert-title">{title}</div>
            <div id="alert-message">{message}</div>
            <div id="alert-actions">
              <button id="alert-ok" onClick={close}>
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}
