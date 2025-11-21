"use client";

import { useEffect, useState } from "react";
import styles from "./Header.module.css";

export default function HeaderBar({
  appRef,
  onToggleTech,
}: {
  appRef: React.MutableRefObject<any>;
  onToggleTech: () => void;
}) {
  const [msg, setMsg] = useState("等待初始化…");
  const [inventory, setInventory] = useState("");
  const [currentSlot, setCurrentSlot] = useState("未使用存档");
  const [isRunning, setIsRunning] = useState(false);

  // ========== 将游戏内部回调“注入”给 React ==========
  useEffect(() => {
    if (!appRef.current) return;

    const app = appRef.current;

    // 背包更新
    app.updateInventory = () => {
      const t = app.inventory.getAll();
      setInventory(
        `草料(${t.hay}) 木材(${t.wood}) 胡萝卜(${t.carrot}) 南瓜(${t.pumpkin}) 仙人掌(${t.cactus}) 金币(${t.gold}) 苹果(${t.apple}) 向日葵(${t.sunflower}) 水(${t.water}) 肥料(${t.fertilizer})`
      );
    };

    // RUN 按钮
    app.updateRunButton = () => {
      setIsRunning(app.isRunning);
    };

    // msg 显示
    app.setMsg = (text: string) => {
      setMsg(text);
    };

    // 存档名
    app.updateSlotLabel = (name: string) => {
      setCurrentSlot(name);
    };
  }, [appRef]);

  const handleRunClick = () => {
    const app = appRef.current;
    if (!app) return;

    if (app.isRunning) app._onAbort?.();
    else app._onRun?.();
  };

  const handleReset = () => {
    appRef.current?.triggerReset?.();
  };

  const handleSave = () => {
    appRef.current?.triggerSave?.();
  };

  return (
    <header className={styles.header}>
      <h1>编程农场开源版</h1>
      <span>{msg}</span>
      <span>🎒 {inventory}</span>
      <span>{currentSlot}</span>

      <button onClick={handleRunClick}>{isRunning ? "中止" : "运行"}</button>
      <button className="secondary" onClick={handleReset}>
        重置
      </button>
      <button className="secondary" onClick={handleSave}>
        保存游戏
      </button>

      <button className="secondary" onClick={onToggleTech}>
        科技树
      </button>
    </header>
  );
}
