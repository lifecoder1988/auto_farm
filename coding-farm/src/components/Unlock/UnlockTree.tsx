"use client";

import { useEffect, useRef } from "react";
import styles from "./UnlockTree.module.css";
import { renderUnlockPixi } from "@/app/game/engine/unlock/unlock-pixi";

export function UnlockTree({
  appRef,
  open,
  onClose,
}: {
  appRef: any;
  open: boolean;
  onClose: () => void;
}) {
  const graphRef = useRef<HTMLDivElement>(null);

  // --- 渲染科技树 ---
  useEffect(() => {
    if (!open) return; // 未打开，不渲染
    const app = appRef.current;
    if (!app) return;
    if (!graphRef.current) return;

    // 清空旧内容（否则多次挂载会叠加多个 canvas）
    graphRef.current.innerHTML = "";

    // 调用原来的 Pixi 渲染逻辑
    renderUnlockPixi(app, app.unlockManager.techTree, graphRef.current);
  }, [open, appRef]);

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <div className={styles.title}>科技树</div>
          <button className="secondary" onClick={onClose}>
            关闭
          </button>
        </div>

        <div className={styles.scroll}>
          <div ref={graphRef} className={styles.graph} />
        </div>
      </div>
    </div>
  );
}
