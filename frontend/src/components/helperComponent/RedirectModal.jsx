// import React from "react";

// const RedirectModal = ({ open, url, onConfirm, onCancel }) => {
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
//       <div className="bg-white dark:bg-[#222] text-black dark:text-white rounded-lg p-6 shadow-xl w-[90%] max-w-md">
//         <h2 className="text-lg font-semibold mb-4">Leave Chat?</h2>
//         <p className="mb-6 text-sm">
//           You’re about to open a new page:
//           <br />
//           <span className="text-blue-500 break-all">{url}</span>
//         </p>
//         <div className="flex justify-end gap-3">
//           <button
//             onClick={onCancel}
//             className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-sm"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={() => onConfirm(url)}
//             className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
//           >
//             Continue
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RedirectModal;

import React from "react";
import { X } from "lucide-react";
const RedirectModal = ({ open, url, onConfirm, onCancel }) => {
  if (!open) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
  };

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

       <h2 className="text-xl font-semibold mb-4">Heads up, you're about to leave</h2>
<p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
You're opening a new page outside this chat:
</p>


        <div className="bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 p-2 rounded text-xs md:text-base break-words max-h-40 overflow-auto mb-4">
          {url}
        </div>

        <div className="flex justify-between items-center gap-3 flex-wrap">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-sm"
          >
            Copy Link
          </button>

          <div className="flex gap-2 ml-auto">
            {/* <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 rounded text-sm"
            >
              Cancel
            </button> */}
            <button
              onClick={() => onConfirm(url)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedirectModal;
