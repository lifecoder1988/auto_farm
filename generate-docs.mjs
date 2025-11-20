// generate-docs.js
// 自动扫描 doc/ 目录，输出 docs.json（供文档浏览器使用）

import fs from "fs";
import path from "path";

const ROOT = path.resolve("doc"); // 修改成你的文档目录名

function scanDirectory(dir, base = "") {
  const result = [];
  const full = path.join(ROOT, dir);

  const items = fs.readdirSync(full, { withFileTypes: true });

  for (const item of items) {
    const relPath = path.join(dir, item.name);

    // 子目录
    if (item.isDirectory()) {
      const children = scanDirectory(relPath);
      result.push({
        title: item.name,
        children,
      });
    }

    // Markdown 文件
    else if (item.isFile() && item.name.endsWith(".md")) {
      const name = path.basename(item.name, ".md");
      result.push({
        title: name,
        path: relPath.replace(/\\/g, "/"),
      });
    }
  }

  return result;
}

// 扫描整个 doc/
const structure = scanDirectory("");

const outputPath = path.join(ROOT, "docs.json");
fs.writeFileSync(outputPath, JSON.stringify(structure, null, 2), "utf8");

console.log("docs.json 已生成 ✔️");
console.log("路径:", outputPath);
