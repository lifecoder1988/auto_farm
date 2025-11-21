"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
  useEffect,
} from "react";
import styles from "./Console.module.css";

type LogItem = {
  time: string;
  source: "user" | "system";
  body: string;
};

type ConsoleContextType = {
  log: (args: any[], source?: "user" | "system") => void;
  system: (msg: string) => void;
};

const ConsoleContext = createContext<ConsoleContextType | null>(null);

export const useConsole = () => {
  const ctx = useContext(ConsoleContext);
  if (!ctx) throw new Error("useConsole must be inside ConsoleProvider");
  return ctx;
};

export function ConsoleProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  function getTimestamp() {
    const d = new Date();
    return (
      `${String(d.getHours()).padStart(2, "0")}:` +
      `${String(d.getMinutes()).padStart(2, "0")}:` +
      `${String(d.getSeconds()).padStart(2, "0")}.` +
      `${String(d.getMilliseconds()).padStart(3, "0")}`
    );
  }

  function formatValue(v: any) {
    if (v === null) return "null";
    if (v === undefined) return "undefined";
    if (typeof v === "object") {
      try {
        return JSON.stringify(v, null, 2);
      } catch {
        return String(v);
      }
    }
    return String(v);
  }

  function log(args: any[], source: "user" | "system" = "user") {
    const body = args.map((a) => formatValue(a)).join(" ");
    setLogs((prev) => [
      ...prev,
      {
        time: getTimestamp(),
        source,
        body,
      },
    ]);
  }

  function system(msg: string) {
    log([msg], "system");
  }

  // 自动滚动到底部
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [logs]);

  return (
    <ConsoleContext.Provider value={{ log, system }}>
      {children}

      <div className={styles.consolePanel}>
        <details open className={styles.consoleDetails}>
          <summary className={styles.summary}>控制台输出</summary>
          <div className={styles.output} ref={ref}>
            {logs.map((log, i) => (
              <div key={i} className={styles.logLine}>
                <span className={styles.logTime}>[{log.time}]</span>
                <span
                  className={styles.logFrom}
                  style={{
                    color: log.source === "user" ? "#4caf50" : "#03a9f4",
                  }}
                >
                  {log.source === "user" ? "[用户]" : "[系统]"}
                </span>
                <pre className={styles.logBody}>{log.body}</pre>
              </div>
            ))}
          </div>
        </details>
      </div>
    </ConsoleContext.Provider>
  );
}
