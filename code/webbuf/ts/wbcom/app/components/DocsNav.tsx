import { Link, useLocation } from "react-router";
import { docsGroups, normalizePath } from "../lib/docs-navigation";

export default function DocsNav({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Documentation" data-docs-rail>
      {docsGroups.map((group) => (
        <div key={group.title} className="mb-4 last:mb-0">
          <p className="mb-1 font-mono text-[0.65rem] font-medium tracking-widest text-muted uppercase">
            {group.title}
          </p>
          <ul className="m-0 list-none p-0">
            {group.items.map((item) => {
              const current = normalizePath(pathname) === item.to;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    aria-current={current ? "page" : undefined}
                    className={`flex items-center gap-2 py-0.5 text-sm leading-snug tracking-tight break-words no-underline ${current ? "rounded-sm bg-primary/10 font-medium text-primary hover:text-primary" : "text-foreground-dark hover:text-foreground"}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
