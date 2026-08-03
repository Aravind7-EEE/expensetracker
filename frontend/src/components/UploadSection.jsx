import { useState, useRef } from 'react';

function UploadSection({ onUpload, isAnalyzing }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Upload Bill / Receipt</h2>
      <p style={{ marginBottom: '1.5rem' }}>Drop your image here, and AI will extract the details instantly.</p>
      
      {isAnalyzing ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem 0' }}>
          <div className="spinner"></div>
          <p style={{ color: 'var(--accent-primary)', fontWeight: '500' }}>AI is analyzing your bill...</p>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragActive ? 'var(--accent-primary)' : 'var(--card-border)'}`,
            borderRadius: '16px',
            padding: '3rem 1rem',
            background: dragActive ? 'var(--accent-bg)' : 'rgba(255, 255, 255, 0.02)',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onClick={onButtonClick}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg, image/png"
            onChange={handleChange}
            style={{ display: "none" }}
          />
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧾</div>
          <p style={{ fontWeight: '500', color: 'var(--text-main)' }}>Click to upload or drag and drop</p>
          <p style={{ fontSize: '0.875rem' }}>JPG or PNG (max 4MB)</p>
        </div>
      )}
    </div>
  );
}

export default UploadSection;
