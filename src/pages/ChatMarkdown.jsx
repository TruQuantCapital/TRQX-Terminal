import React from "react";

export default function ChatMarkdown({ text }) {
  if (!text) return null;

  const rawLines = text.split("\n").map((l) => l.trim());
  const blocks = [];
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i];

    if (line === "") {
      i++;
      continue;
    }

    const h3 = line.match(/^###\s+(.*)/);
    const h2 = line.match(/^##\s+(.*)/);
    const h1 = line.match(/^#\s+(.*)/);
    const ulItem = line.match(/^[-*]\s+(.*)/);
    const olItem = line.match(/^\d+\.\s+(.*)/);

    if (h3 || h2 || h1) {
      const headerText = (h3 || h2 || h1)[1];
      const type = h3 ? "h3" : "h2";
      const result = collectContinuation(rawLines, i + 1, headerText);
      blocks.push({ type, text: result.merged });
      i = result.nextIndex;
      continue;
    }

    if (ulItem || olItem) {
      const listType = ulItem ? "ul" : "ol";
      const items = [];
      let j = i;
      while (j < rawLines.length) {
        const itemLine = rawLines[j];
        if (itemLine === "") break;
        const itemMatch = listType === "ul"
          ? itemLine.match(/^[-*]\s+(.*)/)
          : itemLine.match(/^\d+\.\s+(.*)/);
        if (!itemMatch) break;

        const result = collectContinuation(rawLines, j + 1, itemMatch[1]);
        items.push(result.merged);
        j = result.nextIndex;
      }
      blocks.push({ type: listType, items });
      i = j;
      continue;
    }

    const result = collectContinuation(rawLines, i + 1, line);
    blocks.push({ type: "p", text: result.merged });
    i = result.nextIndex;
  }

  return (
    <div className="chatMarkdown">
      {blocks.map((block, idx) => {
        if (block.type === "h2") {
          return (
            <h4 key={idx} className="chatMdHeading">
              {renderInline(block.text)}
            </h4>
          );
        }
        if (block.type === "h3") {
          return (
            <h5 key={idx} className="chatMdSubheading">
              {renderInline(block.text)}
            </h5>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={idx} className="chatMdList">
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "ol") {
          return (
            <ol key={idx} className="chatMdList">
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={idx} className="chatMdParagraph">
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}

function collectContinuation(lines, startIndex, firstLineText) {
  let merged = firstLineText;
  let i = startIndex;

  while (i < lines.length) {
    const line = lines[i];
    if (line === "") break;
    if (/^###\s+/.test(line) || /^##\s+/.test(line) || /^#\s+/.test(line)) break;
    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) break;

    merged += " " + line;
    i++;
  }

  return { merged, nextIndex: i };
}

function renderInline(text) {
  const parts = [];
  let remaining = text;
  let key = 0;

  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*)/;

  while (remaining.length > 0) {
    const match = remaining.match(pattern);
    if (!match) {
      parts.push(remaining);
      break;
    }

    const before = remaining.slice(0, match.index);
    if (before) parts.push(before);

    if (match[2] !== undefined) {
      parts.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3] !== undefined) {
      parts.push(<em key={key++}>{match[3]}</em>);
    }

    remaining = remaining.slice(match.index + match[0].length);
  }

  return parts;
}
