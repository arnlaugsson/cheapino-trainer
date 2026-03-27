const homeRowWords: string[] = [
  "ash", "add", "ads", "aha", "ahs", "all", "ask",
  "dad", "dads", "dash", "fad", "fads", "flag", "flags",
  "gal", "gals", "gas", "glad", "glass", "had", "half",
  "hall", "halls", "has", "jag", "lad", "lads", "lag",
  "lags", "lash", "lass", "sad", "sag", "saga", "shall",
  "shag", "slag", "slash", "flash", "flask", "gash", "hash",
  "salad", "alas", "fall", "falls", "alga",
];

const commonWords: string[] = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
  "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
  "but", "his", "by", "from", "they", "we", "her", "she", "or", "an",
  "will", "my", "one", "all", "would", "there", "their", "what", "so", "up",
  "out", "if", "about", "who", "get", "which", "go", "me", "when", "make",
  "can", "like", "time", "no", "just", "him", "know", "take", "people", "into",
  "year", "your", "good", "some", "could", "them", "see", "other", "than", "then",
  "now", "look", "only", "come", "its", "over", "think", "also", "back", "after",
  "use", "two", "how", "our", "work", "first", "well", "way", "even", "new",
  "want", "because", "any", "these", "give", "day", "most", "us", "great", "between",
  "need", "large", "under", "never", "right", "home", "still", "hand", "high", "last",
  "long", "small", "own", "life", "left", "world", "head", "help", "through", "much",
  "before", "line", "turn", "move", "thing", "place", "man", "old", "every", "point",
  "where", "part", "name", "each", "tell", "next", "state", "begin", "while", "found",
  "said", "keep", "let", "might", "say", "start", "three", "show", "house", "both",
  "end", "run", "read", "open", "same", "change", "write", "play", "must", "close",
  "number", "light", "group", "side", "night", "real", "city", "water", "call", "set",
];

const numberWords: string[] = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "0",
  "10", "20", "50", "100", "200", "500", "1000",
  "3.14", "2.5", "0.99", "42", "256", "1024", "8080",
  "2026", "1999", "2000", "365", "24", "60", "12",
];

const symbolWords: string[] = [
  "()", "[]", "{}", "<>",
  "a + b", "x - y", "n * 2", "a / b",
  "x = 5", "a != b", "x >= 10", "y <= 0",
  "!true", "@user", "#tag", "$price",
  "a | b", "a & b", "a ^ b", "~mask",
  "path/to/file", "key: value", "a => b",
  "[1, 2, 3]", "{a: 1}", "(x + y) * z",
];

const mixedWords: string[] = [
  ...commonWords.slice(0, 50),
  ...numberWords,
  ...symbolWords,
];

export function getWordsForStage(stageId: number): string[] {
  switch (stageId) {
    case 0:
      return homeRowWords;
    case 1:
    case 2:
      return commonWords;
    case 3:
      return numberWords;
    case 4:
      return symbolWords;
    case 5:
      return [];
    case 6:
      return mixedWords;
    default:
      return commonWords;
  }
}
