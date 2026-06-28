import React, { useState } from "react";
import { toast } from "sonner";
import { loadContactContent } from "../lib/contactContent";
import { addLead } from "../lib/leads";
import { HeaderSection, InfoSection, FormSection } from "../components/contact/ContactSections";
import { EditPageButton } from "../components/EditPageButton";

export const Contact = () => {
  const content = loadContactContent();
  const [values, setValues] = useState({});
  const onChange = (id, value) => setValues((v) => ({ ...v, [id]: value }));

  const submit = (e) => {
    e.preventDefault();
    addLead(values, content.form.fields.map((f) => ({ id: f.id, label: f.label })));
    toast.success("Mensagem enviada", { description: "Responderemos em breve. Obrigada pelo teu cuidado." });
    setValues({});
  };

  return (
    <div className="container-da py-12" data-testid="contact-page">
      <HeaderSection content={content.header} />

      <div className="grid lg:grid-cols-[1fr_360px] gap-10 mt-12">
        <FormSection content={content.form} values={values} onChange={onChange} onSubmit={submit} />
        <InfoSection content={content.info} />
      </div>
      <EditPageButton editorPath="/admin/conteudo-contacto" />
    </div>
  );
};
