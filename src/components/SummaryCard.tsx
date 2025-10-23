import React from 'react';
import { FileText, Download, Trash2, Calendar, BarChart3 } from 'lucide-react';
import type { Summary, Document } from '../types';

interface SummaryCardProps {
  summary: Summary;
  document: Document;
  onExport: (summary: Summary, document: Document) => void;
  onDelete: (summaryId: string) => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  summary,
  document,
  onExport,
  onDelete
}) => {
  const getSentimentColor = (label: string) => {
    switch (label) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getSentimentBarColor = (label: string) => {
    switch (label) {
      case 'positive':
        return 'bg-green-500';
      case 'negative':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getSentimentWidth = (score: number) => {
  const width = Math.abs(score) * 50 + 50;
  if (width <= 25) return 'w-1/4';
  if (width <= 50) return 'w-1/2';
  if (width <= 75) return 'w-3/4';
  return 'w-full';
};

  const topEmotion = Object.entries(summary.toneAnalysis.emotions).reduce(
    (max, [emotion, score]) => (score > max.score ? { emotion, score } : max),
    { emotion: 'neutral', score: 0 }
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{document.title}</h3>
              <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(summary.createdAt).toLocaleDateString()}
                </span>
                <span>{document.wordCount} words</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onExport(summary, document)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Export to PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(summary.id)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Summary</h4>
          <p className="text-gray-700 leading-relaxed">{summary.summaryText}</p>
        </div>

        {summary.keyPoints.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Points</h4>
            <ul className="space-y-2">
              {summary.keyPoints.map((point, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Sentiment</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(summary.sentimentLabel)}`}>
                  {summary.sentimentLabel}
                </span>
                <span className="text-sm text-gray-500">
                  {summary.sentimentScore > 0 ? '+' : ''}{summary.sentimentScore.toFixed(2)}
                </span>
              </div>
              <div className="mt-2 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                   className={`h-full ${getSentimentBarColor(summary.sentimentLabel)} transition-all ${getSentimentWidth(summary.sentimentScore)}`}
                 />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-700">Dominant Tone</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-600 capitalize">
                  {topEmotion.emotion}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Compression: {(summary.compressionRatio * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
