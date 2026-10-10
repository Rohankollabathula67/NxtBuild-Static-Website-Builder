import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ToastContext } from '../context/ToastContext.jsx';
import ChatMessage from '../components/ChatMessage.jsx';
import ChatInput from '../components/ChatInput.jsx';
import CodeEditor from '../components/CodeEditor.jsx';
import LivePreview from '../components/LivePreview.jsx';
import { getProject, updateProject, saveCode } from '../services/projectService.js';
import { generateCode } from '../services/generationService.js';
import { downloadProject } from '../utils/projectDownload.js';
import '../styles/builder.css';

const EXAMPLE_PROMPTS = [
  'A personal portfolio with dark theme & animations',
  'A simple calculator app',
  'A weather dashboard with card UI',
  'A landing page for a coffee shop',
  'A to-do list with local storage',
  'A countdown timer for New Year',
];

const getPreviewCode = (files, fallbackCode = '') => {
  const previewFile = files.find((file) => file.path === 'preview.html')
    || files.find((file) => file.path?.endsWith('index.html'))
    || files.find((file) => file.language === 'html' || file.path?.endsWith('.html'));

  return previewFile?.content || fallbackCode;
};

function BuilderPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useContext(ToastContext);

  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [code, setCode] = useState('');
  const [files, setFiles] = useState([]);
  const [activeFilePath, setActiveFilePath] = useState('');
  const [activeTab, setActiveTab] = useState('preview');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [showVersions, setShowVersions] = useState(false);
  const [savingCode, setSavingCode] = useState(false);

  const messagesEndRef = useRef(null);
  const initialPromptSentRef = useRef(false);

  // Load project on mount
  useEffect(() => {
    const loadProject = async () => {
      try {
        const data = await getProject(projectId);
        const projectFiles = data.generatedFiles?.length
          ? data.generatedFiles
          : data.generatedCode
            ? [{ path: 'preview.html', language: 'html', content: data.generatedCode }]
            : [];

        setProject(data);
        setMessages(data.messages || []);
        setCode(data.generatedCode || '');
        setFiles(projectFiles);
        setActiveFilePath(projectFiles[0]?.path || '');
        setEditTitle(data.title || 'Untitled Project');
      } catch (err) {
        showToast('Project not found.', 'error');
        navigate('/dashboard');
      } finally {
        setPageLoading(false);
      }
    };
    loadProject();
  }, [projectId]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (prompt) => {
    if (loading) return;

    const userMessage = { role: 'user', content: prompt, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const result = await generateCode(projectId, prompt);
      setMessages((prev) => [...prev, result.message]);

      if (result.generatedFiles?.length || result.generatedCode) {
        const nextFiles = result.generatedFiles?.length
          ? result.generatedFiles
          : [{ path: 'preview.html', language: 'html', content: result.generatedCode }];

        setFiles(nextFiles);
        setActiveFilePath(nextFiles[0]?.path || '');
        setCode(result.generatedCode || getPreviewCode(nextFiles));
        setActiveTab('preview');
      }

      if (project?.title === 'Untitled Project') {
        const newTitle = prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt;
        setProject((prev) => ({ ...prev, title: newTitle }));
        setEditTitle(newTitle);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Generation failed. Please try again.';
      showToast(message, 'error');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialPrompt = location.state?.initialPrompt;
    if (!pageLoading && initialPrompt && !initialPromptSentRef.current) {
      initialPromptSentRef.current = true;
      handleSend(initialPrompt);
    }
  }, [pageLoading]);

  const handleTitleSave = async () => {
    setIsEditingTitle(false);
    if (editTitle.trim() && editTitle !== project?.title) {
      try {
        await updateProject(projectId, { title: editTitle.trim() });
        setProject((prev) => ({ ...prev, title: editTitle.trim() }));
        showToast('Project renamed.', 'success');
      } catch {
        showToast('Failed to rename project.', 'error');
      }
    }
  };

  const handleSaveCode = async () => {
    if ((!code && files.length === 0) || savingCode) return;
    setSavingCode(true);
    try {
      await saveCode(projectId, getPreviewCode(files, code), files);
      showToast('Code saved!', 'success');
    } catch {
      showToast('Failed to save code.', 'error');
    } finally {
      setSavingCode(false);
    }
  };

  const handleDownload = () => {
    const activeFile = files.find((file) => file.path === activeFilePath);
    const downloadContent = activeFile?.content || code;
    if (!downloadContent) return;

    const blob = new Blob([downloadContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile?.path?.split('/').pop() || `${project?.title || 'my-app'}.html`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(activeFile ? `${activeFile.path} downloaded!` : 'Code downloaded!', 'success');
  };

  const handleDownloadProject = () => {
    const projectFiles = files.length
      ? files
      : code
        ? [{ path: 'preview.html', language: 'html', content: code }]
        : [];

    if (!projectFiles.length) return;
    downloadProject(projectFiles, project?.title);
    showToast('Project ZIP downloaded!', 'success');
  };

  const handleRestoreVersion = (versionCode, versionFiles = []) => {
    const restoredFiles = versionFiles.length
      ? versionFiles
      : versionCode
        ? [{ path: 'preview.html', language: 'html', content: versionCode }]
        : [];

    setCode(versionCode);
    setFiles(restoredFiles);
    setActiveFilePath(restoredFiles[0]?.path || '');
    setActiveTab('preview');
    setShowVersions(false);
    showToast('Version restored. Click Save to persist.', 'success');
  };

  const handleFileChange = (path, content) => {
    const nextFiles = files.map((file) => (
      file.path === path ? { ...file, content } : file
    ));

    setFiles(nextFiles);
    setCode(getPreviewCode(nextFiles, code));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  if (pageLoading) {
    return (
      <div className="loading-state" style={{ flex: 1 }}>
        <div className="spinner" />
        <p>Loading project...</p>
      </div>
    );
  }

  const versions = project?.versions || [];

  return (
    <div className="builder">
      {/* === CHAT PANEL === */}
      <div className="builder-chat">
        <div className="builder-chat-header">
          <div className="builder-chat-header-left">
            <div className="builder-chat-icon">✦</div>
            {isEditingTitle ? (
              <input
                className="builder-title-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSave(); }}
                autoFocus
              />
            ) : (
              <h2
                className="builder-chat-title"
                onClick={() => setIsEditingTitle(true)}
                title="Click to rename"
              >
                {project?.title || 'Untitled Project'}
              </h2>
            )}
          </div>
          {versions.length > 0 && (
            <button
              className="builder-history-btn"
              onClick={() => setShowVersions(!showVersions)}
            >
              {versions.length} version{versions.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="builder-messages">
          {messages.length === 0 ? (
            <div className="builder-empty-chat">
              <p className="builder-empty-icon">✦</p>
              <p className="builder-empty-title">What would you like to build?</p>
              <p className="builder-empty-subtitle">
                Describe your idea and the AI will generate the code instantly.
              </p>
              <div className="builder-examples">
                {EXAMPLE_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    className="builder-example-chip"
                    onClick={() => handleSend(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="builder-messages-list">
              {messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} />
              ))}
              {loading && (
                <div className="builder-typing">
                  <span className="builder-typing-dot" />
                  <span className="builder-typing-dot" />
                  <span className="builder-typing-dot" />
                  <span className="builder-typing-text">AI is generating…</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <ChatInput onSend={handleSend} loading={loading} />
      </div>

      {/* === PREVIEW PANEL === */}
      <div className="builder-preview">
        <div className="builder-tabs">
          <div className="builder-tabs-left">
            <button
              className={`builder-tab ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              Preview
            </button>
            <button
              className={`builder-tab ${activeTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveTab('code')}
            >
              Code
            </button>
          </div>
          <div className="builder-tabs-right">
            {activeTab === 'code' && (code || files.length > 0) && (
              <button
                className="builder-action-btn save"
                onClick={handleSaveCode}
                disabled={savingCode}
              >
                {savingCode ? 'Saving…' : 'Save'}
              </button>
            )}
            {(code || files.length > 0) && (
              <>
                <button className="builder-action-btn" onClick={handleDownload}>
                  Download File
                </button>
                <button className="builder-action-btn" onClick={handleDownloadProject}>
                  Download Project
                </button>
              </>
            )}
          </div>
        </div>

        <div className="builder-content">
          {activeTab === 'preview' ? (
            <LivePreview code={code} files={files} />
          ) : (
            <CodeEditor
              code={code}
              onChange={setCode}
              files={files}
              activeFilePath={activeFilePath}
              onActiveFileChange={setActiveFilePath}
              onFileChange={handleFileChange}
            />
          )}

          {/* Version History Panel */}
          {showVersions && (
            <div className="versions-panel">
              <div className="versions-panel-header">
                <span className="versions-panel-title">Version History</span>
                <button
                  className="versions-panel-close"
                  onClick={() => setShowVersions(false)}
                >
                  ✕
                </button>
              </div>
              <div className="versions-list">
                {versions.length === 0 ? (
                  <p className="versions-empty">No versions yet</p>
                ) : (
                  [...versions].reverse().map((v, i) => (
                    <div key={i} className="version-item">
                      <p className="version-number">v{versions.length - i}</p>
                      <p className="version-prompt">{v.prompt}</p>
                      <div className="version-meta">
                        <span className="version-date">{formatDate(v.createdAt)}</span>
                        <button
                          className="version-restore-btn"
                          onClick={() => handleRestoreVersion(v.code, v.files)}
                        >
                          Restore
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BuilderPage;
