"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { ConfirmModal } from "./ConfirmModal";

type ConfirmContextType = {
  confirm: (title: string, message: string) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be inside <ConfirmProvider>");
  return ctx.confirm;
};

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const [resolver, setResolver] = useState<((v: boolean) => void) | null>(null);

  const confirm = (title: string, message: string) => {
    return new Promise<boolean>((resolve) => {
      setTitle(title);
      setMessage(message);
      setResolver(() => resolve);
      setOpen(true);
    });
  };

  const handleCancel = () => {
    setOpen(false);
    resolver?.(false);
    setResolver(null);
  };

  const handleOk = () => {
    setOpen(false);
    resolver?.(true);
    setResolver(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      <ConfirmModal
        open={open}
        title={title}
        message={message}
        onCancel={handleCancel}
        onOk={handleOk}
      />
    </ConfirmContext.Provider>
  );
}
