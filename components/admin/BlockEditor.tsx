/**
 * کامپوننت ویرایشگر بلوکی مقالات (BlockEditor)
 * 
 * کاربرد: یک ویرایشگر محتوای پیشرفته (شبیه به Notion یا ویرایشگر گوتنبرگ وردپرس) برای نوشتن و ویرایش مقالات.
 * این کامپوننت محتوای مقاله را به جای یک متن ساده، به صورت آرایه‌ای از "بلوک‌ها" مدیریت می‌کند.
 * 
 * ویژگی‌های کلیدی:
 * - یکپارچه با Tiptap: استفاده از Tiptap برای بلوک‌های متنی تا مدیر بتواند متن را استایل‌دهی کند (پررنگ، لینک، رنگ، لیست و...).
 * - پشتیبانی از انواع محتوا: قابلیت افزودن تیتر، پاراگراف، نقل‌قول، لیست، عکس (با قابلیت پیش‌نمایش زنده) و ویدیو (کد iframe آپارات/یوتیوب).
 * - انعطاف‌پذیری بلوک‌ها: امکان تغییر ترتیب بلوک‌ها (بالا و پایین بردن)، تغییر نوع یک بلوک در لحظه، و حذف بلوک‌های اضافی.
 * 
 * جریان داده (Data Flow):
 * این کامپوننت وضعیت (State) بلوک‌ها را در خود نگه نمی‌دارد، بلکه دیتای بلوک‌ها و فایل‌های عکس را مستقیماً به 
 * کامپوننت والد (صفحه مقالات) پاس می‌دهد تا هنگام زدن دکمه "ذخیره"، همه چیز به صورت یکجا و تمیز به بک‌اند ارسال شود.
 */

"use client";

import { useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";

import { BlockType, ArticleBlock, blockMeta } from "@/lib/articleBlocks";

const addOrder: BlockType[] = ["heading", "paragraph", "image", "quote", "list", "embed"];

function move(blocks: ArticleBlock[], id: string, dir: -1 | 1): ArticleBlock[] {
  const i = blocks.findIndex((b) => b.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= blocks.length) return blocks;
  const next = [...blocks];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

const TiptapEditor = ({
  content,
  onChange,
  placeholder,
}: {
  content: string;
  onChange: (val: string) => void;
  placeholder: string;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      TextStyle,
      Color,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#00c8ff] underline cursor-pointer",
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "min-h-[80px] text-sm leading-7 text-white outline-none prose-p:my-2",
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("آدرس لینک جدید را وارد کنید:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.01] overflow-hidden focus-within:border-[#39f77b]/50 transition-colors">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 bg-[#0b1722] p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 text-xs font-bold rounded-lg transition ${
            editor.isActive("bold") ? "bg-[#39f77b]/20 text-[#39f77b]" : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 text-xs italic rounded-lg transition ${
            editor.isActive("italic") ? "bg-[#39f77b]/20 text-[#39f77b]" : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-2 py-1 text-xs underline rounded-lg transition ${
            editor.isActive("underline") ? "bg-[#39f77b]/20 text-[#39f77b]" : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          U
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 text-xs line-through rounded-lg transition ${
            editor.isActive("strike") ? "bg-[#39f77b]/20 text-[#39f77b]" : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          S
        </button>
        <span className="w-px h-4 bg-white/10 mx-1"></span>
        <button
          type="button"
          onClick={setLink}
          className={`px-2 py-1 text-xs rounded-lg transition ${
            editor.isActive("link") ? "bg-[#00c8ff]/20 text-[#00c8ff]" : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          🔗 لینک
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 text-xs rounded-lg transition ${
            editor.isActive("bulletList") ? "bg-[#39f77b]/20 text-[#39f77b]" : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          • لیست
        </button>
        <span className="w-px h-4 bg-white/10 mx-1"></span>
        <label className="flex items-center gap-1.5 px-2 py-1 text-xs text-white/60 cursor-pointer hover:text-white">
          رنگ:
          <input
            type="color"
            onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
            value={editor.getAttributes("textStyle").color || "#ffffff"}
            className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
          />
        </label>
      </div>

      <div className="p-3.5">
        {editor.isEmpty && (
          <div className="pointer-events-none absolute text-sm text-white/30">{placeholder}</div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default function BlockEditor({
  blocks,
  onChange,
}: {
  blocks: ArticleBlock[];
  onChange: (blocks: ArticleBlock[]) => void;
}) {
  const set = (id: string, patch: Partial<ArticleBlock>) =>
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const add = (type: BlockType, afterId?: string) => {
    const b: ArticleBlock = { id: Date.now().toString(36), type, text_content: "" };
    if (!afterId) return onChange([...blocks, b]);
    const i = blocks.findIndex((x) => x.id === afterId);
    if (i < 0) return onChange([...blocks, b]);
    onChange([...blocks.slice(0, i + 1), b, ...blocks.slice(i + 1)]);
  };

  const remove = (id: string) => {
    if (blocks.length <= 1) return;
    onChange(blocks.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-3">
      {blocks.map((b, i) => (
        <div key={b.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-[#39f77b]/10 px-2 py-1 text-[10px] font-extrabold text-[#39f77b]">
              {i + 1} • {blockMeta[b.type].label}
            </span>
            {b.type !== "image" && b.type !== "embed" && (
              <select
                value={b.type}
                onChange={(e) => set(b.id, { type: e.target.value as BlockType })}
                className="rounded-lg border border-white/10 bg-[#0b1722] px-2 py-1 text-[11px] text-white/70 outline-none"
              >
                {(["heading", "paragraph", "quote", "list"] as BlockType[]).map((t) => (
                  <option key={t} value={t}>{blockMeta[t].label}</option>
                ))}
              </select>
            )}
            <span className="ms-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => onChange(move(blocks, b.id, -1))}
                disabled={i === 0}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-white/50 transition hover:border-[#39f77b]/40 hover:text-[#39f77b] disabled:opacity-25"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => onChange(move(blocks, b.id, 1))}
                disabled={i === blocks.length - 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-white/50 transition hover:border-[#39f77b]/40 hover:text-[#39f77b] disabled:opacity-25"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(b.id)}
                disabled={blocks.length <= 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-white/50 transition hover:border-red-400/40 hover:text-red-300 disabled:opacity-25"
              >
                ✕
              </button>
            </span>
          </div>

          {b.type === "image" ? (
            <div className="space-y-2.5">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) set(b.id, { file, url: URL.createObjectURL(file) });
                }}
                className="w-full text-xs text-white/50 file:mr-4 file:rounded-full file:border-0 file:bg-[#39f77b]/10 file:px-4 file:py-2 file:text-xs file:font-bold file:text-[#39f77b] hover:file:bg-[#39f77b]/20"
              />
              {b.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.url} alt="preview" className="h-32 w-full rounded-xl object-cover opacity-80" />
              )}
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <input
                  value={b.alt ?? ""}
                  onChange={(e) => set(b.id, { alt: e.target.value })}
                  placeholder="متن جایگزین (Alt) تصویر برای سئو"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#39f77b]/50"
                />
                <input
                  value={b.caption ?? ""}
                  onChange={(e) => set(b.id, { caption: e.target.value })}
                  placeholder="توضیح زیر عکس (Caption)"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>
            </div>
          ) : b.type === "embed" ? (
            <div className="space-y-2.5">
              <textarea
                value={b.text_content}
                onChange={(e) => set(b.id, { text_content: e.target.value })}
                placeholder='کد iframe ویدیو یا لینک را اینجا وارد کنید...'
                rows={4}
                dir="ltr"
                className="w-full resize-y rounded-xl border border-[#00c8ff]/30 bg-white/[0.02] px-3.5 py-2.5 text-left text-xs font-mono text-white/70 outline-none focus:border-[#00c8ff]"
              />
              {b.text_content.includes("<iframe") && (
                <div 
                  className="aspect-video w-full rounded-xl overflow-hidden border border-white/10"
                  dangerouslySetInnerHTML={{ __html: b.text_content }}
                />
              )}
            </div>
          ) : (
            <TiptapEditor
              content={b.text_content}
              onChange={(content) => set(b.id, { text_content: content })}
              placeholder={blockMeta[b.type].hint}
            />
          )}
        </div>
      ))}

      <div className="rounded-2xl border border-dashed border-[#39f77b]/25 bg-[#39f77b]/[0.03] p-3.5">
        <p className="mb-2.5 text-center text-[11px] font-bold text-white/40">افزودن محتوا</p>
        <div className="flex flex-wrap justify-center gap-2">
          {addOrder.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => add(t)}
              title={blockMeta[t].hint}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[11px] font-bold text-white/70 transition hover:border-[#39f77b]/40 hover:text-[#39f77b]"
            >
              + {blockMeta[t].label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}