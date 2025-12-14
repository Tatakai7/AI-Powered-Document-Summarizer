import { useState, useEffect, lazy, Suspense } from 'react';
import { Brain, FileText, TrendingUp, AlertCircle } from 'lucide-react';
const DocumentUploader = lazy(() => import('../src/components/DocumentUploader').then(module => ({ default: module.DocumentUploader })));
const SummaryCard = lazy(() => import('../src/components/SummaryCard').then(module => ({ default: module.SummaryCard })));
import { LoadingOverlay } from '../src/components/LoadingOverlay';
import { generateAISummary, analyzeSentiment } from '../src/services/aiService';
import { exportSummaryToPDF } from '../src/services/pdfService';
import { extractKeyPoints, countWords } from '../src/utils/documentProcessor';
import { apiService } from '../src/services/apiService';
import type { Document, Summary } from '../src/types';

// Helper function to extract error message from unknown error type
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === 'string') {
    return error;
  } else {
    return 'An unknown error occurred';
  }
};

function App() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'summaries'>('upload');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [docsData, summariesData] = await Promise.all([
        apiService.getDocuments(),
        apiService.getSummaries()
      ]);

      const formattedDocs = docsData.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        fileType: doc.file_type,
        fileSize: doc.file_size,
        wordCount: doc.word_count,
        createdAt: new Date(doc.created_at)
      }));

      const formattedSummaries = summariesData.map((sum: any) => ({
        id: sum.id,
        documentId: sum.document_id.id, // Use the populated document's id
        summaryText: sum.summary_text,
        keyPoints: sum.key_points,
        sentimentScore: sum.sentiment_score,
        sentimentLabel: sum.sentiment_label,
        toneAnalysis: sum.tone_analysis,
        compressionRatio: sum.compression_ratio,
        createdAt: new Date(sum.created_at)
      }));

      setDocuments(formattedDocs);
      setSummaries(formattedSummaries);
    } catch (error: unknown) {
      console.error('Error loading data:', error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      
      // Show user-friendly error message
      if (errorMessage.includes('Unable to connect to the backend server')) {
        setError('Backend server is not running. Please start the backend server on port 3001 and refresh the page.');
      } else {
        setError('Failed to load data. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = async (file: File, content: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const wordCount = countWords(content);

      const createdDoc = await apiService.createDocument({
        title: file.name,
        content,
        file_type: file.type || 'text/plain',
        file_size: file.size,
        word_count: wordCount
      });

      const newDocument: Document = {
        id: createdDoc.id,
        title: createdDoc.title,
        content: createdDoc.content,
        fileType: createdDoc.file_type,
        fileSize: createdDoc.file_size,
        wordCount: createdDoc.word_count,
        createdAt: new Date(createdDoc.created_at)
      };

      setDocuments(prev => [newDocument, ...prev]);

      const summaryText = await generateAISummary(content);
      if (!summaryText.trim()) {
        throw new Error('Unable to generate a meaningful summary from the document. Please ensure the document contains sufficient text content.');
      }

      const keyPoints = extractKeyPoints(content);
      const sentimentResult = analyzeSentiment(content);

      const compressionRatio = Math.min(summaryText.length / content.length, 1);

      const createdSummary = await apiService.createSummary({
        document_id: createdDoc.id,
        summary_text: summaryText,
        key_points: keyPoints,
        sentiment_score: sentimentResult.score,
        sentiment_label: sentimentResult.label,
        tone_analysis: sentimentResult.toneAnalysis,
        compression_ratio: compressionRatio
      });

      const newSummary: Summary = {
        id: createdSummary.id,
        documentId: createdSummary.document_id,
        summaryText: createdSummary.summary_text,
        keyPoints: createdSummary.key_points,
        sentimentScore: createdSummary.sentiment_score,
        sentimentLabel: createdSummary.sentiment_label,
        toneAnalysis: createdSummary.tone_analysis,
        compressionRatio: createdSummary.compression_ratio,
        createdAt: new Date(createdSummary.created_at)
      };

      setSummaries(prev => [newSummary, ...prev]);
      setActiveTab('summaries');
    } catch (error: unknown) {
      console.error('Error processing document:', error);
      setError('Failed to process document. Please ensure the backend server is running and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async (summary: Summary, document: Document) => {
    try {
      // Pass the specific string properties needed for PDF generation
      exportSummaryToPDF(summary.summaryText, document.title, document.content);
      await apiService.markSummaryExported(summary.id);
    } catch (error: unknown) {
      console.error('Error exporting summary:', error);
      setError('Failed to export summary. Please try again.');
    }
  };

  const handleDelete = async (summaryId: string) => {
    if (confirm('Are you sure you want to delete this summary?')) {
      try {
        await apiService.deleteSummary(summaryId);
        setSummaries(prev => {
          const newSummaries = prev.filter(s => s.id !== summaryId);
          // Check if there are any remaining summaries for the deleted summary's document
          const deletedSummary = prev.find(s => s.id === summaryId);
          if (deletedSummary) {
            const remainingForDoc = newSummaries.filter(s => s.documentId === deletedSummary.documentId);
            if (remainingForDoc.length === 0) {
              // Remove the document
              setDocuments(prevDocs => prevDocs.filter(d => d.id !== deletedSummary.documentId));
            }
          }
          return newSummaries;
        });
      } catch (error: unknown) {
        console.error('Error deleting summary:', error);
        setError('Failed to delete summary. Please try again.');
      }
    }
  };

  const stats = {
    totalDocuments: documents.length,
    totalSummaries: summaries.length,
    avgCompression: summaries.length > 0
      ? (summaries.reduce((acc, s) => acc + s.compressionRatio, 0) / summaries.length * 100).toFixed(1)
      : '0'
  };

  if (isLoading) {
    return <LoadingOverlay message="Loading your documents..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {isProcessing && <LoadingOverlay message="Analyzing document with AI..." />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                AI Document Summarizer
              </h1>
              <p className="text-gray-600 mt-1">
                Intelligent document analysis powered by TensorFlow.js
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">Connection Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <button
                  onClick={loadData}
                  className="mt-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Documents</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalDocuments}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Summaries</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalSummaries}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Brain className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Avg Compression</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.avgCompression}%</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="mb-6">
          <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-md border border-gray-200 inline-flex">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-2.5 rounded-md font-medium transition-all ${
                activeTab === 'upload'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upload Document
            </button>
            <button
              onClick={() => setActiveTab('summaries')}
              className={`px-6 py-2.5 rounded-md font-medium transition-all ${
                activeTab === 'summaries'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              View Summaries ({summaries.length})
            </button>
          </div>
        </div>

        <main>
          {activeTab === 'upload' && (
            <div className="max-w-3xl mx-auto">
              <Suspense fallback={<LoadingOverlay message="Loading upload component..." />}>
                <DocumentUploader onUploadComplete={handleUploadComplete} />
              </Suspense>

              {summaries.length === 0 && !error && (
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Getting Started</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start">
                      <span className="mr-2">1.</span>
                      <span>Upload a text document using the area above</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">2.</span>
                      <span>AI will analyze the document and extract key points</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">3.</span>
                      <span>View sentiment analysis and tone detection</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">4.</span>
                      <span>Export summaries to PDF for sharing</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'summaries' && (
            <div>
              {summaries.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No summaries yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Upload a document to generate your first AI-powered summary
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Upload Document
                  </button>
                </div>
              ) : (
                <Suspense fallback={<LoadingOverlay message="Loading summaries..." />}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {summaries.map(summary => {
                      const document = documents.find(d => d.id === summary.documentId);
                      if (!document) return null;

                      return (
                        <SummaryCard
                          key={summary.id}
                          summary={summary}
                          document={document}
                          onExport={handleExport}
                          onDelete={handleDelete}
                        />
                      );
                    })}
                  </div>
                </Suspense>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;