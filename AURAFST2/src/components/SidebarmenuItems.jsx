import React from "react";
import { ExternalLink } from "lucide-react";

export const SidebarmenuItems = ({
  icon: Icon,
  label,
  href,
  badge,
  onClick,
  theme = "dark",
}) => {
  const baseClassName = `group w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
    theme === "dark"
      ? "text-slate-300 hover:text-zinc-100 hover:bg-slate-800/90"
      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
  }`;

  const content = (
    <>
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <Icon
            size={16}
            className={`shrink-0 transition-colors ${
              theme === "dark"
                ? "text-slate-400 group-hover:text-sky-400"
                : "text-slate-500 group-hover:text-sky-600"
            }`}
          />
        )}
        <span className="truncate">{label}</span>
      </div>

      {badge ? (
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-md shrink-0 border font-medium ${
            theme === "dark"
              ? "bg-slate-800 text-sky-400 border-slate-700"
              : "bg-sky-50 text-sky-600 border-sky-200"
          }`}
        >
          {badge}
        </span>
      ) : (
        href && (
          <ExternalLink
            size={13}
            className={`shrink-0 transition-colors ${
              theme === "dark"
                ? "text-slate-500 group-hover:text-slate-300"
                : "text-slate-400 group-hover:text-slate-600"
            }`}
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
