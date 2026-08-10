"use client";

import { useEffect } from "react";

const RELOAD_FLAG = "__chunk_error_reload";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // ChunkLoadError — typically a stale-chunk after a fresh deploy.
    // Reload once to pick up the new bundle. Guard against reload loops
    // with a sessionStorage flag that clears when the tab closes.
    if (error.name === "ChunkLoadError") {
      if (sessionStorage.getItem(RELOAD_FLAG) === "1") {
        // Already reloaded — the requested chunk still isn't available.
        // Stay on the fallback UI so the user isn't stuck in a loop.
        return;
      }
      sessionStorage.setItem(RELOAD_FLAG, "1");
      window.location.reload();
      return; // not strictly necessary after reload, but clean
    }
  }, [error]);

  return (
    <html lang="en">
      <body style={bodyStyle}>
        <div style={containerStyle}>
          <h1 style={headingStyle}>Something went wrong</h1>
          <p style={textStyle}>
            {error.name === "ChunkLoadError"
              ? "A new version of the site was just deployed. The page will reload automatically — if it doesn't, please try the button below."
              : "An unexpected error occurred. Please try again."}
          </p>
          <button
            onClick={() => {
              // On retry, remove the guard so we attempt another reload if
              // this was a ChunkLoadError.
              sessionStorage.removeItem(RELOAD_FLAG);
              reset();
            }}
            style={buttonStyle}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

// Inline styles — global-error.tsx cannot import CSS modules or global
// stylesheets because the error may have occurred in the style pipeline.
const bodyStyle: React.CSSProperties = {
  margin: 0,
  padding: 0,
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  background: "#f9fafb",
  color: "#111827",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
};

const containerStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "2rem",
  maxWidth: "480px",
};

const headingStyle: React.CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 700,
  marginBottom: "0.75rem",
};

const textStyle: React.CSSProperties = {
  fontSize: "0.9375rem",
  color: "#4b5563",
  marginBottom: "1.5rem",
  lineHeight: 1.6,
};

const buttonStyle: React.CSSProperties = {
  padding: "0.625rem 1.5rem",
  fontSize: "0.9375rem",
  fontWeight: 600,
  border: "none",
  borderRadius: "0.5rem",
  background: "#111827",
  color: "#fff",
  cursor: "pointer",
};