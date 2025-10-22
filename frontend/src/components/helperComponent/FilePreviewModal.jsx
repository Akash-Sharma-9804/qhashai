// components/FilePreviewModal.jsx
import { X } from "lucide-react";



export default function FilePreviewModal({ fileUrl, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative max-w-full max-h-full p-4">
        <button
          className="absolute top-2 right-2 text-white hover:text-gray-300"
          onClick={onClose}
        >
          <X size={28} />
        </button>
        <img
          src={fileUrl}
          alt="Preview"
          className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
}
