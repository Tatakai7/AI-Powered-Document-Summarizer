import React, { useState } from 'react';
import { Upload, FileText, Loader2, X } from 'lucide-react';
import type { UploadProgress } from '../types';
import { extractTextFromFile } from '../utils/documentProcessor';

interface DocumentUploaderProps {
  onUploadComplete: (file: File, content: string) => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onUploadComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    const supportedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const supportedExtensions = ['.txt', '.pdf', '.docx'];

    const isSupportedType = supportedTypes.includes(file.type.toLowerCase());
    const isSupportedExtension = supportedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!isSupportedType && !isSupportedExtension) {
      alert('Please upload a supported file format: PDF, DOCX, or TXT');
      return;
    }

    setUploadProgress({
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    });

    try {
      setTimeout(() => {
        setUploadProgress(prev => prev ? { ...prev, progress: 30, status: 'processing' } : null);
      }, 300);

      const content = await extractTextFromFile(file);

      setUploadProgress(prev => prev ? { ...prev, progress: 70, status: 'analyzing' } : null);

      setTimeout(() => {
        setUploadProgress(prev => prev ? { ...prev, progress: 100, status: 'complete' } : null);
        onUploadComplete(file, content);

        setTimeout(() => {
          setUploadProgress(null);
        }, 1500);
      }, 500);
    } catch (error) {
      setUploadProgress(prev => prev ? { ...prev, status: 'error' } : null);
      alert(`Failed to process file: ${error}`);
      console.error('Error processing file:', error);
    }
  };

  const clearProgress = () => {
    setUploadProgress(null);
  };

  // Helper function to generate width classes based on progress
  const getProgressWidthClass = (progress: number) => {
    // Create a mapping of progress percentages to Tailwind width classes
    const widthClasses: { [key: number]: string } = {
      0: 'w-0',
      5: 'w-[5%]',
      10: 'w-[10%]',
      15: 'w-[15%]',
      20: 'w-[20%]',
      25: 'w-[25%]',
      30: 'w-[30%]',
      35: 'w-[35%]',
      40: 'w-[40%]',
      45: 'w-[45%]',
      50: 'w-[50%]',
      55: 'w-[55%]',
      60: 'w-[60%]',
      65: 'w-[65%]',
      70: 'w-[70%]',
      75: 'w-[75%]',
      80: 'w-[80%]',
      85: 'w-[85%]',
      90: 'w-[90%]',
      95: 'w-[95%]',
      100: 'w-full'
    };

    // Find the closest match or use arbitrary value
    const closest = Object.keys(widthClasses).reduce((prev, curr) => {
      return Math.abs(parseInt(curr) - progress) < Math.abs(parseInt(prev) - progress) ? curr : prev;
    });

    return widthClasses[parseInt(closest)] || `w-[${progress}%]`;
  };

  return (
    <div className="w-full">
      {uploadProgress ? (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">{uploadProgress.fileName}</p>
                <p className="text-sm text-gray-500 capitalize">{uploadProgress.status}</p>
              </div>
            </div>
            {uploadProgress.status === 'complete' && (
              <button
                onClick={clearProgress}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear upload progress"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full transition-all duration-300 rounded-full ${
                uploadProgress.status === 'error' ? 'bg-red-500' :
                uploadProgress.status === 'complete' ? 'bg-green-500' :
                'bg-blue-600'
              } ${getProgressWidthClass(uploadProgress.progress)}`}
            />
          </div>

          {uploadProgress.status !== 'complete' && uploadProgress.status !== 'error' && (
            <div className="flex items-center justify-center mt-4">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
            ${isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
            }
          `}
        >
          <input
            type="file"
            accept=".txt,.pdf,.docx,text/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="document-upload"
            aria-label="Upload document"
          />

          <div className="flex flex-col items-center space-y-4">
            <div className={`p-4 rounded-full ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <Upload className={`w-12 h-12 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>

            <div>
              <label htmlFor="document-upload" className="text-lg font-medium text-gray-900 mb-1 cursor-pointer">
                Drop your document here or click to browse
              </label>
              <p className="text-sm text-gray-500">
                Supports PDF, DOCX, and TXT files up to 10MB
              </p>
            </div>

            <button
              type="button"
              onClick={() => document.getElementById('document-upload')?.click()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Select File
            </button>
          </div>
        </div>
      )}
    </div>
  );
};