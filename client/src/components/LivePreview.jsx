function LivePreview({ code, files = [] }) {
  const previewFile = files.find((file) => file.path === 'preview.html')
    || files.find((file) => file.path?.endsWith('index.html'))
    || files.find((file) => file.language === 'html' || file.path?.endsWith('.html'));

  const previewCode = previewFile?.content || code;

  if (!previewCode) {
    return (
      <div className="preview-empty">
        <p className="preview-empty-icon">⬡</p>
        <p className="preview-empty-title">Your app will appear here</p>
        <p className="preview-empty-subtitle">Describe what you want in the chat →</p>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={previewCode}
      sandbox="allow-scripts"
      title="Live Preview"
      className="preview-iframe"
    />
  );
}

export default LivePreview;
