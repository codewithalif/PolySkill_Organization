"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const { language, toggleLanguage, isMounted } = useLanguage();

  if (!isMounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-9 px-2.5 text-xs font-medium gap-1.5 text-muted-foreground"
      >
        <Languages className="h-4 w-4" />
        <span className="font-semibold text-xs">EN</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-9 px-2.5 text-xs font-medium gap-1.5 hover:bg-accent transition-colors"
      onClick={toggleLanguage}
      title={language === "en" ? "বাংলা ভাষায় পরিবর্তন করুন" : "Switch to English"}
      aria-label="Toggle Language"
    >
      <Languages className="h-4 w-4 text-primary" />
      <span className="font-semibold text-xs tracking-wide">
        {language === "en" ? "বাংলা" : "English"}
      </span>
    </Button>
  );
}
