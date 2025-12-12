import React from 'react';
import { Loader2, Brain } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Processing your document...'
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Brain className="w-16 h-16 text-blue-600" />
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin absolute -bottom-1 -right-1" />
          </div>

          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              AI Analysis in Progress
            </h3>
            <p className="text-gray-600">
              {message}
            </p>
          </div>

          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full animate-pulse" />
          </div>

          <p className="text-sm text-gray-500">
            This may take a few moments
          </p>
        </div>
      </div>
    </div>
  );
};
