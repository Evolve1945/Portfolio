"use client";

import { useState, type ReactNode } from "react";

/** Copy text to the clipboard, falling back to the legacy execCommand path when
 * the async Clipboard API is unavailable or blocked. Returns whether it worked. */
function copyToClipboard(text: string): Promise<boolean> {
  const legacy = () => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  };
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(
      () => true,
      () => legacy(),
    );
  }
  return Promise.resolve(legacy());
}

/**
 * Email link that keeps the standard `mailto:` (works when a mail client is
 * registered) but ALSO copies the address to the clipboard on click — so the
 * button always does something useful, even when no desktop mail app is set up
 * (the common reason a `mailto:` appears to "do nothing").
 */
export function CopyEmail({
  email,
  subject,
  label,
  copiedLabel,
  className,
  icon,
}: {
  email: string;
  subject?: string;
  label: string;
  copiedLabel: string;
  className?: string;
  icon?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const href = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;

  return (
    <a
      href={href}
      className={className}
      onClick={() => {
        copyToClipboard(email).then((ok) => {
          if (!ok) return;
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        });
      }}
    >
      {icon}
      <span>{copied ? copiedLabel : label}</span>
    </a>
  );
}

/**
 * Contact-page card variant: same `mailto:` + clipboard-copy behaviour, styled
 * as one of the contact method cards. The address swaps to the "copied"
 * confirmation for a moment on click.
 */
export function CopyEmailCard({
  email,
  subject,
  label,
  copiedLabel,
  icon,
}: {
  email: string;
  subject?: string;
  label: string;
  copiedLabel: string;
  icon: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const href = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;

  return (
    <a
      href={href}
      onClick={() => {
        copyToClipboard(email).then((ok) => {
          if (!ok) return;
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="group rounded-xl border border-border bg-surface p-5 transition-colors hover:border-foreground/30"
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition-colors group-hover:text-foreground">
        {icon}
      </span>
      <p className="mt-3 font-medium">{label}</p>
      <p className="mt-0.5 break-all font-mono text-xs text-muted">
        {copied ? copiedLabel : email}
      </p>
    </a>
  );
}
