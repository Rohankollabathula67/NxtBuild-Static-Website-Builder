import { useState } from 'react';

function ProjectCard({ project, onOpen, onDelete }) {
  const [confirming, setConfirming] = useState(false);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleDeleteClick = () => {
    setConfirming(true);
  };

  const handleConfirmDelete = () => {
    onDelete(project._id);
    setConfirming(false);
  };

  const hasCode = Boolean(project.generatedCode);
  const msgCount = project.messages ? project.messages.length : 0;

  return (
    <div className="project-card">
      <div className="project-card-preview">
        {hasCode ? (
          <iframe
            srcDoc={project.generatedCode}
            sandbox=""
            title={project.title}
            className="project-card-iframe"
          />
        ) : (
          <div className="project-card-empty-preview">
            <span className="project-card-empty-icon">⬡</span>
            <span className="project-card-empty-text">No preview yet</span>
          </div>
        )}
      </div>

      <div className="project-card-info">
        <h3 className="project-card-title">{project.title}</h3>
        <div className="project-card-meta">
          <span className="project-card-date">Updated {formatDate(project.updatedAt)}</span>
          {msgCount > 0 && (
            <span className="project-card-badge">{Math.floor(msgCount / 2)} prompts</span>
          )}
        </div>
      </div>

      {confirming ? (
        <div className="project-card-confirm">
          <span className="project-card-confirm-text">Delete this project?</span>
          <button className="project-card-confirm-no" onClick={() => setConfirming(false)}>
            Cancel
          </button>
          <button className="project-card-confirm-yes" onClick={handleConfirmDelete}>
            Delete
          </button>
        </div>
      ) : (
        <div className="project-card-actions">
          <button className="project-card-open" onClick={() => onOpen(project._id)}>
            Open
          </button>
          <button className="project-card-delete" onClick={handleDeleteClick}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default ProjectCard;