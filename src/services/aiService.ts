import * as use from '@tensorflow-models/universal-sentence-encoder';

let model: use.UniversalSentenceEncoder | null = null;

export const loadModel = async (): Promise<void> => {
  if (!model) {
    model = await use.load();
  }
};

export const generateAISummary = async (text: string): Promise<string> => {
  await loadModel();

  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  if (sentences.length === 0) return text.substring(0, 500);
  if (sentences.length <= 3) return sentences.join('. ') + '.';

  const embeddings = await model!.embed(sentences);
  const embeddingsArray = await embeddings.array();

  const avgEmbedding = embeddingsArray.reduce((acc, curr) => {
    return acc.map((val, idx) => val + curr[idx]);
  }, new Array(embeddingsArray[0].length).fill(0)).map(val => val / embeddingsArray.length);

  const similarities = embeddingsArray.map(embedding => {
    return cosineSimilarity(embedding, avgEmbedding);
  });

  const sentenceScores = sentences.map((sentence, idx) => ({
    sentence,
    score: similarities[idx]
  }));

  sentenceScores.sort((a, b) => b.score - a.score);

  const numSentences = Math.max(3, Math.ceil(sentences.length * 0.3));
  const topSentences = sentenceScores.slice(0, numSentences);

  const originalOrder = topSentences.sort((a, b) => {
    return sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence);
  });

  embeddings.dispose();

  return originalOrder.map(item => item.sentence).join('. ') + '.';
};

const cosineSimilarity = (a: number[], b: number[]): number => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const analyzeSentiment = (text: string): {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
  toneAnalysis: { emotions: { [key: string]: number }; confidence: number };
} => {
  // ... keep your existing analyzeSentiment implementation
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love',
    'best', 'happy', 'joy', 'success', 'perfect', 'beautiful', 'brilliant',
    'outstanding', 'impressive', 'positive', 'benefit', 'advantage', 'effective'
  ];

  const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'poor', 'sad',
    'angry', 'fail', 'failure', 'problem', 'issue', 'difficult', 'negative',
    'disadvantage', 'weakness', 'concern', 'risk', 'threat'
  ];

  const emotionWords = {
    joy: ['happy', 'joy', 'excited', 'delighted', 'pleased', 'cheerful'],
    sadness: ['sad', 'unhappy', 'depressed', 'disappointed', 'sorrowful'],
    anger: ['angry', 'furious', 'irritated', 'annoyed', 'outraged'],
    fear: ['afraid', 'scared', 'worried', 'anxious', 'nervous'],
    trust: ['trust', 'reliable', 'confident', 'secure', 'certain']
  };

  const words = text.toLowerCase().split(/\s+/);
  const totalWords = words.length;

  let positiveCount = 0;
  let negativeCount = 0;

  const emotionScores: { [key: string]: number } = {
    joy: 0,
    sadness: 0,
    anger: 0,
    fear: 0,
    trust: 0
  };

  words.forEach(word => {
    if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
    if (negativeWords.some(nw => word.includes(nw))) negativeCount++;

    Object.entries(emotionWords).forEach(([emotion, keywords]) => {
      if (keywords.some(kw => word.includes(kw))) {
        emotionScores[emotion]++;
      }
    });
  });

  const score = ((positiveCount - negativeCount) / Math.max(totalWords, 1)) * 10;
  const normalizedScore = Math.max(-1, Math.min(1, score));

  let label: 'positive' | 'negative' | 'neutral';
  if (normalizedScore > 0.1) label = 'positive';
  else if (normalizedScore < -0.1) label = 'negative';
  else label = 'neutral';

  const maxEmotion = Math.max(...Object.values(emotionScores));
  const confidence = maxEmotion > 0 ? Math.min(maxEmotion / totalWords * 10, 1) : 0.5;

  return {
    score: normalizedScore,
    label,
    toneAnalysis: {
      emotions: emotionScores,
      confidence
    }
  };
};