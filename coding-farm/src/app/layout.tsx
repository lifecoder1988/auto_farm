// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { AlertProvider } from "../components/AlertProvider"; // Adjust the path as needed
import { ConfirmProvider } from "@/components/ConfirmProvider";
import { ConsoleProvider } from "@/components/Console/Console";
export const metadata: Metadata = {
  title: "编程农场开源版",
  description: "编程农场开源版 - 使用 JavaScript 编程的农场游戏",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        {" "}
        <AlertProvider>
          {" "}
          <ConfirmProvider>
            <ConsoleProvider>{children}</ConsoleProvider>
          </ConfirmProvider>
        </AlertProvider>
      </body>
    </html>
  );
}
