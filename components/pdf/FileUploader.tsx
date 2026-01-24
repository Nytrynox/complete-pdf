'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, FileText, Image, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  accept?: string;
  multiple?: boolean;
  onFilesChange: (files: File[]) => void;
  files: File[];
  maxFiles?: number;
  maxSize?: number; // in MB
}

export function FileUploader({ 
  accept = '.pdf', 
  multiple = false, 
  onFilesChange, 
  files,
  maxFiles = 20,
  maxSize = 100
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    validateAndAddFiles(droppedFiles);
  }, [files, multiple, maxFiles, maxSize, onFilesChange]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      validateAndAddFiles(selectedFiles);
    }
  }, [files, multiple, maxFiles, maxSize, onFilesChange]);

  const validateAndAddFiles = (newFiles: File[]) => {
    // Check file count
    const totalFiles = files.length + newFiles.length;
    if (totalFiles > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Check file sizes
    const oversizedFile = newFiles.find(f => f.size > maxSize * 1024 * 1024);
    if (oversizedFile) {
      setError(`File "${oversizedFile.name}" exceeds ${maxSize}MB limit`);
      return;
    }

    if (multiple) {
      onFilesChange([...files, ...newFiles]);
    } else {
      onFilesChange(newFiles.slice(0, 1));
    }
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    return FileText;
  };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        animate={{ 
          scale: isDragging ? 1.01 : 1,
          borderColor: isDragging ? '#e5322d' : '#e2e8f0'
        }}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          isDragging 
            ? 'bg-red-50 border-red-400' 
            : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
        }`}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <motion.div
          animate={{ y: isDragging ? -5 : 0 }}
          className="flex flex-col items-center"
        >
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
            isDragging ? 'bg-red-100' : 'bg-white shadow-sm'
          }`}>
            <Upload className={`w-10 h-10 ${isDragging ? 'text-red-500' : 'text-gray-400'}`} />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isDragging ? 'Drop files here' : 'Drag & drop files here'}
          </h3>
          <p className="text-gray-500 mb-4">or click to browse</p>
          
          <span className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all cursor-pointer">
            Select Files
          </span>
          
          <p className="text-sm text-gray-400 mt-4">
            {accept === '.pdf' ? 'PDF files only' : accept} • Max {maxSize}MB per file
            {multiple && ` • Up to ${maxFiles} files`}
          </p>
        </motion.div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-600 text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">
                Selected Files ({files.length})
              </h4>
              {files.length > 1 && (
                <button
                  onClick={() => onFilesChange([])}
                  className="text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
            
            {files.map((file, index) => {
              const FileIcon = getFileIcon(file);
              return (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm group hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                    <FileIcon className="w-6 h-6 text-red-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  
                  <button
                    onClick={() => removeFile(index)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FileUploader;
