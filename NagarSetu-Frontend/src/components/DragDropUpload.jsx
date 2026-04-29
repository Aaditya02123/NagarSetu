// src/components/DragDropUpload.jsx  ← CREATE THIS FILE
import React, { useRef, useState } from "react";
import { UploadCloud, X, Image } from "lucide-react";

function DragDropUpload({ onFileSelect, preview, onClear }) {
  const inputRef  = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) onFileSelect(file);
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
        <img src={preview} alt="Preview" className="w-full max-h-64 object-cover" />
        <button type="button" onClick={onClear}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow
                     flex items-center justify-center hover:bg-red-50 transition">
          <X size={14} className="text-slate-600" />
        </button>
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5
                        bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
          <Image size={12} className="text-blue-500" />
          <span className="text-xs text-slate-600 font-medium">Image ready</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200
                  flex flex-col items-center justify-center py-10 px-6 text-center
                  ${dragging
                    ? "border-blue-400 bg-blue-50"
                    : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50"
                  }`}
    >
      <UploadCloud size={36} className={`mb-3 transition-colors ${dragging ? "text-blue-500" : "text-slate-400"}`} />
      <p className="text-sm font-semibold text-slate-700">
        {dragging ? "Drop it here" : "Click or drag an image"}
      </p>
      <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 10 MB</p>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
    </div>
  );
}

export default DragDropUpload;