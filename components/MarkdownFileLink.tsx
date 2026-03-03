"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { buildSanityFileUrlFromRef } from "@/lib/sanity/file-url";

interface MarkdownFileLinkProps {
  fileUrl?: string | null;
  assetRef?: string | null;
  title?: string | null;
  filename?: string | null;
  children: ReactNode;
}

export function MarkdownFileLink({
  fileUrl,
  assetRef,
  title,
  filename,
  children,
}: MarkdownFileLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedUrl = useMemo(() => {
    if (fileUrl) {
      return fileUrl;
    }

    return buildSanityFileUrlFromRef(assetRef);
  }, [assetRef, fileUrl]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const openModal = async () => {
    if (!resolvedUrl) {
      setError("No markdown file is attached to this link.");
      setIsOpen(true);
      return;
    }

    setIsOpen(true);
    if (content || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(resolvedUrl, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Unable to load markdown file (${response.status}).`);
      }

      const markdownText = await response.text();
      setContent(markdownText);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load markdown file.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const modalTitle = title || filename || "Markdown file";

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline text-accent dark:text-accent-dark hover:text-accent-hover dark:hover:text-accent-hover-dark underline transition-colors break-all"
      >
        {children}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 px-4 py-6 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={modalTitle}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div className="mx-auto flex h-full max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-border dark:border-border-dark bg-background dark:bg-background-dark shadow-2xl">
            <div className="flex items-center justify-between border-b border-border dark:border-border-dark px-4 py-3 md:px-6 md:py-4">
              <h2 className="text-xl md:text-2xl font-bold break-words [overflow-wrap:anywhere]">
                {modalTitle}
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center rounded-full p-2 opacity-80 hover:opacity-100 transition-opacity"
                aria-label="Close markdown viewer"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 md:p-6">
              {isLoading && (
                <p className="font-mono text-base md:text-lg opacity-70">
                  Loading markdown file...
                </p>
              )}

              {error && (
                <p className="font-mono text-base md:text-lg text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}

              {!isLoading && !error && (
                <pre className="font-mono text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                  {content ?? ""}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
