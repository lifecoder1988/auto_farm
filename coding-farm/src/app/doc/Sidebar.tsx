// src/app/doc/Sidebar.tsx
import fs from "fs";
import path from "path";
import Link from "next/link";

interface DocNode {
  title: string;
  path?: string;
  children?: DocNode[];
}

function renderNode(node: DocNode, base: string = "/doc") {
  const items: JSX.Element[] = [];

  if (node.path) {
    // 去掉 .md
    const href = `${base}/${node.path.replace(/\.md$/, "")}`;
    items.push(
      <div key={href} style={{ marginBottom: 8 }}>
        <Link href={href}>{node.title}</Link>
      </div>
    );
  }

  if (node.children) {
    for (const child of node.children) {
      items.push(
        <div key={child.title} style={{ marginLeft: 12 }}>
          {renderNode(child, base)}
        </div>
      );
    }
  }

  return <>{items}</>;
}

export default function Sidebar() {
  const jsonPath = path.join(process.cwd(), "public/doc/docs.json");
  const raw = fs.readFileSync(jsonPath, "utf8");
  const tree: DocNode[] = JSON.parse(raw);

  return (
    <nav
      style={{
        padding: 20,
        background: "#222",
        height: "100vh",
        overflowY: "auto",
      }}
    >
      {tree.map((node) => renderNode(node))}
    </nav>
  );
}
