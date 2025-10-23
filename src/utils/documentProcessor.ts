export const extractTextFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

export const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

export const extractKeyPoints = (text: string, numPoints: number = 5): string[] => {
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  const scoredSentences = sentences.map(sentence => {
    const words = sentence.toLowerCase().split(/\s+/);
    const importanceWords = ['important', 'significant', 'key', 'critical', 'essential', 'main', 'primary', 'major'];
    const score = words.filter(word => importanceWords.some(imp => word.includes(imp))).length;
    return { sentence, score: score + (words.length > 10 ? 1 : 0) };
  });

  scoredSentences.sort((a, b) => b.score - a.score);

  return scoredSentences
    .slice(0, numPoints)
    .map(item => item.sentence)
    .filter(s => s.length > 0);
};

export const generateSimpleSummary = (text: string, maxLength: number = 500): string => {
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  if (sentences.length === 0) return text.substring(0, maxLength);

  let summary = '';
  const targetLength = Math.min(maxLength, text.length * 0.3);

  for (const sentence of sentences) {
    if (summary.length + sentence.length <= targetLength) {
      summary += sentence + '. ';
    }
    if (summary.length >= targetLength * 0.8) break;
  }

  return summary.trim() || sentences[0];
};
