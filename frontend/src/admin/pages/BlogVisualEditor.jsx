import React, { useState } from "react";
import { useAdmin } from "../context/AdminContext";
import { HeaderSection } from "../../components/blog/BlogSections";
import { HEADER_FIELDS, initialBlogContent } from "../data/mockBlogContent";
import { EDITABLE_PAGES } from "../data/editablePages";
import { FormRow, fieldClass, SectionTitle } from "../components/Bits";
import { TitleStyleFields, TextStyleFields } from "../components/contentEditor/ContentFieldEditors";
import { EditorTopBar } from "../components/contentEditor/EditorTopBar";
import { SelectableSection } from "../components/contentEditor/SelectableSection";
import { useContentDraft } from "../hooks/useContentDraft";

export const BlogVisualEditor = () => {
  const { blogContent, setBlogContent } = useAdmin();
  const { draft, updateField, save, resetToDefaults, isDirty } = useContentDraft(blogContent, setBlogContent, initialBlogContent);
  const [selected, setSelected] = useState(false);

  return (
    <div data-testid="admin-blog-editor" className="-m-6 lg:-m-8 flex flex-col h-[calc(100vh-112px)]">
      <EditorTopBar
        title="Conteúdo da Página Blog"
        onReset={resetToDefaults}
        onSave={save}
        isDirty={isDirty}
        pages={EDITABLE_PAGES.filter((p) => p.path !== "/admin/conteudo-blog")}
      />

      <div className="flex-1 flex min-h-0">
        <main className="flex-1 overflow-y-auto bg-[var(--da-cream-2)]/40 p-6" onClick={() => setSelected(false)}>
          <div className="bg-white rounded-2xl p-6">
            <SelectableSection label="Cabeçalho" selected={selected} onSelect={() => setSelected(true)} testid="blog-editor-section-header">
              <HeaderSection content={draft.header} />
            </SelectableSection>
          </div>
          <p className="font-body text-xs text-[var(--da-muted)] mt-4">A grelha de artigos abaixo do cabeçalho é real (gerida em /admin/blog) e não é editável aqui.</p>
        </main>

        <aside className="w-[320px] shrink-0 border-l hairline bg-white overflow-y-auto p-4" data-testid="blog-editor-properties">
          {!selected ? (
            <p className="font-body text-sm text-[var(--da-muted)] text-center mt-8">Clica no cabeçalho para editar o seu conteúdo.</p>
          ) : (
            <div className="space-y-4">
              <SectionTitle eyebrow="secção" title="Cabeçalho" />
              {HEADER_FIELDS.map((f) => (
                <FormRow key={f.key} label={f.label}>
                  {f.type === "textarea" ? (
                    <textarea rows={3} className={fieldClass} value={draft.header[f.key]} onChange={(e) => updateField("header", f.key, e.target.value)} data-testid={`blog-header-${f.key}`} />
                  ) : (
                    <input className={fieldClass} value={draft.header[f.key]} onChange={(e) => updateField("header", f.key, e.target.value)} data-testid={`blog-header-${f.key}`} />
                  )}
                </FormRow>
              ))}
              <TextStyleFields content={draft.header} sectionKey="header" updateField={updateField} prefix="eyebrow" label="Estilo do texto de abertura" testidPrefix="blog-eyebrow" />
              <TitleStyleFields content={draft.header} sectionKey="header" updateField={updateField} testidPrefix="blog-title" />
              <TextStyleFields content={draft.header} sectionKey="header" updateField={updateField} prefix="body" label="Estilo do subtítulo" testidPrefix="blog-body" />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
