"use client";

import Link from "next/link";
import { Sparkles, Mail } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/providers/language-provider";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export function Footer() {
  const { t, language } = useLanguage();
  const currentYear = 2026;

  const footerCategories = [
    {
      title: t("footer.platform", "Platform"),
      links: [
        { label: t("nav.exploreProjects", "Explore Projects"), href: "/explore/projects" },
        { label: t("nav.exploreStudents", "Explore Students"), href: "/explore/students" },
        { label: t("nav.roadmaps", "Learning Roadmaps"), href: "/roadmaps" },
        { label: t("features.teamFinderTitle", "Team Finder"), href: "/teams" },
      ],
    },
    {
      title: t("footer.resources", "Resources"),
      links: [
        { label: t("footer.aboutUs", "About Us"), href: "/about" },
        { label: t("footer.howItWorks", "How It Works"), href: "/about#how-it-works" },
        { label: t("footer.faq", "FAQ"), href: "/about#faq" },
      ],
    },
    {
      title: t("footer.legal", "Legal"),
      links: [
        { label: t("footer.privacy", "Privacy Policy"), href: "#" },
        { label: t("footer.terms", "Terms of Service"), href: "#" },
      ],
    },
  ];

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">{APP_NAME}</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {t(
                "footer.tagline",
                "Empowering polytechnic diploma students of Bangladesh to build skills, showcase projects, and connect with peers."
              )}
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <GithubIcon className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@polyskill.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {footerCategories.map((cat, idx) => (
            <div key={idx}>
              <h3 className="text-sm font-semibold">{cat.title}</h3>
              <ul className="mt-3 space-y-2">
                {cat.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {currentYear} {APP_NAME}. {t("footer.copyright", "All rights reserved.")}
          </p>
          <p className="text-xs text-muted-foreground">
            {language === "bn"
              ? "বাংলাদেশে ভালোবাসায় নির্মিত ❤️"
              : "Made with ❤️ in Bangladesh"}
          </p>
        </div>
      </div>
    </footer>
  );
}
