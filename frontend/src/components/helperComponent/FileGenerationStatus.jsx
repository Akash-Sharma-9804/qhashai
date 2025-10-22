import React from 'react';

// ✅ REPLACE your existing FileGenerationStatus with this enhanced version:
const FileGenerationStatus = ({ status, fileType, message }) => {
  if (!status || status === 'completed') return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'generating':
        return {
          icon: <div className="w-3 h-3 border border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>,
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          borderColor: "border-blue-200 dark:border-blue-700",
          textColor: "text-blue-800 dark:text-blue-200",
          message: message || `Generating ${fileType?.toUpperCase()} file...`
        };
      case 'failed':
        return {
          icon: <span className="text-red-500">❌</span>,
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-700",
          textColor: "text-red-800 dark:text-red-200",
          message: message || `Failed to generate ${fileType?.toUpperCase()} file`
        };
      default:
        return {
          icon: <div className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>,
          bgColor: "bg-gray-50 dark:bg-gray-900/20",
          borderColor: "border-gray-200 dark:border-gray-700",
          textColor: "text-gray-800 dark:text-gray-200",
          message: message || "Processing..."
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`mt-2 inline-flex items-center gap-2 px-3 py-2 ${config.bgColor} rounded-lg border ${config.borderColor}`}>
      {config.icon}
      <span className={`text-xs font-medium ${config.textColor}`}>
        {config.message}
      </span>
    </div>
  );
};

export default FileGenerationStatus;