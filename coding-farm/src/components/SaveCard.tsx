"use client";

import styles from "./SaveCard.module.css";

export interface SaveCardProps {
  id: number;
  name: string;
  savedAt: number | null;
  onLoad: () => void;
  onDelete: () => void | Promise<void>;
}

export function SaveCard({
  id,
  name,
  savedAt,
  onLoad,
  onDelete,
}: SaveCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.info}>
        <div className={styles.title}>{name}</div>
        <div className={styles.time}>
          {savedAt ? new Date(savedAt).toLocaleString() : "尚未保存"}
        </div>
      </div>

      <div className={styles.buttons}>
        <button className={styles.load} onClick={onLoad}>
          ▶ 加载
        </button>
        <button className={styles.delete} onClick={onDelete}>
          🗑 删除
        </button>
      </div>
    </div>
  );
}
