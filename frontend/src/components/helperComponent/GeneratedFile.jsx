import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const GeneratedFile = ({ 
  generatedFile, 
  onDownload, 
  className = "",
  showMetadata = true 
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  if (!generatedFile) return null;

  // ✅ Enhanced file icon mapping to match backend file types
  const getFileIcon = (filename, fileType) => {
    // Use fileType from backend if available, otherwise extract from filename
    const type = fileType || filename?.split('.').pop()?.toLowerCase() || 'unknown';
    
    const iconMap = {
      'pdf': "./icons/pdf.png",
      'doc': "./icons/doc-file.png",
      'docx': "./icons/doc-file.png",
      'word': "./icons/doc-file.png", // ✅ Backend sends 'word' type
      'xls': "./icons/excel-logo.png",
      'xlsx': "./icons/excel-logo.png",
      'excel': "./icons/excel-logo.png", // ✅ Backend sends 'excel' type
      'txt': "./icons/file.png",
      'text': "./icons/file.png"
    };
    
    return iconMap[type] || "./icons/file.png";
  };

  // ✅ Enhanced file type styling to match backend types
  const getFileTypeStyles = (filename, fileType) => {
    const type = fileType || filename?.split('.').pop()?.toLowerCase() || 'unknown';
    
    switch (type) {
      case 'pdf':
        return {
          bg: "bg-gradient-to-r from-red-50 to-red-25 dark:from-red-900/20 dark:to-red-900/10",
          border: "border-red-200 dark:border-red-700",
          hover: "hover:from-red-100 hover:to-red-50 dark:hover:from-red-900/30 dark:hover:to-red-900/20",
          text: "text-red-900 dark:text-red-100",
          subtext: "text-red-600 dark:text-red-400",
          badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
        };
      case 'doc':
      case 'docx':
      case 'word':
        return {
          bg: "bg-gradient-to-r from-blue-50 to-blue-25 dark:from-blue-900/20 dark:to-blue-900/10",
          border: "border-blue-200 dark:border-blue-700",
          hover: "hover:from-blue-100 hover:to-blue-50 dark:hover:from-blue-900/30 dark:hover:to-blue-900/20",
          text: "text-blue-900 dark:text-blue-100",
          subtext: "text-blue-600 dark:text-blue-400",
          badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
        };
      case 'xls':
      case 'xlsx':
      case 'excel':
        return {
          bg: "bg-gradient-to-r from-green-50 to-green-25 dark:from-green-900/20 dark:to-green-900/10",
          border: "border-green-200 dark:border-green-700",
          hover: "hover:from-green-100 hover:to-green-50 dark:hover:from-green-900/30 dark:hover:to-green-900/20",
          text: "text-green-900 dark:text-green-100",
          subtext: "text-green-600 dark:text-green-400",
          badge: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
        };
      case 'txt':
      case 'text':
        return {
          bg: "bg-gradient-to-r from-gray-50 to-gray-25 dark:from-gray-900/20 dark:to-gray-900/10",
          border: "border-gray-300 dark:border-gray-600",
          hover: "hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-900/30 dark:hover:to-gray-900/20",
          text: "text-gray-900 dark:text-gray-100",
          subtext: "text-gray-700 dark:text-gray-300",
          badge: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
        };
      default:
        return {
          bg: "bg-gradient-to-r from-purple-50 to-purple-25 dark:from-purple-900/20 dark:to-purple-900/10",
          border: "border-purple-200 dark:border-purple-700",
          hover: "hover:from-purple-100 hover:to-purple-50 dark:hover:from-purple-900/30 dark:hover:to-purple-900/20",
          text: "text-purple-900 dark:text-purple-100",
          subtext: "text-purple-600 dark:text-purple-400",
          badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
        };
    }
  };

  // ✅ Format file size from backend
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return 'Unknown size';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // ✅ Enhanced download handler
  const handleDownload = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      if (onDownload) {
        await onDownload();
      } else {
        // ✅ Fallback download logic for direct URL or base64 data
        if (generatedFile.download_url) {
          // Method 1: Direct URL download
          const link = document.createElement('a');
          link.href = generatedFile.download_url;
          link.download = generatedFile.filename;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (generatedFile.file_data) {
          // Method 2: Base64 data download
          const byteCharacters = atob(generatedFile.file_data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: generatedFile.mime_type });
          
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = generatedFile.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }
        
        toast.success(`📄 Downloaded ${generatedFile.filename}`);
      }
    } catch (error) {
      console.error('❌ Download failed:', error);
      toast.error('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const styles = getFileTypeStyles(generatedFile.filename, generatedFile.file_type);
  const fileType = generatedFile.file_type || generatedFile.filename?.split('.').pop() || 'file';

  return (
    <div className={`group relative ${className}`}>
      <div className={`
        flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer
        ${styles.bg} ${styles.border} ${styles.hover}
        ${isDownloading ? 'opacity-75 cursor-wait' : ''}
      `}>
        {/* ✅ File Icon */}
        <div className="flex-shrink-0">
          <img 
            src={getFileIcon(generatedFile.filename, generatedFile.file_type)} 
            alt={fileType}
            className="w-8 h-8"
            onError={(e) => {
              e.target.src = "./icons/file.png";
            }}
          />
        </div>
        
        {/* ✅ File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-medium text-sm ${styles.text} truncate`}>
              {generatedFile.filename}
            </h4>
            
            {/* ✅ AI Generated Badge */}
            {(generatedFile.ai_generated || generatedFile.is_ai_generated) && (
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles.badge}`}>
                AI Generated
              </span>
            )}
          </div>
          
          {/* ✅ File Metadata */}
          {showMetadata && (
            <div className={`text-xs ${styles.subtext} flex items-center gap-2`}>
                            <span>{fileType.toUpperCase()}</span>
              {generatedFile.file_size && (
                <>
                  <span>•</span>
                  <span>{formatFileSize(generatedFile.file_size)}</span>
                </>
              )}
              {generatedFile.generated_at && (
                <>
                  <span>•</span>
                  <span>
                    {new Date(generatedFile.generated_at).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* ✅ Download Button */}
        <div className="flex-shrink-0">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`
              flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg
              transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
              ${styles.text} hover:bg-white/50 dark:hover:bg-gray-800/50
              border ${styles.border}
            `}
          >
            {isDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>Download</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* ✅ Download URL Preview (for debugging) */}
      {process.env.NODE_ENV === 'development' && generatedFile.download_url && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
          URL: {generatedFile.download_url}
        </div>
      )}
    </div>
  );
};

export default GeneratedFile;

