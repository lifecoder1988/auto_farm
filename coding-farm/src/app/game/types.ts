export interface UiBridge {
  alert: (title: string, message: string) => Promise<void>;
  confirm: (title: string, message: string) => Promise<boolean>;
  console: {
    log: (args: any[], source?: "user" | "system") => void;
    system: (msg: string) => void;
  };
}
