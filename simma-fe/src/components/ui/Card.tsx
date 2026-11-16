import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className = "", header, action, children, ...props }) => {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-xs ${className}`} {...props}>
      {(header || action) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          {typeof header === "string" ? (
            <h3 className="text-sm font-semibold text-slate-800">{header}</h3>
          ) : (
            header
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};
