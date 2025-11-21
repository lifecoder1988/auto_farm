"use client";

import "./ConfirmModal.css";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  onOk: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  onOk,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div id="confirm-overlay" className="overlay">
      <div id="confirm-dialog" className="dialog">
        <div
          id="confirm-title"
          style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
        >
          {title}
        </div>

        <div id="confirm-message" style={{ marginBottom: 20, lineHeight: 1.5 }}>
          {message}
        </div>

        <div
          id="confirm-actions"
          style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
        >
          <button
            id="confirm-cancel"
            onClick={onCancel}
            style={{
              padding: "6px 16px",
              background: "#555",
              border: "none",
              borderRadius: 6,
              color: "white",
            }}
          >
            取消
          </button>

          <button
            id="confirm-ok"
            onClick={onOk}
            style={{
              padding: "6px 16px",
              background: "#e53935",
              border: "none",
              borderRadius: 6,
              color: "white",
            }}
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}
