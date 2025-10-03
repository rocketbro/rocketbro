/* eslint-disable @typescript-eslint/no-explicit-any */
import { PortableText, PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => (
      <h1 className="text-5xl font-bold mb-6 mt-12">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-4xl font-bold mb-5 mt-10">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-3xl font-bold mb-4 mt-8">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-2xl font-bold mb-3 mt-6">{children}</h4>
    ),
    normal: ({ children }) => <p className="text-2xl mb-6">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-accent dark:border-accent-dark pl-6 italic my-8 text-2xl">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 mb-6 ml-4">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-6 ml-4">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="text-2xl">{children}</li>,
    number: ({ children }) => <li className="text-2xl">{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-bold text-foreground dark:text-foreground-dark">
        {children}
      </strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="bg-muted dark:bg-muted-dark px-2 py-1 rounded text-lg font-mono">
        {children}
      </code>
    ),
    link: ({ value, children }) => {
      const target = value?.href?.startsWith("http") ? "_blank" : undefined;
      const rel = target === "_blank" ? "noopener noreferrer" : undefined;
      return (
        <a
          href={value?.href}
          target={target}
          rel={rel}
          className="text-accent dark:text-accent-dark hover:text-accent-hover dark:hover:text-accent-hover-dark underline transition-colors"
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref) {
        return null;
      }
      return (
        <figure className="my-8">
          <Image
            src={urlFor(value).width(1200).url()}
            alt={value.alt || "Blog post image"}
            width={1200}
            height={675}
            className="rounded-lg w-full h-auto"
          />
          {value.alt && (
            <figcaption className="text-sm text-foreground dark:text-foreground-dark opacity-70 mt-2 text-center">
              {value.alt}
            </figcaption>
          )}
        </figure>
      );
    },
    code: ({ value }) => {
      const language = value?.language || "text";
      return (
        <div className="my-6 rounded-lg overflow-hidden">
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: "1.5rem",
              fontSizeAdjust: "0.65",
              fontSize: "1rem",
              borderRadius: "0.5rem",
            }}
            showLineNumbers={true}
          >
            {value?.code || ""}
          </SyntaxHighlighter>
        </div>
      );
    },
  },
};

interface PortableTextRendererProps {
  value: any;
}

export function PortableTextRenderer({ value }: PortableTextRendererProps) {
  return <PortableText value={value} components={components} />;
}
