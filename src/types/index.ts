export interface Document {
  id: string;
  title: string;
  content: string;
  fileType: string;
  fileSize: number;
  wordCount: number;
  createdAt: Date;
}

export interface Summary {
  id: string;
  documentId: string;
  summaryText: string;
  keyPoints: string[];
  sentimentScore: number;
  sentimentLabel: 'positive' | 'negative' | 'neutral';
  toneAnalysis: {
    emotions: { [key: string]: number };
    confidence: number;
  };
  compressionRatio: number;
  createdAt: Date;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'analyzing' | 'complete' | 'error';
}
