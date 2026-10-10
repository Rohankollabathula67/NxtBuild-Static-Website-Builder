function CodeEditor({
  code,
  onChange,
  files = [],
  activeFilePath,
  onActiveFileChange,
  onFileChange,
}) {
  const hasFiles = files.length > 0;
  const activeFile = files.find((file) => file.path === activeFilePath) || files[0];

  if (hasFiles) {
    return (
      <div className="code-editor-container code-editor-multi">
        <aside className="code-file-list">
          <div className="code-file-list-title">Files</div>
          {files.map((file) => (
            <button
              key={file.path}
              className={`code-file-item ${activeFile?.path === file.path ? 'active' : ''}`}
              onClick={() => onActiveFileChange(file.path)}
              title={file.path}
            >
              {file.path}
            </button>
          ))}
        </aside>
        <div className="code-file-editor">
          <div className="code-file-header">
            <span>{activeFile?.path}</span>
            <span>{activeFile?.language || 'text'}</span>
          </div>
          <textarea
            className="code-editor-textarea"
            value={activeFile?.content || ''}
            onChange={(e) => onFileChange(activeFile.path, e.target.value)}
            spellCheck="false"
            autoCorrect="off"
            autoCapitalize="off"
            placeholder="// Generated code will appear here..."
          />
        </div>
      </div>
    );
  }

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
