import SyntaxHighlighter from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/hljs";

export default function CodeBlock({ code, language = "json" }) {
  return (
    <SyntaxHighlighter
      language={language}
      style={nightOwl}
      customStyle={{
        margin: 0,
        background: "transparent",
        borderRadius: "8px",
        fontSize: "0.75rem",
        lineHeight: "1.4",
        height: "100%",
      }}
      wrapLines={true}
    >
      {code}
    </SyntaxHighlighter>
  );
}
