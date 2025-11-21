// app/page.tsx
"use client";

import { useEffect } from "react";
import { initMain } from "./game/initMain"; // 第 5 步会实现这个

export default function HomePage() {
  useEffect(() => {
    requestAnimationFrame(() => {
      initMain();
    });
  }, []);

  return (
    <>
      <header>
        <h1>编程农场开源版</h1>
        <span id="msg">等待初始化…</span>
        <span id="inventory">🎒 背包: </span>
        <span id="current-save-slot" className="save-slot-label">
          未使用存档
        </span>
        <span id="lang-note">🟨 当前脚本语言：JavaScript</span>

        <button id="run">运行</button>
        <button id="reset" className="secondary">
          重置
        </button>

        <button id="btn-save-game" className="secondary">
          保存游戏
        </button>

        <button id="toggle-tech" className="secondary">
          科技树
        </button>

        <a href="/doc" target="_blank" className="header-link">
          文档
        </a>
        <a
          href="https://github.com/lifecoder1988/auto_farm"
          target="_blank"
          className="header-link"
        >
          GitHub
        </a>
      </header>

      <div id="editor" />

      <div id="game">
        <canvas id="map" width={400} height={400} />

        {/* 科技树 overlay */}
        <div id="tech-overlay" className="hidden">
          <div id="tech-dialog">
            <div id="tech-header">
              <div id="tech-title">科技树</div>
              <button id="tech-close" className="secondary">
                关闭
              </button>
            </div>

            <div id="tech-scroll">
              <div id="tech-graph" />
            </div>
          </div>
        </div>
      </div>

      {/* 启动时：新游戏 / 加载存档 弹窗 */}
      <div id="start-overlay">
        <div id="start-dialog">
          <h2>编程农场开源版</h2>
          <p className="start-subtitle">请选择开始方式：</p>

          <div className="start-actions">
            <button id="btn-new-game">新游戏</button>
            <button id="btn-load-game" className="secondary">
              加载存档
            </button>
          </div>

          <div id="save-list-wrap" className="hidden">
            <div className="save-list-header" />
            <ul id="save-slot-list" />
            <p className="save-tip">
              提示：存档保存在本机浏览器的 localStorage 中。
            </p>
          </div>
        </div>
      </div>

      {/* 自定义确认框 */}
      <div id="confirm-overlay" className="hidden">
        <div id="confirm-dialog">
          <div id="confirm-title" />
          <div id="confirm-message" />

          <div id="confirm-actions">
            <button id="confirm-cancel" className="btn-cancel">
              取消
            </button>
            <button id="confirm-ok" className="btn-danger">
              删除
            </button>
          </div>
        </div>
      </div>

      {/* 自定义 Alert 弹窗 */}
      <div id="alert-overlay" className="hidden">
        <div id="alert-dialog">
          <div id="alert-title" />
          <div id="alert-message" />

          <div id="alert-actions">
            <button id="alert-ok" className="btn-primary">
              确定
            </button>
          </div>
        </div>
      </div>

      <footer />

      <div id="console-panel">
        <details id="console" open>
          <summary>控制台输出</summary>
          <div id="console-output" />
        </details>
      </div>
    </>
  );
}
