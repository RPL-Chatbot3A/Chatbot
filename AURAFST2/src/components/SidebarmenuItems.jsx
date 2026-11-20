import React from "react";
import { ExternalLink } from "lucide-react";

export const SidebarmenuItems = ({
  icon: Icon,
  label,
  href,
  badge,
  onClick,
}) => {
  const baseClassName =
    "group w-full flex items-center justify-between gap-5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-zinc-100 hover:bg-slate-800/90 transition-colors cursor-pointer text-left";

  const content = (
    <>
      <div className="flex items-center gap-5 min-w-0">
        {Icon && (
          <Icon
            size={16}
            className="text-slate-400 group-hover:text-sky-400 shrink-0 transition-colors"
          />
        )}
        <span className="truncate">{label}</span>
      </div>

      {badge ? (
        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-sky-400 border border-slate-700 shrink-0">
          {badge}
        </span>
      ) : (
        href && (
          <ExternalLink
            size={13}
            className="text-slate-500 group-hover:text-slate-300 shrink-0 transition-colors"
          />
        )
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClassName}
        title={label}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={baseClassName}
      title={label}
    >
      {content}
    </button>
  );
};

export default SidebarmenuItems;
