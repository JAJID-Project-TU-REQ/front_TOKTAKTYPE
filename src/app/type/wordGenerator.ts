
export async function generateWords(seed: number = 1, wordCount: number = 300): Promise<string> {
  const seededRandom = function(seed: number): () => number {
    let state: number = seed;
    return function(): number {
      state = (state * 1664525 + 1013904223) % 2147483647;
      return state / 2147483647;
    };
  };
  
  const random = seededRandom(seed);
  
  try {
  const response = await fetch('/words.json');
    if (!response.ok) {
      throw new Error('Failed to fetch words');
    }
    
    const wordList: string[] = await response.json();

    const selectedWords: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      const randomIndex = Math.floor(random() * wordList.length);
      selectedWords.push(wordList[randomIndex]);
    }
    
    return selectedWords.join(' ');
  } catch (error) {
    console.error('Error generating words:', error);
    return "Error loading words. Please check if the words.json file exists and is properly formatted.";
  }
}