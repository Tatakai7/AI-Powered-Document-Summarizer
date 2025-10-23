"use client"

import { useState, useEffect } from "react"
import { Brain, FileText, TrendingUp, AlertCircle } from "lucide-react"
import { DocumentUploader } from "../src/components/DocumentUploader"
import { SummaryCard } from "../src/components/SummaryCard"
import { LoadingOverlay } from "../src/components/LoadingOverlay"
import { generateAISummary, analyzeSentiment } from "../src/services/aiService"
import { exportSummaryToPDF } from "../src/services/pdfService"
import { extractKeyPoints, countWords } from "../src/utils/documentProcessor"
import { apiService } from "../src/services/apiService"
import type { Document, Summary } from "../src/types"

export default function Page() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"upload" | "summaries">("upload")
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setConnectionError(null)
      const [docsData, summariesData] = await Promise.all([apiService.getDocuments(), apiService.getSummaries()])

      const formattedDocs = docsData.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        fileType: doc.file_type,
        fileSize: doc.file_size,
        wordCount: doc.word_count,
        createdAt: new Date(doc.created_at),
      }))

      const formattedSummaries = summariesData.map((sum: any) => ({
        id: sum.id,
        documentId: sum.document_id,
        summaryText: sum.summary_text,
        keyPoints: sum.key_points,
        sentimentScore: sum.sentiment_score,
        sentimentLabel: sum.sentiment_label,
        toneAnalysis: sum.tone_analysis,
        compressionRatio: sum.compression_ratio,
        createdAt: new Date(sum.created_at),
      }))

      setDocuments(formattedDocs)
      setSummaries(formattedSummaries)
    } catch (error) {
      console.error("Error loading data:", error)
      if (error instanceof Error) {
        setConnectionError(error.message)
      } else {
        setConnectionError("Failed to connect to the backend server")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadComplete = async (file: File, content: string) => {
    setIsProcessing(true)

    try {
      const wordCount = countWords(content)

      const createdDoc = await apiService.createDocument({
        title: file.name,
        content,
        file_type: file.type || "text/plain",
        file_size: file.size,
        word_count: wordCount,
      })

      const newDocument: Document = {
        id: createdDoc.id,
        title: createdDoc.title,
        content: createdDoc.content,
        fileType: createdDoc.file_type,
        fileSize: createdDoc.file_size,
        wordCount: createdDoc.word_count,
        createdAt: new Date(createdDoc.created_at),
      }

      setDocuments((prev) => [newDocument, ...prev])

      const summaryText = await generateAISummary(content)
      const keyPoints = extractKeyPoints(content)
      const sentimentResult = analyzeSentiment(content)

      const compressionRatio = summaryText.length / content.length

      const createdSummary = await apiService.createSummary({
        document_id: createdDoc.id,
        summary_text: summaryText,
        key_points: keyPoints,
        sentiment_score: sentimentResult.score,
        sentiment_label: sentimentResult.label,
        tone_analysis: sentimentResult.toneAnalysis,
        compression_ratio: compressionRatio,
      })

      const newSummary: Summary = {
        id: createdSummary.id,
        documentId: createdSummary.document_id,
        summaryText: createdSummary.summary_text,
        keyPoints: createdSummary.key_points,
        sentimentScore: createdSummary.sentiment_score,
        sentimentLabel: createdSummary.sentiment_label,
        toneAnalysis: createdSummary.tone_analysis,
        compressionRatio: createdSummary.compression_ratio,
        createdAt: new Date(createdSummary.created_at),
      }

      setSummaries((prev) => [newSummary, ...prev])
      setActiveTab("summaries")
    } catch (error) {
      console.error("Error processing document:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to process document"
      alert(errorMessage + "\n\nPlease ensure the backend server is running.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExport = async (summary: Summary, document: Document) => {
    try {
      exportSummaryToPDF(summary.summaryText, document.title, document.content)
      await apiService.markSummaryExported(summary.id)
    } catch (error) {
      console.error("Error exporting summary:", error)
    }
  }

  const handleDelete = async (summaryId: string) => {
    if (confirm("Are you sure you want to delete this summary?")) {
      try {
        await apiService.deleteSummary(summaryId)
        setSummaries((prev) => prev.filter((s) => s.id !== summaryId))
      } catch (error) {
        console.error("Error deleting summary:", error)
        alert("Failed to delete summary. Please try again.")
      }
    }
  }

  const stats = {
    totalDocuments: documents.length,
    totalSummaries: summaries.length,
    avgCompression:
      summaries.length > 0
        ? ((summaries.reduce((acc, s) => acc + s.compressionRatio, 0) / summaries.length) * 100).toFixed(1)
        : 0,
  }

  if (isLoading) {
    return <LoadingOverlay message="Loading your documents..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {isProcessing && <LoadingOverlay message="Analyzing document with AI..." />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {connectionError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Backend Connection Error</h3>
              <p className="text-red-800 text-sm mb-3">{connectionError}</p>
              <div className="bg-red-100 rounded-lg p-3 text-sm text-red-900">
                <p className="font-medium mb-2">To fix this issue:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    Navigate to the <code className="bg-red-200 px-1 rounded">backend</code> directory
                  </li>
                  <li>
                    Run <code className="bg-red-200 px-1 rounded">npm install</code> to install dependencies
                  </li>
                  <li>
                    Create a <code className="bg-red-200 px-1 rounded">.env</code> file with your MongoDB connection
                  </li>
                  <li>
                    Start the server with <code className="bg-red-200 px-1 rounded">npm run dev</code>
                  </li>
                </ol>
              </div>
              <button
                onClick={loadData}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">AI Document Summarizer</h1>
              <p className="text-gray-600 mt-1">Intelligent document analysis powered by TensorFlow.js</p>
            </div>
          </div>

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
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-md border border-gray-200 inline-flex">
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-6 py-2.5 rounded-md font-medium transition-all ${
                activeTab === "upload" ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Upload Document
            </button>
            <button
              onClick={() => setActiveTab("summaries")}
              className={`px-6 py-2.5 rounded-md font-medium transition-all ${
                activeTab === "summaries" ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              View Summaries ({summaries.length})
            </button>
          </div>
        </div>

        <main>
          {activeTab === "upload" && (
            <div className="max-w-3xl mx-auto">
              <DocumentUploader onUploadComplete={handleUploadComplete} />

              {summaries.length === 0 && (
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

          {activeTab === "summaries" && (
            <div>
              {summaries.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No summaries yet</h3>
                  <p className="text-gray-600 mb-6">Upload a document to generate your first AI-powered summary</p>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Upload Document
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {summaries.map((summary) => {
                    const document = documents.find((d) => d.id === summary.documentId)
                    if (!document) return null

                    return (
                      <SummaryCard
                        key={summary.id}
                        summary={summary}
                        document={document}
                        onExport={handleExport}
                        onDelete={handleDelete}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}