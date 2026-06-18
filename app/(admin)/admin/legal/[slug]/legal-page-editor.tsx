"use client"

import { useState, useTransition, useCallback } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import Link from "@tiptap/extension-link"
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link as LinkIcon, Minus,
  Undo2, Redo2, Check, Loader2, AlertTriangle,
  Heading2, Heading3, Type,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { upsertLegalPage } from "../actions"

interface Props {
  initialData: {
    slug: string
    titleDE: string
    titleFR: string
    contentDE: string
    contentFR: string
  }
}

type Lang = "fr" | "de"

// ── Toolbar button ──────────────────────────────────────────
function ToolBtn({
  onClick, active, title, disabled, children,
}: {
  onClick: () => void
  active?: boolean
  title?: string
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`p-1.5 rounded-[var(--r-sm)] transition-colors ${
        active
          ? "bg-[var(--gold)] text-[var(--noir)]"
          : "text-[var(--text-muted)] hover:text-[var(--pearl)] hover:bg-[var(--surface-4)]"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  )
}

// ── Separator ───────────────────────────────────────────────
function Sep() {
  return <div className="w-px h-5 bg-[var(--border)] mx-0.5 self-center" />
}

// ── Rich editor for one language ────────────────────────────
function RichEditor({
  content,
  onChange,
}: {
  content: string
  onChange: (html: string) => void
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-[var(--gold)] underline" } }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "rich-editor-content focus:outline-none",
        spellcheck: "false",
      },
    },
  })

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes("link").href ?? ""
    const url = window.prompt("URL du lien :", prev)
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }
  }, [editor])

  if (!editor) return null

  const h = editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("heading", { level: 3 })
    ? "h3"
    : "p"

  return (
    <div className="border border-[var(--border)] rounded-[var(--r-xl)] overflow-hidden focus-within:ring-1 focus-within:ring-[var(--gold)]/30 focus-within:border-[var(--border-gold)] transition-colors">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-[var(--surface-3)] border-b border-[var(--border)]">

        {/* Paragraph style */}
        <select
          value={h}
          onChange={(e) => {
            const v = e.target.value
            if (v === "p") editor.chain().focus().setParagraph().run()
            else if (v === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run()
            else if (v === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run()
          }}
          className="h-7 text-xs bg-[var(--surface-4)] border border-[var(--border)] rounded-[var(--r-sm)] px-2 text-[var(--text-secondary)] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--gold)]/30"
        >
          <option value="p">Texte normal</option>
          <option value="h2">Titre (H2)</option>
          <option value="h3">Sous-titre (H3)</option>
        </select>

        <Sep />

        {/* Inline marks */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Gras (Ctrl+B)">
          <Bold className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italique (Ctrl+I)">
          <Italic className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Souligné (Ctrl+U)">
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Barré">
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        {/* Colors */}
        <div className="relative flex items-center" title="Couleur du texte">
          <label className="flex items-center gap-1 cursor-pointer px-1.5 py-1 rounded-[var(--r-sm)] hover:bg-[var(--surface-4)] transition-colors">
            <Type className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <input
              type="color"
              className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0"
              title="Couleur du texte"
              onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
            />
          </label>
        </div>

        <div className="relative flex items-center" title="Surlignage">
          <label className="flex items-center gap-1 cursor-pointer px-1.5 py-1 rounded-[var(--r-sm)] hover:bg-[var(--surface-4)] transition-colors">
            <span className="text-[10px] font-bold text-[var(--text-muted)] leading-none underline decoration-2">A</span>
            <input
              type="color"
              className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0"
              title="Surlignage"
              onInput={(e) => editor.chain().focus().toggleHighlight({ color: (e.target as HTMLInputElement).value }).run()}
            />
          </label>
        </div>

        <ToolBtn
          onClick={() => editor.chain().focus().unsetColor().unsetHighlight().run()}
          title="Supprimer la couleur"
        >
          <span className="text-[10px] font-bold leading-none line-through">A</span>
        </ToolBtn>

        <Sep />

        {/* Alignment */}
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Aligner à gauche">
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Centrer">
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Aligner à droite">
          <AlignRight className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justifier">
          <AlignJustify className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        {/* Lists */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Liste à puces">
          <List className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Liste numérotée">
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        {/* Link + HR */}
        <ToolBtn onClick={setLink} active={editor.isActive("link")} title="Lien">
          <LinkIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Séparateur horizontal">
          <Minus className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        {/* Undo / Redo */}
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Annuler (Ctrl+Z)">
          <Undo2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Rétablir (Ctrl+Y)">
          <Redo2 className="w-3.5 h-3.5" />
        </ToolBtn>
      </div>

      {/* ── Editor area ── */}
      <div className="bg-[var(--surface)] px-6 py-5 min-h-[400px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

// ── Main editor panel ────────────────────────────────────────
export function LegalPageEditor({ initialData }: Props) {
  const [tab, setTab] = useState<Lang>("fr")
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState(initialData)

  function handleSave() {
    startTransition(async () => {
      await upsertLegalPage(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  const frFilled = form.contentFR.trim().length > 10
  const deFilled = form.contentDE.trim().length > 10

  return (
    <div className="space-y-5">
      {/* Titles */}
      <div className="card-luxury p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs tracking-wide text-[var(--text-secondary)] uppercase">Titre — Français</label>
          <Input
            value={form.titleFR}
            onChange={(e) => setForm((f) => ({ ...f, titleFR: e.target.value }))}
            placeholder="Ex. Mentions légales"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs tracking-wide text-[var(--text-secondary)] uppercase">Titel — Deutsch</label>
          <Input
            value={form.titleDE}
            onChange={(e) => setForm((f) => ({ ...f, titleDE: e.target.value }))}
            placeholder="Ex. Impressum"
          />
        </div>
      </div>

      {/* Language tabs */}
      <div className="flex border-b border-[var(--border)]">
        {(["fr", "de"] as Lang[]).map((lang) => {
          const filled = lang === "fr" ? frFilled : deFilled
          return (
            <button
              key={lang}
              onClick={() => setTab(lang)}
              className={`px-5 py-3 text-sm border-b-2 transition-colors flex items-center gap-2 ${
                tab === lang
                  ? "text-[var(--gold)] border-[var(--gold)]"
                  : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]"
              }`}
            >
              {lang === "fr" ? "🇫🇷 Français" : "🇩🇪 Deutsch"}
              <span className={`w-1.5 h-1.5 rounded-full ${filled ? "bg-[var(--success)]" : "bg-[var(--border-strong)]"}`} />
            </button>
          )
        })}
      </div>

      {/* Editors — keep both mounted to preserve state on tab switch */}
      <div className={tab === "fr" ? "" : "hidden"}>
        <RichEditor
          content={form.contentFR}
          onChange={(html) => setForm((f) => ({ ...f, contentFR: html }))}
        />
      </div>
      <div className={tab === "de" ? "" : "hidden"}>
        <RichEditor
          content={form.contentDE}
          onChange={(html) => setForm((f) => ({ ...f, contentDE: html }))}
        />
      </div>

      {/* Warnings */}
      {(!frFilled || !deFilled) && (
        <div className="flex items-start gap-2 text-xs text-[var(--warning)] bg-[var(--warning)]/5 border border-[var(--warning)]/20 rounded-[var(--r-xl)] px-4 py-3">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>
            {!frFilled && !deFilled
              ? "Le contenu FR et DE est vide."
              : !frFilled
              ? "Le contenu FR est vide."
              : "Le contenu DE est vide."}
            {" "}La page publique affichera un message « contenu en cours de rédaction ».
          </span>
        </div>
      )}

      {/* Save */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--text-muted)]">
          URL publique : <span className="font-mono text-[var(--text-secondary)]">/{form.slug}</span>
        </p>
        <Button onClick={handleSave} disabled={isPending} variant="gold" size="default">
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde…</>
          ) : saved ? (
            <><Check className="w-4 h-4" /> Sauvegardé !</>
          ) : (
            "Publier les modifications"
          )}
        </Button>
      </div>
    </div>
  )
}
