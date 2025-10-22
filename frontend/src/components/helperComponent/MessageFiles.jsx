// import { useState } from "react";
// import FilePreviewModal from "./FilePreviewModal";
// import { File } from "lucide-react";
// import "./MessageFiles.css";
// import FileActionModal from "./FileActionModal";

// export default function MessageFiles({ files }) {
//   const [previewImage, setPreviewImage] = useState(null);

//   const getFileIcon = (fileType) => {
//     if (/^pdf$/i.test(fileType)) return "./icons/pdf.png";
//     if (/^(doc|docx)$/i.test(fileType)) return "./icons/doc-file.png";
//     if (/^(xls|xlsx)$/i.test(fileType)) return "./icons/excel-logo.png";
//     if (/^txt$/i.test(fileType)) return "./icons/file.png";
//     return <File className="w-8 h-8 text-white" />;
//   };

//   return (
//     <>
//       {previewImage && (
//         <FilePreviewModal
//           fileUrl={previewImage}
//           onClose={() => setPreviewImage(null)}
//         />
//       )}

//       <div className="flex flex-wrap gap-2 mt-2 justify-end max-w-2xl ml-auto">
//         {files.map((file, i) => {
//           const fileUrl = file.file_path || file.url;
//           // console.log("file path", fileUrl);
//           const fileName = file.file_name || file.name;
//           const fileType =
//             file.type ||
//             (fileName?.includes(".")
//               ? fileName.split(".").pop().toLowerCase()
//               : null);

//           // Show a loading skeleton if data isn't ready
//           if (!fileType || !fileUrl) {
//             return (
//               // <div
//               //   key={i}
//               //   className="w-[180px] h-[180px] bg-gray-300 dark:bg-gray-700 animate-pulse rounded-md"
//               // />
//               <div
//               key={i}
//               className="w-[180px] h-[100px] flex flex-col items-center justify-center animate-pulse   bg-gray-500 dark:bg-gray-500 rounded-md shadow-inner">
             
//               <div className="flex text-base font-bold gap-2 mt-2 font-centurygothic">
//                <span className="text-black ">Reading file</span>   <div className="loader2"></div>
//               </div>
//               <div className="loader"></div>
//             </div>
//             );
//           }

//           const isImage = /^(jpg|jpeg|png|gif|webp)$/i.test(fileType);

//           return (
//             <div key={i} className="relative group w-[180px]">
//               {isImage ? (
//                 <div
//                   onClick={() => setPreviewImage(fileUrl)}
//                   className="cursor-pointer">
//                   <img
//                     src={fileUrl}
//                     alt={fileName}
//                     className="rounded-md max-w-[180px] max-h-[180px] object-cover border shadow-md transition-transform group-hover:scale-105"
//                   />
//                   <div
//                     className="text-sm mt-1 font-medium truncate text-center"
//                     title={fileName}>
//                     {fileName}
//                   </div>
//                   <div className="text-xs text-center opacity-70">
//                     {fileType.toUpperCase()}
//                   </div>
//                 </div>
//               ) : (
//                 <a
//                   href={fileUrl}
//                   download={fileName}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="block bg-blue-600 dark:bg-indigo-700 text-white px-3 py-2 rounded-md shadow-md hover:bg-blue-700 transition-all">
//                   <div className="flex items-center gap-2 truncate">
//                     <img
//                       src={getFileIcon(fileType)}
//                       alt={`${fileType} icon`}
//                       className="w-8 h-8"
//                     />
//                     <span
//                       className="text-sm font-medium truncate"
//                       title={fileName}>
//                       {fileName}
//                     </span>
//                   </div>
//                   <div className="text-xs opacity-80 mt-1">
//                     {fileType.toUpperCase()}
//                   </div>
//                 </a>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </>
//   );
// }

// import { useState } from "react";
// import FilePreviewModal from "./FilePreviewModal";
// import FileActionModal from "./FileActionModal";
// import { File } from "lucide-react";
// import "./MessageFiles.css";

// export default function MessageFiles({ files }) {
//   const [previewImage, setPreviewImage] = useState(null);
//   const [fileActionModal, setFileActionModal] = useState({ open: false, file: null });

//   // ✅ IMPROVED: Better file type detection function
//   const getFileTypeFromName = (fileName, mimeType) => {
//     if (!fileName && !mimeType) return null;
    
//     // First try to get from MIME type
//     if (mimeType) {
//       if (mimeType.includes('pdf')) return 'pdf';
//       if (mimeType.includes('word') || mimeType.includes('document')) return 'docx';
//       if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'xlsx';
//       if (mimeType.includes('text/plain')) return 'txt';
//       if (mimeType.startsWith('image/')) {
//         return mimeType.split('/')[1]; // jpg, png, etc.
//       }
//     }
    
//     // Fallback to file extension
//     if (fileName && fileName.includes('.')) {
//       return fileName.split('.').pop().toLowerCase();
//     }
    
//     return null;
//   };

//   const getFileIcon = (fileType) => {
//     if (!fileType) return <File className="w-8 h-8 text-white" />;
    
//     const type = fileType.toLowerCase();
//     if (type === 'pdf') return "./icons/pdf.png";
//     if (type === 'doc' || type === 'docx') return "./icons/doc-file.png";
//     if (type === 'xls' || type === 'xlsx') return "./icons/excel-logo.png";
//     if (type === 'txt') return "./icons/file.png";
//     return <File className="w-8 h-8 text-white" />;
//   };

//   const handleFileClick = (file, fileUrl, fileName, fileType) => {
//     const isImage = /^(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileType);
    
//     if (isImage) {
//       setPreviewImage(fileUrl);
//     } else {
//       setFileActionModal({
//         open: true,
//         file: {
//           url: fileUrl,
//           name: fileName,
//           type: fileType
//         }
//       });
//     }
//   };

// // const handleDownload = async (url, filename) => {
// //   try {
// //     console.log("🔄 Starting download:", { url, filename });
    
// //     // ✅ METHOD 1: Try fetch + blob download (works better with CORS)
// //     const response = await fetch(url);
    
// //     if (!response.ok) {
// //       throw new Error(`HTTP error! status: ${response.status}`);
// //     }
    
// //     const blob = await response.blob();
// //     const downloadUrl = window.URL.createObjectURL(blob);
    
// //     const link = document.createElement('a');
// //     link.href = downloadUrl;
// //     link.download = filename || 'download';
    
// //     document.body.appendChild(link);
// //     link.click();
// //     document.body.removeChild(link);
    
// //     // ✅ CLEANUP: Release the blob URL
// //     window.URL.revokeObjectURL(downloadUrl);
    
// //     setFileActionModal({ open: false, file: null });
// //     console.log("✅ Download completed:", filename);
    
// //   } catch (error) {
// //     console.error("❌ Fetch download failed:", error);
    
// //     // ✅ FALLBACK: Try direct link method
// //     try {
// //       const link = document.createElement('a');
// //       link.href = url;
// //       link.download = filename || 'download';
// //       link.target = '_blank';
// //       link.rel = 'noopener noreferrer';
      
// //       document.body.appendChild(link);
// //       link.click();
// //       document.body.removeChild(link);
      
// //       setFileActionModal({ open: false, file: null });
// //       console.log("✅ Fallback download initiated:", filename);
      
// //     } catch (fallbackError) {
// //       console.error("❌ All download methods failed:", fallbackError);
      
// //       // ✅ LAST RESORT: Open in new tab
// //       window.open(url, '_blank', 'noopener,noreferrer');
// //       setFileActionModal({ open: false, file: null });
// //       alert("Direct download failed. File opened in new tab instead.");
// //     }
// //   }
// // };

// const handleDownload = async (url, filename) => {
//   try {
//     console.log("🔄 Starting download:", { url, filename });
    
//     // ✅ WORKAROUND: Create a proxy download through your own backend
//     const response = await fetch('/api/download-file', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${localStorage.getItem('token')}`,
//       },
//       body: JSON.stringify({
//         fileUrl: url,
//         filename: filename
//       })
//     });
    
//     if (response.ok) {
//       const blob = await response.blob();
//       const downloadUrl = window.URL.createObjectURL(blob);
      
//       const link = document.createElement('a');
//       link.href = downloadUrl;
//       link.download = filename;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
      
//       window.URL.revokeObjectURL(downloadUrl);
//     } else {
//       throw new Error('Download failed');
//     }
    
//     setFileActionModal({ open: false, file: null });
    
//   } catch (error) {
//     console.error("❌ Download failed:", error);
//     // Fallback: open in new tab
//     window.open(url, '_blank', 'noopener,noreferrer');
//     setFileActionModal({ open: false, file: null });
//   }
// };


//   const handleOpenNewTab = (url) => {
//     window.open(url, '_blank', 'noopener,noreferrer');
//     setFileActionModal({ open: false, file: null });
//   };

//   const handleCloseModal = () => {
//     setFileActionModal({ open: false, file: null });
//   };

//   return (
//     <>
//       {previewImage && (
//         <FilePreviewModal
//           fileUrl={previewImage}
//           onClose={() => setPreviewImage(null)}
//         />
//       )}

//       <FileActionModal
//         open={fileActionModal.open}
//         file={fileActionModal.file}
         
//         onOpenNewTab={handleOpenNewTab}
//         onCancel={handleCloseModal}
//       />

//       <div className="flex flex-wrap gap-2 mt-2 justify-end max-w-2xl ml-auto">
//         {files.map((file, i) => {
//           // ✅ IMPROVED: Better file data extraction
//           const fileUrl = file.file_path || file.url;
//           const fileName = file.file_name || file.original_filename || file.display_name || file.name;
//           const displayName = file.display_name || file.file_name || file.name;
//           const mimeType = file.file_type || file.mime_type || file.type;
          
//           // ✅ CONSISTENT: Use improved file type detection
//           const fileType = getFileTypeFromName(fileName, mimeType);

           

//           // Handle upload errors
//           if (file.upload_success === false || file.error) {
//             return (
//               <div
//                 key={i}
//                 className="w-[180px] h-[100px] flex flex-col items-center justify-center bg-red-100 dark:bg-red-900 border-2 border-red-300 dark:border-red-700 rounded-md shadow-inner">
//                 <div className="text-red-600 dark:text-red-400 text-center p-2">
//                   <div className="text-sm font-bold mb-1">❌ Upload Failed</div>
//                   <div className="text-xs truncate" title={fileName}>
//                     {displayName || "Unknown file"}
//                   </div>
//                   {file.error && (
//                     <div className="text-xs mt-1 opacity-75" title={file.error}>
//                       {file.error.length > 30 ? file.error.substring(0, 30) + "..." : file.error}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           }

//           // ✅ IMPROVED: Better loading condition
//           if (!fileUrl || !fileName || (!fileType && !mimeType)) {
//             return (
//               <div
//                 key={i}
//                 className="w-[180px] h-[100px] flex flex-col items-center justify-center animate-pulse bg-gray-500 dark:bg-gray-500 rounded-md shadow-inner">
//                 <div className="flex text-base font-bold gap-2 mt-2 font-centurygothic">
//                   <span className="text-white">Processing...</span>
//                   <div className="loader2"></div>
//                 </div>
//                 <div className="loader"></div>
               
//               </div>
//             );
//           }

//           const isImage = /^(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileType) || 
//                          mimeType?.startsWith('image/');

//           return (
//             <div key={i} className="relative group w-[180px]">
//               {isImage ? (
//                 <div
//                   onClick={() => handleFileClick(file, fileUrl, fileName, fileType)}
//                   className="cursor-pointer">
//                   <img
//                     src={fileUrl}
//                     alt={displayName}
//                     className="rounded-md max-w-[180px] max-h-[180px] object-cover border shadow-md transition-transform group-hover:scale-105"
//                     onError={(e) => {
//                       e.target.style.display = 'none';
//                       e.target.nextSibling.style.display = 'flex';
//                     }}
//                   />
//                   <div 
//                     className="hidden w-[180px] h-[180px] bg-blue-600 dark:bg-indigo-700 text-white rounded-md shadow-md items-center justify-center flex-col">
//                     {typeof getFileIcon(fileType) === 'string' ? (
//                       <img
//                         src={getFileIcon(fileType)}
//                         alt={`${fileType} icon`}
//                         className="w-12 h-12 mb-2"
//                       />
//                     ) : (
//                       <div className="mb-2">{getFileIcon(fileType)}</div>
//                     )}
//                     <span className="text-xs text-center px-2">Image Load Error</span>
//                   </div>
                  
//                  <div
//   className="text-sm mt-1 font-medium truncate text-center px-1"
//   title={fileName}>
//   {displayName && displayName.length > 20 ? displayName.substring(0, 20) + "..." : displayName}
// </div>
//                   <div className="text-xs text-center opacity-70">
//                     {fileType?.toUpperCase() || 'IMAGE'}
//                   </div>
//                 </div>
//               ) : (
//                 <div
//                   onClick={() => handleFileClick(file, fileUrl, fileName, fileType)}
//                   className="cursor-pointer block bg-blue-600 dark:bg-indigo-700 text-white px-3 py-2 rounded-md shadow-md hover:bg-blue-700 transition-all">
//                   <div className="flex items-center gap-2 truncate">
//                     {typeof getFileIcon(fileType) === 'string' ? (
//                       <img
//                         src={getFileIcon(fileType)}
//                         alt={`${fileType} icon`}
//                         className="w-8 h-8"
//                         onError={(e) => {
//                           e.target.style.display = 'none';
//                           e.target.nextSibling.style.display = 'inline-block';
//                         }}
//                       />
//                     ) : (
//                       getFileIcon(fileType)
//                     )}
//                     <File className="w-8 h-8 text-white hidden" />
                    
//                  <span
//   className="text-sm font-medium truncate max-w-[120px]"
//   title={fileName}>
//   {displayName && displayName.length > 15 ? displayName.substring(0, 15) + "..." : displayName}
// </span>
//                   </div>
//                   <div className="text-xs opacity-80 mt-1">
//                     {fileType?.toUpperCase() || 'FILE'}
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </>
//   );
// }

import { useState } from "react";
import FilePreviewModal from "./FilePreviewModal";
import FileActionModal from "./FileActionModal";
import { File } from "lucide-react";
import "./MessageFiles.css";

export default function MessageFiles({ files }) {
  const [previewImage, setPreviewImage] = useState(null);
  const [fileActionModal, setFileActionModal] = useState({ open: false, file: null });

  // ✅ IMPROVED: Better file type detection with fallbacks
  const getFileTypeFromName = (fileName, mimeType) => {
    if (!fileName && !mimeType) return 'file'; // Default fallback
    
    // First try to get from MIME type
    if (mimeType) {
      if (mimeType.includes('pdf')) return 'pdf';
      if (mimeType.includes('word') || mimeType.includes('document')) return 'docx';
      if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'xlsx';
      if (mimeType.includes('text/plain')) return 'txt';
      if (mimeType.startsWith('image/')) {
        return mimeType.split('/')[1]; // jpg, png, etc.
      }
    }
    
    // Fallback to file extension
    if (fileName && fileName.includes('.')) {
      return fileName.split('.').pop().toLowerCase();
    }
    
    return 'file'; // Final fallback
  };

  // ✅ IMPROVED: Better icon handling with error fallbacks
  const getFileIcon = (fileType) => {
    if (!fileType) return <File className="w-8 h-8 text-white" />;
    
    const type = fileType.toLowerCase();
    
    // Return icon paths with error handling
    const iconMap = {
      'pdf': "./icons/pdf.png",
      'doc': "./icons/doc-file.png",
      'docx': "./icons/doc-file.png",
      'xls': "./icons/excel-logo.png",
      'xlsx': "./icons/excel-logo.png",
      'txt': "./icons/file.png"
    };
    
    return iconMap[type] || <File className="w-8 h-8 text-white" />;
  };

  // ✅ IMPROVED: Icon component with error handling
  const FileIcon = ({ fileType, className = "w-8 h-8" }) => {
    const [iconError, setIconError] = useState(false);
    const iconPath = getFileIcon(fileType);
    
    if (typeof iconPath === 'string' && !iconError) {
      return (
        <img
          src={iconPath}
          alt={`${fileType} icon`}
          className={className}
          onError={() => setIconError(true)}
        />
      );
    }
    
    // Fallback to Lucide icon
    return <File className={`${className} text-white`} />;
  };

  const handleFileClick = (file, fileUrl, fileName, fileType) => {
    const isImage = /^(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileType);
    
    if (isImage) {
      setPreviewImage(fileUrl);
    } else {
      setFileActionModal({
        open: true,
        file: {
          url: fileUrl,
          name: fileName,
          type: fileType
        }
      });
    }
  };

  const handleDownload = async (url, filename) => {
    try {
      console.log("🔄 Starting download:", { url, filename });
      
      // ✅ Try direct download first
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'download';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setFileActionModal({ open: false, file: null });
      console.log("✅ Download initiated:", filename);
      
    } catch (error) {
      console.error("❌ Download failed:", error);
      // Fallback: open in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
      setFileActionModal({ open: false, file: null });
    }
  };

  const handleOpenNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setFileActionModal({ open: false, file: null });
  };

  const handleCloseModal = () => {
    setFileActionModal({ open: false, file: null });
  };

  return (
    <>
      {previewImage && (
        <FilePreviewModal
          fileUrl={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}

      <FileActionModal
        open={fileActionModal.open}
        file={fileActionModal.file}
        onDownload={handleDownload}
        onOpenNewTab={handleOpenNewTab}
        onCancel={handleCloseModal}
      />

      <div className="flex flex-wrap gap-2 mt-2 justify-end max-w-2xl ml-auto">
        {files.map((file, i) => {
          // ✅ IMPROVED: Better file data extraction with more fallbacks
          const fileUrl = file.file_path || file.url || file.path;
          const fileName = file.file_name || file.original_filename || file.display_name || file.name || `file_${i}`;
          const displayName = file.display_name || file.file_name || file.name || fileName;
          const mimeType = file.file_type || file.mime_type || file.type;
          
          // ✅ CONSISTENT: Use improved file type detection
          const fileType = getFileTypeFromName(fileName, mimeType);

          // console.log(`File ${i}:`, { fileUrl, fileName, displayName, mimeType, fileType, file });

          // Handle upload errors
          if (file.upload_success === false || file.error) {
            return (
              <div
                key={i}
                className="w-[180px] h-[100px] flex flex-col items-center justify-center bg-red-100 dark:bg-red-900 border-2 border-red-300 dark:border-red-700 rounded-md shadow-inner">
                <div className="text-red-600 dark:text-red-400 text-center p-2">
                  <div className="text-sm font-bold mb-1">❌ Upload Failed</div>
                  <div className="text-xs truncate" title={fileName}>
                    {displayName || "Unknown file"}
                  </div>
                  {file.error && (
                    <div className="text-xs mt-1 opacity-75" title={file.error}>
                      {file.error.length > 30 ? file.error.substring(0, 30) + "..." : file.error}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // ✅ IMPROVED: Better loading condition - only show loading if explicitly processing
          if (file.processing === true) {
            return (
              <div
                key={i}
                className="w-[180px] h-[100px] flex flex-col items-center justify-center animate-pulse bg-gray-500 dark:bg-gray-500 rounded-md shadow-inner">
                <div className="flex text-base font-bold gap-2 mt-2 font-centurygothic">
                  <span className="text-white">Processing...</span>
                  <div className="loader2"></div>
                </div>
                <div className="loader"></div>
              </div>
            );
          }

          // ✅ FALLBACK: If no URL but we have file data, show file info anyway
          if (!fileUrl && fileName) {
            return (
              <div
                key={i}
                className="w-[180px] h-[100px] flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-md shadow-inner">
                <FileIcon fileType={fileType} className="w-8 h-8 mb-2" />
                <div className="text-gray-600 dark:text-gray-400 text-center p-2">
                  <div className="text-xs truncate" title={fileName}>
                    {displayName.length > 20 ? displayName.substring(0, 20) + "..." : displayName}
                  </div>
                  <div className="text-xs mt-1 opacity-75">
                    {fileType?.toUpperCase() || 'FILE'}
                  </div>
                  <div className="text-xs text-red-500 mt-1">No URL</div>
                </div>
              </div>
            );
          }

          const isImage = /^(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileType) || 
                         mimeType?.startsWith('image/');

          return (
            <div key={i} className="relative group w-[180px]">
              {isImage ? (
                <div
                  onClick={() => handleFileClick(file, fileUrl, fileName, fileType)}
                  className="cursor-pointer">
                  <img
                    src={fileUrl}
                    alt={displayName}
                    className="rounded-md max-w-[180px] max-h-[180px] object-cover border shadow-md transition-transform group-hover:scale-105"
                    onError={(e) => {
                      console.error(`Image load failed for: ${fileUrl}`);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="hidden w-[180px] h-[180px] bg-blue-600 dark:bg-indigo-700 text-white rounded-md shadow-md items-center justify-center flex-col">
                    <FileIcon fileType={fileType} className="w-12 h-12 mb-2" />
                    <span className="text-xs text-center px-2">Image Load Error</span>
                  </div>
                  
                  <div
                    className="text-sm mt-1 font-medium truncate text-center px-1"
                    title={fileName}>
                    {displayName && displayName.length > 20 ? displayName.substring(0, 20) + "..." : displayName}
                  </div>
                  <div className="text-xs text-center opacity-70">
                    {fileType?.toUpperCase() || 'IMAGE'}
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => handleFileClick(file, fileUrl, fileName, fileType)}
                  className="cursor-pointer block bg-blue-600 dark:bg-indigo-700 text-white px-3 py-2 rounded-md shadow-md hover:bg-blue-700 transition-all">
                  <div className="flex items-center gap-2 truncate">
                    <FileIcon fileType={fileType} className="w-8 h-8" />
                    
                    <span
                      className="text-sm font-medium truncate max-w-[120px]"
                      title={fileName}>
                      {displayName && displayName.length > 15 ? displayName.substring(0, 15) + "..." : displayName}
                    </span>
                  </div>
                  <div className="text-xs opacity-80 mt-1">
                    {fileType?.toUpperCase() || 'FILE'}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

