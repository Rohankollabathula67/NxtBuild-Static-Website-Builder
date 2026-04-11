function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const h = date.getHours();
    const m = date.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${m < 10 ? '0' + m : m} ${ampm}`;
  };

  return (
    <div className={`chat-message ${isUser ? 'chat-message-user' : 'chat-message-ai'}`}>
      <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
        <p className="chat-bubble-text">{message.content}</p>
      </div>
      <span className="chat-timestamp">{formatTime(message.timestamp)}</span>
    </div>
  );
}

export default ChatMessage;