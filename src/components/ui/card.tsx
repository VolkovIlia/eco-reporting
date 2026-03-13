import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export function Card({ title, description, children, className = "", ...props }: CardProps) {
  return (
    <div
      className={["bg-white rounded-lg border border-gray-200 shadow-sm", className].join(" ")}
      {...props}
    >
      {(title || description) && (
        <div className="px-6 py-4 border-b border-gray-100">
          {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}

export function CardHeader({ children, className = "" }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={["px-6 py-4 border-b border-gray-100", className].join(" ")}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={["px-6 py-4", className].join(" ")}>
      {children}
    </div>
  );
}
