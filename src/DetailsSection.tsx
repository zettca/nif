import type { ReactNode } from "react";

interface DetailsSectionProps {
  title: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function DetailsSection({
  title,
  children,
  className = "",
  contentClassName = "mt-4",
}: DetailsSectionProps) {
  return (
    <details className={`group ${className}`.trim()}>
      <summary className="cursor-pointer list-none text-sm font-semibold text-heading flex items-center gap-2">
        <span className="text-lg transition-transform duration-200 group-open:rotate-90">
          ▶
        </span>
        {title}
      </summary>
      <div className={contentClassName}>{children}</div>
    </details>
  );
}
