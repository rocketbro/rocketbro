"use client";

import SyntaxHighlighter from "react-syntax-highlighter";
import { codepenEmbed } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { LoomMarkdown } from "@/components/openloom/LoomMarkdown";

interface LoomNodeContentProps {
  text: string;
}

type Segment =
  | { type: "text"; text: string }
  | { type: "code"; code: string; language: string };

const CODE_BLOCK_REGEX = /```([\w-]+)?\n?([\s\S]*?)```/g;

function parseSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(CODE_BLOCK_REGEX)) {
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      const before = text.slice(lastIndex, matchIndex);
      if (before.trim().length > 0) {
        segments.push({ type: "text", text: before });
      }
    }

    const language = match[1] || "text";
    const code = match[2] || "";

    segments.push({
      type: "code",
      code,
      language,
    });

    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    if (remaining.trim().length > 0) {
      segments.push({ type: "text", text: remaining });
    }
  }

  if (segments.length === 0) {
    segments.push({ type: "text", text });
  }

  return segments;
}

export function LoomNodeContent({ text }: LoomNodeContentProps) {
  const segments = parseSegments(text);

  return (
    <div className="space-y-6">
      {segments.map((segment, index) => {
        if (segment.type === "code") {
          return (
            <div key={`code-${index}`} className="rounded-lg overflow-hidden">
              <SyntaxHighlighter
                language={segment.language}
                style={codepenEmbed}
                customStyle={{
                  margin: 0,
                  padding: "1.5rem",
                  fontSize: "1rem",
                  borderRadius: "0.5rem",
                  fontFamily: "var(--font-cascadia)",
                  fontWeight: 300,
                }}
                codeTagProps={{ style: { fontFamily: "inherit" } }}
                showLineNumbers={false}
              >
                {segment.code}
              </SyntaxHighlighter>
            </div>
          );
        }

        return (
          <LoomMarkdown key={`text-${index}`} markdown={segment.text} />
        );
      })}
    </div>
  );
}
