"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

interface LoomMarkdownProps {
  markdown: string;
}

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl md:text-3xl font-bold mt-8 mb-4 leading-tight">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl md:text-2xl font-bold mt-7 mb-4 leading-tight">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl md:text-2xl font-semibold mt-6 mb-3 leading-tight">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-xl md:text-2xl font-semibold mt-6 mb-3 leading-tight">{children}</h4>
  ),
  h5: ({ children }) => (
    <h5 className="text-xl md:text-2xl font-semibold mt-5 mb-3 leading-tight">{children}</h5>
  ),
  h6: ({ children }) => (
    <h6 className="text-xl md:text-2xl font-semibold mt-5 mb-3 leading-tight">{children}</h6>
  ),
  p: ({ children }) => (
    <p className="text-xl md:text-2xl leading-relaxed whitespace-pre-wrap break-words mb-6">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 mb-6 space-y-2 text-xl md:text-2xl">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 mb-6 space-y-2 text-xl md:text-2xl">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed break-words">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-accent dark:border-accent-dark pl-4 italic my-6 text-xl md:text-2xl">
      {children}
    </blockquote>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="text-accent dark:text-accent-dark hover:text-accent-hover dark:hover:text-accent-hover-dark underline transition-colors break-all"
    >
      {children}
    </a>
  ),
  code: ({ children, className }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-muted dark:bg-white/10 px-2 py-1 rounded-lg text-base md:text-xl font-mono break-words">
          {children}
        </code>
      );
    }

    return <code className={className}>{children}</code>;
  },
  hr: () => <hr className="my-6 border-border/70 dark:border-border-dark/70" />,
};

export function LoomMarkdown({ markdown }: LoomMarkdownProps) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {markdown}
    </ReactMarkdown>
  );
}
