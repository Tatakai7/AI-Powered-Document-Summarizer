const API_URL = (() => {
  if (typeof window !== "undefined") {
    if ((window as any).ENV?.API_URL) {
      return (window as any).ENV.API_URL;
    }
    
    if (import.meta.env?.VITE_API_URL) {
      return import.meta.env.VITE_API_URL as string;
    }
    
    if (import.meta.env?.DEV) {
      return '/api';
    }
    
    return '/api';
  }
  
  return "http://localhost:3001/api";
})();

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

async function fetchWithErrorHandling(url: string, options?: RequestInit) {
  try {
    console.log(`API Call: ${url}`); 
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      credentials: 'include',
    })

    console.log(`Response status: ${response.status}`); 

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error details: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Fetch error details:', error);
    
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(`Unable to connect to backend server. Please ensure the backend is running and accessible at ${API_URL}. Original error: ${error.message}`)
    }
    throw error
  }
}

export const apiService = {
  async getDocuments() {
    const result: ApiResponse<any[]> = await fetchWithErrorHandling(`${API_URL}/documents`)

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch documents")
    }

    return result.data || []
  },

  async getDocument(id: string) {
    const result: ApiResponse<any> = await fetchWithErrorHandling(`${API_URL}/documents/${id}`)

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch document")
    }

    return result.data
  },

  async createDocument(documentData: {
    title: string
    content: string
    file_type: string
    file_size: number
    word_count: number
  }) {
    const result: ApiResponse<any> = await fetchWithErrorHandling(`${API_URL}/documents`, {
      method: "POST",
      body: JSON.stringify(documentData),
    })

    if (!result.success) {
      throw new Error(result.error || "Failed to create document")
    }

    return result.data
  },

  async deleteDocument(id: string) {
    const result: ApiResponse<any> = await fetchWithErrorHandling(`${API_URL}/documents/${id}`, {
      method: "DELETE",
    })

    if (!result.success) {
      throw new Error(result.error || "Failed to delete document")
    }

    return result
  },

  async getSummaries() {
    const result: ApiResponse<any[]> = await fetchWithErrorHandling(`${API_URL}/summaries`)

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch summaries")
    }

    return result.data || []
  },

  async getSummary(id: string) {
    const result: ApiResponse<any> = await fetchWithErrorHandling(`${API_URL}/summaries/${id}`)

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch summary")
    }

    return result.data
  },

  async createSummary(summaryData: {
    document_id: string
    summary_text: string
    key_points: string[]
    sentiment_score: number
    sentiment_label: "positive" | "negative" | "neutral"
    tone_analysis: {
      emotions: { [key: string]: number }
      confidence: number
    }
    compression_ratio: number
  }) {
    const result: ApiResponse<any> = await fetchWithErrorHandling(`${API_URL}/summaries`, {
      method: "POST",
      body: JSON.stringify(summaryData),
    })

    if (!result.success) {
      throw new Error(result.error || "Failed to create summary")
    }

    return result.data
  },

  async markSummaryExported(id: string) {
    const result: ApiResponse<any> = await fetchWithErrorHandling(`${API_URL}/summaries/${id}/exported`, {
      method: "PATCH",
    })

    if (!result.success) {
      throw new Error(result.error || "Failed to update summary")
    }

    return result.data
  },

  async deleteSummary(id: string) {
    const result: ApiResponse<any> = await fetchWithErrorHandling(`${API_URL}/summaries/${id}`, {
      method: "DELETE",
    })

    if (!result.success) {
      throw new Error(result.error || "Failed to delete summary")
    }

    return result
  },
}