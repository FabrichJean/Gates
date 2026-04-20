import React, { useState, useMemo } from "react";
import type { FileRecord } from "../../types/file";

// ═══════════════════════════════════════════════════════════════════════════════
// FILE DETAILS WITH PREVIEW - ENTERPRISE GRADE
// ═══════════════════════════════════════════════════════════════════════════════

export interface FileDetailsProps {
  file: FileRecord;
  className?: string;
  onDownload?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

// ───────────────────────────────────────────────────────────────────────────────
// Icon System
// ───────────────────────────────────────────────────────────────────────────────

const Icon: React.FC<{ name: string; className?: string; size?: number }> = ({
  name, className = '', size = 16
}) => {
  const icons: Record<string, React.ReactNode> = {
    file: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" />
      </svg>
    ),
    image: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" />
      </svg>
    ),
    video: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" />
      </svg>
    ),
    music: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
      </svg>
    ),
    code: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16,18 22,12 16,6" /><polyline points="8,6 2,12 8,18" />
      </svg>
    ),
    pdf: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
    archive: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="21,8 21,21 3,21 3,8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" />
      </svg>
    ),
    download: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    share: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
    trash: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3,6 5,6 21,6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    ),
    edit: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
    ),
    copy: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20,6 9,17 4,12" />
      </svg>
    ),
    external: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15,3 21,3 21,9" /><line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    ),
    calendar: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    user: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
    folder: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
    tag: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
    message: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    link: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    eye: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    hash: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
      </svg>
    ),
  };

  return (
    <span className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {icons[name] || null}
    </span>
  );
};

// ───────────────────────────────────────────────────────────────────────────────
// Utilities
// ───────────────────────────────────────────────────────────────────────────────

const formatSize = (size?: number): string => {
  if (!size && size !== 0) return "—";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

const formatDate = (date?: string | Date): string => {
  if (!date) return "—";
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
};

const getFileType = (filename: string): { type: string; icon: string; color: string } => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  const types: Record<string, { icon: string; color: string }> = {
    // Images
    jpg: { icon: 'image', color: 'bg-purple-100 text-purple-600 border-purple-200' },
    jpeg: { icon: 'image', color: 'bg-purple-100 text-purple-600 border-purple-200' },
    png: { icon: 'image', color: 'bg-purple-100 text-purple-600 border-purple-200' },
    gif: { icon: 'image', color: 'bg-purple-100 text-purple-600 border-purple-200' },
    webp: { icon: 'image', color: 'bg-purple-100 text-purple-600 border-purple-200' },
    svg: { icon: 'image', color: 'bg-purple-100 text-purple-600 border-purple-200' },
    // Documents
    pdf: { icon: 'pdf', color: 'bg-red-100 text-red-600 border-red-200' },
    doc: { icon: 'file', color: 'bg-blue-100 text-blue-600 border-blue-200' },
    docx: { icon: 'file', color: 'bg-blue-100 text-blue-600 border-blue-200' },
    xls: { icon: 'file', color: 'bg-green-100 text-green-600 border-green-200' },
    xlsx: { icon: 'file', color: 'bg-green-100 text-green-600 border-green-200' },
    ppt: { icon: 'file', color: 'bg-orange-100 text-orange-600 border-orange-200' },
    pptx: { icon: 'file', color: 'bg-orange-100 text-orange-600 border-orange-200' },
    txt: { icon: 'file', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    md: { icon: 'file', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    // Code
    js: { icon: 'code', color: 'bg-yellow-100 text-yellow-600 border-yellow-200' },
    ts: { icon: 'code', color: 'bg-blue-100 text-blue-600 border-blue-200' },
    jsx: { icon: 'code', color: 'bg-cyan-100 text-cyan-600 border-cyan-200' },
    tsx: { icon: 'code', color: 'bg-blue-100 text-blue-600 border-blue-200' },
    py: { icon: 'code', color: 'bg-green-100 text-green-600 border-green-200' },
    json: { icon: 'code', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    // Media
    mp4: { icon: 'video', color: 'bg-pink-100 text-pink-600 border-pink-200' },
    mov: { icon: 'video', color: 'bg-pink-100 text-pink-600 border-pink-200' },
    mp3: { icon: 'music', color: 'bg-amber-100 text-amber-600 border-amber-200' },
    wav: { icon: 'music', color: 'bg-amber-100 text-amber-600 border-amber-200' },
    // Archives
    zip: { icon: 'archive', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    rar: { icon: 'archive', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    tar: { icon: 'archive', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    gz: { icon: 'archive', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  };

  const type = types[ext] || { icon: 'file', color: 'bg-slate-100 text-slate-600 border-slate-200' };
  return { type: ext.toUpperCase(), ...type };
};

const isImageFile = (filename: string): boolean => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
};

// ───────────────────────────────────────────────────────────────────────────────
// Preview Components
// ───────────────────────────────────────────────────────────────────────────────

const FilePreview: React.FC<{ file: FileRecord; type: { icon: string; color: string } }> = ({
  file,
  type
}) => {
  const [imageError, setImageError] = useState(false);

  if (isImageFile(file.node_path || '') && file.public_url && !imageError) {
    return (
      <div className="relative w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden group">
        <img
          src={file.public_url}
          alt={file.node_path}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-xs text-white font-medium truncate">{file.node_path}</span>
          <span className="text-xs text-white/80">{formatSize(file.size)}</span>
        </div>
      </div>
    );
  }

  // Video preview
  const videoExts = ['mp4', 'mov', 'webm', 'ogg', 'mkv', ".mp3"];
  const ext = (file.node_path || '').split('.').pop()?.toLowerCase() || '';
  if (videoExts.includes(ext) && file.public_url) {
    return (
      <div className="relative w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden group">
        <video
          src={file.public_url}
          controls
          className="w-full h-full object-cover"
          poster={undefined}
        />
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-xs text-white font-medium truncate">{file.node_path}</span>
          <span className="text-xs text-white/80">{formatSize(file.size)}</span>
        </div>
      </div>
    );
  }

  // Iframe preview for other formats with public_url
  if (file.public_url) {
    return (
      <div className="relative w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden group">
        <iframe
          src={file.public_url}
          title={file.node_path}
          className="w-full h-full border-0"
          allowFullScreen
        />
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-xs text-white font-medium truncate">{file.node_path}</span>
          <span className="text-xs text-white/80">{formatSize(file.size)}</span>
        </div>
      </div>
    );
  }

  // Generic file icon preview
  return (
    <div className={`
      w-full aspect-video rounded-lg border-2 border-dashed 
      flex flex-col items-center justify-center gap-3
      ${type.color.replace('text-', 'border-').replace('bg-', '')}
      bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800
    `}>
      <div className={`
        w-16 h-16 rounded-2xl flex items-center justify-center
        ${type.color}
        shadow-sm
      `}>
        <Icon name={type.icon} size={32} />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{file.node_path?.split('/').pop()}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{formatSize(file.size)}</p>
      </div>
    </div>
  );
};

// ───────────────────────────────────────────────────────────────────────────────
// Detail Row Component
// ───────────────────────────────────────────────────────────────────────────────

const DetailRow: React.FC<{
  icon: string;
  label: string;
  value: React.ReactNode;
  copyable?: boolean;
  onCopy?: () => void;
}> = ({ icon, label, value, copyable, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-start gap-3 py-2 group">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
        <Icon name={icon} size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="text-sm text-slate-800 font-medium truncate">{value}</div>
          {copyable && (
            <button
              onClick={handleCopy}
              className={`
                p-1 rounded transition-all duration-150
                ${copied
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100'
                }
              `}
              title={copied ? 'Copied!' : 'Copy to clipboard'}
            >
              <Icon name={copied ? 'check' : 'copy'} size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ───────────────────────────────────────────────────────────────────────────────
// Tag Component
// ───────────────────────────────────────────────────────────────────────────────

const Tag: React.FC<{ label: string }> = ({ label }) => (
  <span className="
    inline-flex items-center gap-1 px-2 py-1 
    bg-slate-100 text-slate-700 text-xs font-medium
    rounded-md border border-slate-200
    hover:bg-slate-200 hover:border-slate-300 transition-colors cursor-default
  ">
    <Icon name="tag" size={10} className="text-slate-500" />
    {label}
  </span>
);

// ───────────────────────────────────────────────────────────────────────────────
// Main Component
// ───────────────────────────────────────────────────────────────────────────────

export const FileDetails: React.FC<FileDetailsProps> = ({
  file,
  className = "",
  onDownload,
  onShare,
  onDelete,
  onEdit,
}) => {
  // const [showFullPath, setShowFullPath] = useState(false);
  const fileType = useMemo(() => getFileType(file.node_path || ''), [file.node_path]);

  const filename = file.node_path?.split('/').pop() || 'Unknown';
  const filepath = file.node_path || '';
  const directory = filepath.substring(0, filepath.lastIndexOf('/')) || '/';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Download handler using public_url
  const handleDownload = useMemo(() => {
    if (!file.public_url) return undefined;
    return () => {
      const link = document.createElement('a');
      link.href = file.public_url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 100);
    };
  }, [file.public_url, filename]);

  return (
    <div className={`
      bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden
      w-full
      ${className}
    `}>
      {/* Preview Section */}
      <div className="relative">
        <FilePreview file={file} type={fileType} />

        {/* Overlay Actions */}
        <div className="absolute top-3 right-3 flex gap-2">
          {(file.public_url) && (
            <button
              onClick={handleDownload}
              className="
                p-2 rounded-lg bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm
                text-slate-600 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700
                border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-400
                transition-all duration-150
              "
              title="Download"
              disabled={!(onDownload || file.public_url)}
            >
              <Icon name="download" size={18} />
            </button>
          )}
          {onShare && (
            <button
              onClick={onShare}
              className="
                p-2 rounded-lg bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm
                text-slate-600 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-700
                border border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-400
                transition-all duration-150
              "
              title="Share"
            >
              <Icon name="share" size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-1">
        {/* File Name Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 truncate" title={filename}>
              {filename}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`
                inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                ${fileType.color}
              `}>
                {fileType.type}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{formatSize(file.size)}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            {file.public_url && (
              <button
                onClick={() => copyToClipboard(file.public_url!)}
                className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Copy link"
              >
                <Icon name="link" size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-0.5">
          {/* Owner */}
          {file.user && (
            <div className="flex items-start gap-3 py-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <Icon name="user" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Owner</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm text-slate-800 dark:text-slate-100 font-medium">{file.user.username}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">(ID: {file.user.id})</span>
                </div>
              </div>
            </div>
          )}

          {/* Target User */}
          {file.targetUser && (
            <div className="flex items-start gap-3 py-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 dark:text-blue-400">
                <Icon name="user" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Shared With</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm text-slate-800 dark:text-slate-100 font-medium">{file.targetUser.username}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">(ID: {file.targetUser.id})</span>
                </div>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 py-2">
            {file.createdAt && (
              <div className="flex items-start gap-2">
                <Icon name="calendar" size={14} className="text-slate-400 dark:text-slate-500 mt-0.5" />
                <div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created</p>
                  <p className="text-xs text-slate-700 dark:text-slate-200 mt-0.5">{formatDate(file.createdAt)}</p>
                </div>
              </div>
            )}
            {file.updatedAt && file.updatedAt !== file.createdAt && (
              <div className="flex items-start gap-2">
                <Icon name="calendar" size={14} className="text-slate-400 dark:text-slate-500 mt-0.5" />
                <div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Modified</p>
                  <p className="text-xs text-slate-700 dark:text-slate-200 mt-0.5">{formatDate(file.updatedAt)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {file.tags && file.tags.length > 0 && (
            <div className="flex items-start gap-3 py-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <Icon name="tag" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Tags ({file.tags.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {file.tags.map((tag) => (
                    <Tag key={tag} label={tag} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Comment */}
          {file.comment && (
            <div className="flex items-start gap-3 py-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <Icon name="message" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Comment</p>
                <p className="text-sm text-slate-700 dark:text-slate-200 mt-0.5 whitespace-pre-wrap">{file.comment}</p>
              </div>
            </div>
          )}

          {/* Public URL */}
          {file.public_url && (
            <div className="flex items-start gap-3 py-2 group">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                <Icon name="link" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Public Link</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <a
                    href={file.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline truncate flex items-center gap-1"
                  >
                    {file.public_url.replace(/^https?:\/\//, '')}
                    <Icon name="external" size={12} />
                  </a>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(file.public_url!)}
                className="flex-shrink-0 p-1.5 rounded text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Icon name="copy" size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      {(onDownload || onShare || onDelete || onEdit) && (
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(onDownload || file.public_url) && (
              <button
                onClick={onDownload || handleDownload}
                className="
                  flex items-center gap-2 px-3 py-1.5 text-sm font-medium
                  text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg
                  hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700
                  transition-all duration-150
                "
                disabled={!(onDownload || file.public_url)}
              >
                <Icon name="download" size={14} />
                Download
              </button>
            )}
            {onShare && (
              <button
                onClick={onShare}
                className="
                  flex items-center gap-2 px-3 py-1.5 text-sm font-medium
                  text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg
                  hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700
                  transition-all duration-150
                "
              >
                <Icon name="share" size={14} />
                Share
              </button>
            )}
          </div>

          {onEdit && (
            <button
              onClick={onEdit}
              className="
                flex items-center gap-2 px-3 py-1.5 text-sm font-medium cursor-pointer
                text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30
                rounded-lg transition-all duration-150
              "
            >
              <Icon name="edit" size={14} />
              Edit
            </button>
          )}

          {onDelete && (
            <button
              onClick={onDelete}
              className="
                flex items-center gap-2 px-3 py-1.5 text-sm font-medium cursor-pointer
                text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30
                rounded-lg transition-all duration-150
              "
            >
              <Icon name="trash" size={14} />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileDetails;