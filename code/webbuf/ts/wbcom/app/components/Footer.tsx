import Icon from "./Icon";
import externalLink from "lucide-static/icons/external-link.svg?raw";

const year = new Date().getFullYear();

const links = [
  { label: "GitHub", href: "https://github.com/astrohackerlabs/webbuf" },
  { label: "npm", href: "https://www.npmjs.com/package/webbuf" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-12 text-sm text-muted-foreground">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} Astrohacker. MIT licensed.</p>
          <nav className="flex gap-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-accent"
                rel="noopener noreferrer"
              >
                {link.label}
                <Icon icon={externalLink} size={14} />
              </a>
            ))}
          </nav>
        </div>
        <a
          href="https://astrohacker.com"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 font-heading text-base font-semibold transition-colors hover:text-accent"
        >
          <img
            src="/images/brand/astrohacker-dark-64.webp"
            width={20}
            height={20}
            alt="Astrohacker"
            className="h-5 w-5"
          />
          An Astrohacker Project
        </a>
      </div>
    </footer>
  );
}
