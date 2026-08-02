import React, { useEffect, useState } from "react";
import { loadFooterContent } from "../lib/footerContent";
import { initialFooterContent } from "../admin/data/mockFooterContent";
import { NewsletterBar, FooterColumns, BottomBar } from "./footer/FooterSections";

export const Footer = () => {
  const [content, setContent] = useState(initialFooterContent);
  useEffect(() => { loadFooterContent().then(setContent).catch(() => {}); }, []);

  return (
    <footer
      className="bg-[var(--da-pine)] text-[#F7F4EC] mt-20"
      style={{ background: content.bg || undefined, color: content.textColor || undefined }}
      data-testid="site-footer"
    >
      <NewsletterBar content={content.newsletter} />
      <FooterColumns columns={content.columns} />
      <BottomBar content={content.bottomBar} />
    </footer>
  );
};
