import { marked } from "marked";
import Slugger from "github-slugger";

import fs from "fs";
import path from "path";

// ⭐ 修复 marked v17 对 heading token 的复杂 text/raw 格式
function toPlainText(x: any): string {
  if (!x) return "";
  if (typeof x === "string") return x;

  // token 数组 => 拼接内部字符串
  if (Array.isArray(x)) return x.map(toPlainText).join("");

  // token.text => 标题字符串
  if (typeof x.text === "string") return x.text;

  // 兜底
  return String(x);
}

export default async function DocPage({ params }) {
  const { slug } = await params;

  const slugArr = Array.isArray(slug) ? slug : [slug];

  const decoded = slugArr.map((s) => decodeURIComponent(s));

  const filePath = path.join(
    process.cwd(),
    "public/doc",
    `${decoded.join("/")}.md`
  );

  const md = fs.readFileSync(filePath, "utf8");

  const renderer = new marked.Renderer();
  const slugger = new Slugger(); // ⭐ 使用 GitHub Slugger

  renderer.heading = (token) => {
    const pure = toPlainText(token.text); // token.text 是 string 或 Token 数组
    const id = slugger.slug(pure); // GitHub slug

    return `<h${token.depth} id="${id}">${pure}</h${token.depth}>`;
  };

  marked.use({ renderer });

  const html = marked(md);

  return (
    <article
      style={{ padding: 20 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
