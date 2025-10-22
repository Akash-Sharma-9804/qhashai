import React from "react";
import { X, Download, ExternalLink } from "lucide-react";

const FileActionModal = ({ open, file, onDownload, onOpenNewTab, onCancel }) => {
  if (!open) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://qhashai.com${file.url}`);
  };
// ✅ FIX: Add download handler
  const handleDownload = () => {
    const fullUrl = `https://qhashai.com${file.url}`;
    
    // ✅ SIMPLE DOWNLOAD: Create link and force download
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = file.name;
    link.setAttribute('download', file.name); // Force download attribute
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    onCancel(); // Close modal
  };
  const isImage = /^(jpg|jpeg|png|gif|webp)$/i.test(file.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4">
      <div className="relative w-full max-w-md bg-white dark:bg-[#222] text-black dark:text-white rounded-2xl p-6 shadow-xl">
        
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-white text-lg"
          aria-label="Close"
        >
          <X />
        </button>

        <h2 className="text-xl font-semibold mb-4">What would you like to do?</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            File: <span className="font-medium">{file.name}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Type: <span className="font-medium">{file.type?.toUpperCase()}</span>
          </p>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 p-2 rounded text-xs md:text-sm break-words max-h-32 overflow-auto mb-4">
        {file.name}
        </div>

        <div className="flex flex-col gap-3">
          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => onOpenNewTab(`https://qhashai.com${file.url}`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex-1 justify-center"
            >
              <ExternalLink size={16} />
              {isImage ? 'View' : 'Open'} in New Tab
            </button>
            
             {/* <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex-1 justify-center"
            >
              <Download size={16} />
              Download
            </button> */}
          </div>

          {/* Secondary Actions */}
          <div className="flex justify-between items-center gap-3">
            <button
              onClick={handleCopy}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-xs"
            >
              Copy Link
            </button>
            
            <button
              onClick={onCancel}
              className="px-3 py-1 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 rounded text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileActionModal;
