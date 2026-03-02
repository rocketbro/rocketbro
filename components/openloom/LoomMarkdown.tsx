"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

interface LoomMarkdownProps {
  markdown: string;
}

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl md:text-3xl font-bold mt-8 mb-4 leading-tight break-words [overflow-wrap:anywhere]">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl md:text-2xl font-bold mt-7 mb-4 leading-tight break-words [overflow-wrap:anywhere]">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl md:text-2xl font-semibold mt-6 mb-3 leading-tight break-words [overflow-wrap:anywhere]">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-xl md:text-2xl font-semibold mt-6 mb-3 leading-tight break-words [overflow-wrap:anywhere]">
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className="text-xl md:text-2xl font-semibold mt-5 mb-3 leading-tight break-words [overflow-wrap:anywhere]">
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6 className="text-xl md:text-2xl font-semibold mt-5 mb-3 leading-tight break-words [overflow-wrap:anywhere]">
      {children}
    </h6>
  ),
  p: ({ children }) => (
    <p className="text-xl md:text-2xl leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] mb-6">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 mb-6 space-y-2 text-xl md:text-2xl">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 mb-6 space-y-2 text-xl md:text-2xl">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed break-words [overflow-wrap:anywhere]">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-accent dark:border-accent-dark pl-4 italic my-6 text-xl md:text-2xl break-words [overflow-wrap:anywhere]">
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
        <code className="bg-muted dark:bg-white/10 px-2 py-1 rounded-lg text-base md:text-xl font-mono break-words [overflow-wrap:anywhere]">
          {children}
        </code>
      );
    }

    return <code className={className}>{children}</code>;
  },
  pre: ({ children }) => (
    <pre className="my-6 overflow-x-auto rounded-lg bg-muted dark:bg-white/10 p-4 font-mono text-base md:text-lg">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-6 w-full max-w-full overflow-x-auto">
      <table className="w-full table-fixed border-collapse text-lg md:text-xl">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-border/70 dark:border-border-dark/70 p-2 text-left font-semibold break-words [overflow-wrap:anywhere]">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border/70 dark:border-border-dark/70 p-2 align-top break-words [overflow-wrap:anywhere]">
      {children}
    </td>
  ),
  hr: () => <hr className="my-6 border-border/70 dark:border-border-dark/70" />,
};

export function LoomMarkdown({ markdown }: LoomMarkdownProps) {
  return (
    <div className="loom-markdown min-w-0 max-w-full">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
