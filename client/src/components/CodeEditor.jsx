function CodeEditor({ code, onChange }) {
  return (
    <div className="code-editor-container">
      <textarea
        className="code-editor-textarea"
        value={code}
        onChange={(e) => onChange(e.target.value)}
        spellCheck="false"
        autoCorrect="off"
        autoCapitalize="off"
        placeholder="// Generated code will appear here..."
      />
    </div>
  );
}

export default CodeEditor;