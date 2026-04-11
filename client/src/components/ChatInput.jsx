import { useState, useRef, useEffect } from 'react';

function ChatInput({ onSend, loading }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-input-container">
      <textarea
        ref={textareaRef}
        className="chat-input-textarea"
        placeholder="Describe what you want to build... (Enter to send)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        rows={1}
      />
      <button
        className="chat-send-btn"
        onClick={handleSubmit}
        disabled={!input.trim() || loading}
      >
        {loading ? '...' : '↑'}
      </button>
    </div>
  );
}

export default ChatInput;