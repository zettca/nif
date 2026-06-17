type CardStatus = "default" | "success" | "error" | "warning";

interface CardProps {
  children: React.ReactNode;
  label?: React.ReactNode;
  status?: CardStatus;
  className?: string;
}

const statusClasses: Record<CardStatus, string> = {
  default: "border-border",
  success: "border-success bg-success/5",
  error: "border-error bg-error/5",
  warning: "border-warning bg-warning/10",
};

export function Card({
  children,
  label,
  status = "default",
  className = "",
}: CardProps) {
  return (
    <div
      className={`border-2 rounded-xl p-4 ${statusClasses[status]} ${className}`.trim()}
    >
      {label && (
        <div className="text-xs font-bold uppercase tracking-widest mb-1">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}
