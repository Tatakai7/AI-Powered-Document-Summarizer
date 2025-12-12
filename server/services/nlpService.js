const use = require("@tensorflow-models/universal-sentence-encoder")
const tf = require("@tensorflow/tfjs")

let model = null

// Load the Universal Sentence Encoder model
const loadModel = async () => {
  if (!model) {
    console.log("Loading Universal Sentence Encoder model...")
    model = await use.load()
    console.log("Model loaded successfully")
  }
  return model
}

// Generate AI-powered summary using TensorFlow.js
const generateAISummary = async (text) => {
  try {
    await loadModel()

    // Split text into sentences
    const sentences = text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20)

    if (sentences.length === 0) return text.substring(0, 500)
    if (sentences.length <= 3) return sentences.join(". ") + "."

    // Generate embeddings for all sentences
    const embeddings = await model.embed(sentences)
    const embeddingsArray = await embeddings.array()

    // Calculate average embedding (document centroid)
    const avgEmbedding = embeddingsArray
      .reduce((acc, curr) => {
        return acc.map((val, idx) => val + curr[idx])
      }, new Array(embeddingsArray[0].length).fill(0))
      .map((val) => val / embeddingsArray.length)

    // Calculate similarity scores for each sentence
    const similarities = embeddingsArray.map((embedding) => {
      return cosineSimilarity(embedding, avgEmbedding)
    })

    // Rank sentences by similarity score
    const sentenceScores = sentences.map((sentence, idx) => ({
      sentence,
      score: similarities[idx],
      originalIndex: idx,
    }))

    sentenceScores.sort((a, b) => b.score - a.score)

    // Select top sentences (30% of total, minimum 3)
    const numSentences = Math.max(3, Math.ceil(sentences.length * 0.3))
    const topSentences = sentenceScores.slice(0, numSentences)

    // Restore original order
    topSentences.sort((a, b) => a.originalIndex - b.originalIndex)

    // Clean up tensors
    embeddings.dispose()

    return topSentences.map((item) => item.sentence).join(". ") + "."
  } catch (error) {
    console.error("Error generating AI summary:", error)
    throw new Error("Failed to generate AI summary")
  }
}

// Calculate cosine similarity between two vectors
const cosineSimilarity = (a, b) => {
  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Analyze sentiment and tone of text
const analyzeSentiment = (text) => {
  const positiveWords = [
    "good",
    "great",
    "excellent",
    "amazing",
    "wonderful",
    "fantastic",
    "love",
    "best",
    "happy",
    "joy",
    "success",
    "perfect",
    "beautiful",
    "brilliant",
    "outstanding",
    "impressive",
    "positive",
    "benefit",
    "advantage",
    "effective",
    "superior",
    "exceptional",
    "remarkable",
    "superb",
    "delightful",
  ]

  const negativeWords = [
    "bad",
    "terrible",
    "awful",
    "horrible",
    "worst",
    "hate",
    "poor",
    "sad",
    "angry",
    "fail",
    "failure",
    "problem",
    "issue",
    "difficult",
    "negative",
    "disadvantage",
    "weakness",
    "concern",
    "risk",
    "threat",
    "inferior",
    "disappointing",
    "inadequate",
    "unsatisfactory",
  ]

  const emotionWords = {
    joy: ["happy", "joy", "excited", "delighted", "pleased", "cheerful", "thrilled", "ecstatic"],
    sadness: ["sad", "unhappy", "depressed", "disappointed", "sorrowful", "melancholy", "gloomy"],
    anger: ["angry", "furious", "irritated", "annoyed", "outraged", "frustrated", "mad"],
    fear: ["afraid", "scared", "worried", "anxious", "nervous", "terrified", "frightened"],
    trust: ["trust", "reliable", "confident", "secure", "certain", "dependable", "faithful"],
  }

  const words = text.toLowerCase().split(/\s+/)
  const totalWords = words.length

  let positiveCount = 0
  let negativeCount = 0

  const emotionScores = {
    joy: 0,
    sadness: 0,
    anger: 0,
    fear: 0,
    trust: 0,
  }

  // Count sentiment and emotion words
  words.forEach((word) => {
    if (positiveWords.some((pw) => word.includes(pw))) positiveCount++
    if (negativeWords.some((nw) => word.includes(nw))) negativeCount++

    Object.entries(emotionWords).forEach(([emotion, keywords]) => {
      if (keywords.some((kw) => word.includes(kw))) {
        emotionScores[emotion]++
      }
    })
  })

  // Calculate sentiment score (-1 to 1)
  const score = ((positiveCount - negativeCount) / Math.max(totalWords, 1)) * 10
  const normalizedScore = Math.max(-1, Math.min(1, score))

  // Determine sentiment label
  let label
  if (normalizedScore > 0.1) label = "positive"
  else if (normalizedScore < -0.1) label = "negative"
  else label = "neutral"

  // Calculate confidence based on emotion detection
  const maxEmotion = Math.max(...Object.values(emotionScores))
  const confidence = maxEmotion > 0 ? Math.min((maxEmotion / totalWords) * 10, 1) : 0.5

  return {
    score: normalizedScore,
    label,
    toneAnalysis: {
      emotions: emotionScores,
      confidence,
    },
  }
}

// Extract key points from text
const extractKeyPoints = (text) => {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30)

  if (sentences.length === 0) return []

  // Simple heuristic: select sentences with important keywords
  const importantKeywords = [
    "important",
    "significant",
    "key",
    "main",
    "primary",
    "essential",
    "critical",
    "crucial",
    "fundamental",
    "major",
    "notable",
    "remarkable",
    "conclusion",
    "result",
    "finding",
    "therefore",
    "consequently",
    "thus",
    "hence",
  ]

  const keyPoints = sentences
    .map((sentence) => {
      const lowerSentence = sentence.toLowerCase()
      const score = importantKeywords.reduce((acc, keyword) => {
        return acc + (lowerSentence.includes(keyword) ? 1 : 0)
      }, 0)
      return { sentence, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.sentence)

  // If no key points found, return first few sentences
  if (keyPoints.length === 0) {
    return sentences.slice(0, Math.min(3, sentences.length))
  }

  return keyPoints
}

// Count words in text
const countWords = (text) => {
  return text.trim().split(/\s+/).length
}

module.exports = {
  loadModel,
  generateAISummary,
  analyzeSentiment,
  extractKeyPoints,
  countWords,
}
