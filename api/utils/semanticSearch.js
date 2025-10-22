const { ragSystem ,extractKeywordsFromMessage} = require("./ragSystem");
// const BM25 = require('bm25');

const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure your API key is set in env
});

class SemanticSearch {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await ragSystem.initialize();
      this.initialized = true;
    }
  }
// 📌 Helper to fetch neighboring chunks on the same page
getNeighborChunks(chunk, allChunks, importantKeywords = []) {
  const neighbors = [];
  const page = chunk.pageNumber || chunk.payload?.pageNumber;
  const index = chunk.chunkIndex || chunk.payload?.chunkIndex;

  const hasKeywordOverlap = (text) => {
    const lower = (text || '').toLowerCase();
    return importantKeywords.some(k => lower.includes(k.toLowerCase()));
  };

  const prev = allChunks.find(c =>
    (c.pageNumber || c.payload?.pageNumber) === page &&
    (c.chunkIndex || c.payload?.chunkIndex) === index - 1
  );
  if (prev && hasKeywordOverlap(prev.payload?.text || prev.text)) {
    neighbors.push(prev);
  }

  const next = allChunks.find(c =>
    (c.pageNumber || c.payload?.pageNumber) === page &&
    (c.chunkIndex || c.payload?.chunkIndex) === index + 1
  );
  if (next && hasKeywordOverlap(next.payload?.text || next.text)) {
    neighbors.push(next);
  }

  return neighbors;
}

  // Enhanced search with context building
  // Enhanced search with context building
// Enhanced search with better keyword fallback and lower thresholds
async searchWithContext(query, userId, conversationId = null, options = {}) {
  await this.initialize();
  const { limit = 20, contextWindow = 20000 } = options;

  console.log(`🔍 Enhanced search for: "${query}"`);
  
 // 👉 First, try to improve query understanding with an LLM
// 👉 First, try to improve query understanding with an LLM
let improvedQuery = query;
let queryIntent = 'general';
try {
  const intentAnalysis = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
  role: 'system',
  content: `Analyze the user query and extract the most relevant search terms for document retrieval. 
  Focus on extracting key entities, technical terms, and important phrases.
  
  For the query, return a JSON object with:
  {
    "keywords": ["keyword1", "keyword2", ...], // 5-10 most important terms including phrases
    "intent": "incident_search|description_request|technical_query|general_question|list_request",
    "focus": "main topic or entity the user is asking about",
    "entities": ["entity1", "entity2"], // specific names, locations, units, modules
    "technical_terms": ["term1", "term2"] // technical or domain-specific terms
  }
  
  Extract compound terms like "Fly Camp", "Unit-", "Module/Area" as single entities.
  Return ONLY valid JSON, no explanations.`
},

      { role: 'user', content: query }
    ],
    temperature: 0,
    max_tokens: 150
  });


let rawContent = intentAnalysis.choices[0].message.content.trim();

// ✅ Remove ```json and ``` if present
rawContent = rawContent.replace(/```json/i, '').replace(/```/g, '').trim();

let parsed = {};
try {
  parsed = JSON.parse(rawContent);
  
 if (parsed.keywords && Array.isArray(parsed.keywords)) {
  // Combine keywords, entities, and technical terms
  const allTerms = [
    ...(parsed.keywords || []),
    ...(parsed.entities || []),
    ...(parsed.technical_terms || [])
  ];
  
  improvedQuery = allTerms.join(' ');
  queryIntent = parsed.intent || 'general';
  
  console.log('✅ Improved query from LLM:', improvedQuery);
  console.log('✅ Detected intent:', queryIntent);
  console.log('✅ Query focus:', parsed.focus || 'general');
  console.log('✅ Extracted entities:', parsed.entities?.join(', ') || 'none');
  console.log('✅ Technical terms:', parsed.technical_terms?.join(', ') || 'none');
}

} catch (err) {
  console.warn('⚠️ Failed to parse LLM output, using raw query:', err.message);
  // Fallback to simple keyword extraction
  const fallbackKeywords = query.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !['what', 'are', 'the', 'how', 'why', 'when', 'where'].includes(word));
  improvedQuery = fallbackKeywords.slice(0, 5).join(' ');
}

} catch (err) {
  console.log('⚠️ LLM preprocessing failed, using raw query:', err.message);
}

// ✅ Now extract key terms as fallback
// ✅ Extract key terms for enhanced search
const keyTerms = this.extractKeyTerms(improvedQuery);
console.log(`🔑 Key terms extracted: ${keyTerms.join(', ')}`);

// ✅ Perform hybrid search (vector + keyword) using RAGSystem
let relevantChunks = await ragSystem.searchRelevantChunks(
  improvedQuery, userId, conversationId, limit * 2 // Get more results for better coverage
);

console.log(`🔄 Received ${relevantChunks.length} hybrid results from RAGSystem`);



// ✅ Rerank by keyword hits to boost relevance
// ✅ Rerank by keyword hits to boost relevance
const importantKeywords = extractKeywordsFromMessage(query);
console.log(`🔑 Important keywords for reranking: ${importantKeywords.join(', ')}`);

if (importantKeywords.length > 0) {
  relevantChunks = relevantChunks.map(c => {
    let hits = 0;
    const text = (c.text || '').toLowerCase();
    const matchedKeywords = [];
    
    for (const keyword of importantKeywords) {
      const keywordLower = keyword.toLowerCase();
      if (text.includes(keywordLower)) {
        hits++;
        matchedKeywords.push(keyword);
      }
    }
    
    return { 
      ...c, 
      score: c.score + hits * 0.15,
      matchedKeywords,
      keywordHits: hits
    };
  }).sort((a, b) => b.score - a.score);
  
  console.log(`✅ Reranked ${relevantChunks.length} chunks by keyword relevance`);
  
  // Debug: Show which chunks matched which keywords
  relevantChunks.slice(0, 5).forEach((chunk, idx) => {
    if (chunk.matchedKeywords && chunk.matchedKeywords.length > 0) {
      console.log(`   ${idx + 1}. Page ${chunk.pageNumber} matched: ${chunk.matchedKeywords.join(', ')}`);
    }
  });
}



// 🔥 Merge in neighboring chunks for richer context
// 🔥 Neighbor chunks are now handled in RAGSystem.searchRelevantChunks
// No need for duplicate neighbor processing here
console.log(`✅ Neighbor chunks already included in RAGSystem results`);


// ✅ Finally, limit results
// ✅ Apply cosine similarity rerank with query embedding
// ✅ Apply final cosine similarity rerank with query embedding
try {
  const queryVec = await ragSystem.generateEmbedding(improvedQuery);
  
  function cosineSim(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
  }

  relevantChunks = relevantChunks.map(c => {
    const chunkVec = c.vector || c.payload?.vector || c.metadata?.vector;
    const cos = chunkVec ? cosineSim(queryVec, chunkVec) : 0;
    return { 
      ...c, 
      score: c.score + cos * 5, // Reduced multiplier for balance
      cosineScore: cos 
    };
  }).sort((a, b) => b.score - a.score);

console.log(`✅ Applied cosine similarity rerank to ${relevantChunks.length} chunks`);

// Log relevant pages and scores for debugging
console.log(`📊 RELEVANT PAGES AND SCORES:`);
relevantChunks.slice(0, 10).forEach((chunk, idx) => {
  console.log(`   ${idx + 1}. Page ${chunk.pageNumber || 'N/A'} - Score: ${(chunk.score || 0).toFixed(2)} - File: ${chunk.fileName || 'Unknown'}`);
});

} catch (error) {
  console.warn('⚠️ Cosine similarity rerank failed:', error.message);
}

// ✅ Keep more results for better context
relevantChunks = relevantChunks.slice(0, 20);
console.log(`✅ Final hybrid+cosine rerank found ${relevantChunks.length} chunks`);



  if (relevantChunks.length === 0) {
    return { hasResults: false, context: "", chunks: [] };
  }

  // Build context from relevant chunks
  // 👉 Filter chunks by strong keyword matches before building context
// ✨ CHANGE HERE – Rerank instead of hard filter
const dynamicKeywords = extractKeywordsFromMessage(query); // reuse helper
if (dynamicKeywords.length > 0) {
  const boosted = [];
  for (const c of relevantChunks) {
    const t = (c.text || '').toLowerCase();
    let hits = 0;
    for (const kw of dynamicKeywords) {
      if (t.includes(kw.toLowerCase())) hits++;
    }
    boosted.push({ ...c, score: c.score + hits * 0.1 });
  }
  boosted.sort((a, b) => b.score - a.score);
  console.log(`✅ Keyword rerank applied on ${boosted.length} chunks`);
  relevantChunks = boosted;
}

// 📌 Extract relevant lines BEFORE slicing down to top 5
 
const relevantLines = this.extractRelevantLines(relevantChunks, importantKeywords);
console.log(`📌 Extracted ${relevantLines.length} relevant lines`);

// Sort by score and take top 5 only
// Instead of 5, allow more chunks:
// Sort by score and keep substantial number of chunks for rich context
relevantChunks = relevantChunks.sort((a,b)=>b.score-a.score).slice(0, 25);
console.log(`📊 Using top ${relevantChunks.length} chunks for context building`);



// ✅ Build base context from top results
// ✅ Build comprehensive context from all relevant results
let context = this.buildContextFromChunks(relevantChunks, contextWindow);

// ✅ Add keyword-relevant lines for additional context
if (relevantLines.length > 0) {
  const uniqueLines = [...new Set(relevantLines)];
  console.log(`✅ Appending ${uniqueLines.length} keyword-relevant lines to context`);
  context += "\n\n[🔎 Additional Keyword Matches]\n" + uniqueLines.join("\n");
}

// ✅ Log final context statistics
console.log(`📊 FINAL CONTEXT STATISTICS:`);
console.log(`   - Total chunks used: ${relevantChunks.length}`);
console.log(`   - Context length: ${context.length.toLocaleString()} characters`);
console.log(`   - Files covered: ${[...new Set(relevantChunks.map(c => c.fileName))].join(', ')}`);
console.log(`   - Page range: ${Math.min(...relevantChunks.map(c => c.pageNumber || 0))} - ${Math.max(...relevantChunks.map(c => c.pageNumber || 0))}`);





  return {
    hasResults: true,
    context,
    chunks: relevantChunks.map(chunk => ({
      ...chunk,
      summary: chunk.summary || "",
      metadata: chunk.metadata,
    })),
    query,
  };
}

// New method to extract key terms
extractKeyTerms(query) {
  const stopWords = new Set(['what', 'is', 'the', 'of', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by']);
  const words = query.toLowerCase().split(/\s+/);
  
  // Extract meaningful terms
  const keyTerms = words.filter(word => 
    word.length > 2 && 
    !stopWords.has(word) &&
    !/^\d+$/.test(word) // Exclude pure numbers
  );
  
  // Also extract phrases (2-3 words)
  const phrases = [];
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = words.slice(i, i + 2).join(' ');
    if (phrase.length > 5 && !stopWords.has(words[i])) {
      phrases.push(phrase);
    }
  }
  
  return [...keyTerms, ...phrases];
}

// Enhanced keyword search method
// Simple BM25 implementation without external lib
 
// Enhanced keyword search method - IMPROVED VERSION
// Enhanced keyword search method - IMPROVED VERSION
// enhancedKeywordSearch(query, allChunks, keyTerms = []) {
//   if (!Array.isArray(allChunks) || allChunks.length === 0) {
//     console.log('⚠️ No chunks provided for keyword search');
//     return [];
//   }

//   console.log(`🔍 Enhanced keyword search on ${allChunks.length} chunks`);
//   console.log(`🔑 Using key terms: ${keyTerms.join(', ')}`);

//   // Extract all search terms (query words + extracted key terms)
//   const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
//   const allTerms = [...new Set([...queryTerms, ...keyTerms.map(t => t.toLowerCase())])];
  
//   console.log(`🎯 Searching for terms: ${allTerms.join(', ')}`);

//   // BM25 parameters
//   const k1 = 1.5;
//   const b = 0.75;
  
//   // Extract text from chunks and normalize
//   const docs = allChunks.map(chunk => {
//     const text = chunk.payload?.text || chunk.text || '';
//     return text.toLowerCase();
//   });

//   // Precompute document lengths
//   const docLengths = docs.map(doc => doc.split(/\s+/).filter(Boolean).length);
//   const avgdl = docLengths.reduce((a, b) => a + b, 0) / (docLengths.length || 1);

//   // Build term frequencies for each document
//   const termFreqs = docs.map(doc => {
//     const words = doc.split(/\s+/).filter(Boolean);
//     const freq = {};
//     for (const word of words) {
//       freq[word] = (freq[word] || 0) + 1;
//     }
//     return freq;
//   });

//   // Compute IDF for each term
//   const N = docs.length;
//   const idf = {};
//   for (const term of allTerms) {
//     let docsContainingTerm = 0;
//     for (const doc of docs) {
//       if (doc.includes(term)) docsContainingTerm++;
//     }
//     // Avoid division by zero and add smoothing
//     idf[term] = Math.log((N - docsContainingTerm + 0.5) / (docsContainingTerm + 0.5) + 1);
//   }

//   // Score each document using BM25
//   const scoredChunks = allChunks.map((chunk, idx) => {
//     const doc = docs[idx];
//     let bm25Score = 0;
//     let keywordHits = 0;
//     let exactMatches = 0;

//     // BM25 scoring
//     for (const term of allTerms) {
//       const termFreq = termFreqs[idx][term] || 0;
//       const docLength = docLengths[idx];
      
//       if (termFreq > 0) {
//         keywordHits++;
        
//         // Check for exact phrase matches (bonus scoring)
//         if (doc.includes(term) && term.length > 3) {
//           exactMatches++;
//         }
        
//         const numerator = termFreq * (k1 + 1);
//         const denominator = termFreq + k1 * (1 - b + b * (docLength / avgdl));
//         bm25Score += idf[term] * (numerator / denominator);
//       }
//     }

//     // Bonus for multiple keyword hits and exact matches
//     const keywordBonus = keywordHits * 0.1;
//     const exactMatchBonus = exactMatches * 0.2;
//     const finalScore = bm25Score + keywordBonus + exactMatchBonus;

//     return {
//       id: chunk.id,
//       score: finalScore,
//       text: chunk.payload?.text || chunk.text,
//       summary: chunk.payload?.summary || chunk.summary,
//       fileName: chunk.payload?.fileName || chunk.fileName,
//       pageNumber: chunk.payload?.pageNumber || chunk.pageNumber,
//       chunkIndex: chunk.payload?.chunkIndex || chunk.chunkIndex,
//       metadata: chunk.payload || chunk.metadata,
//       keywordHits,
//       exactMatches,
//       bm25Score
//     };
//   });

//   // Filter out chunks with zero score and sort by score
//   const filteredChunks = scoredChunks
//     .filter(chunk => chunk.score > 0)
//     .sort((a, b) => b.score - a.score);

//   console.log(`✅ BM25 keyword search found ${filteredChunks.length} relevant chunks`);
  
//   // Log top results for debugging
//   filteredChunks.slice(0, 5).forEach((chunk, idx) => {
//     console.log(`   ${idx + 1}. ${chunk.fileName} (Page ${chunk.pageNumber}) - Score: ${chunk.score.toFixed(3)}, Hits: ${chunk.keywordHits}, Exact: ${chunk.exactMatches}`);
//     console.log(`      Preview: "${chunk.text.substring(0, 100)}..."`);
//   });

//   return filteredChunks.slice(0, 20);
// }



// 🔧 Helper to extract lines containing important keywords
extractRelevantLines(chunks, keywords) {
  const lowerKeywords = keywords.map(k => k.toLowerCase());
  const results = new Set();

  for (const c of chunks) {
    const lines = (c.text || "").split(/\r?\n/);
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (lowerKeywords.some(k => lowerLine.includes(k))) {
        results.add(line.trim());
      }
    }
  }

  return Array.from(results);
}



// Simple fuzzy matching
fuzzyMatch(text, term) {
  const words = text.split(/\s+/);
  return words.some(word => {
    if (word.length < term.length) return false;
    
    let matches = 0;
    for (let i = 0; i < term.length; i++) {
      if (word.includes(term[i])) matches++;
    }
    
    return matches / term.length > 0.7;
  });
}




  // Build context string from chunks
  // Build context string from chunks
 // Build context string from chunks - NO TRUNCATION, let AI decide
buildContextFromChunks(chunks, maxLength = 100000) { // Increased limit significantly
  if (!chunks || chunks.length === 0) {
    console.log('⚠️ No chunks provided for context building');
    return "";
  }

  let context = "";
  let totalChunks = 0;

  // Group chunks by file for better organization
  const chunksByFile = chunks.reduce((acc, chunk) => {
    const fileName = chunk.fileName || 'Unknown File';
    if (!acc[fileName]) {
      acc[fileName] = [];
    }
    acc[fileName].push(chunk);
    return acc;
  }, {});

  console.log(`🔧 Building context from ${chunks.length} chunks across ${Object.keys(chunksByFile).length} files`);

  // Build context with file organization - prioritize by relevance score
  const sortedFiles = Object.entries(chunksByFile).sort(([,a], [,b]) => {
    const avgScoreA = a.reduce((sum, chunk) => sum + (chunk.score || 0), 0) / a.length;
    const avgScoreB = b.reduce((sum, chunk) => sum + (chunk.score || 0), 0) / b.length;
    return avgScoreB - avgScoreA;
  });

  for (const [fileName, fileChunks] of sortedFiles) {
    const fileHeader = `\n=== ${fileName} ===\n`;
    context += fileHeader;

    // Sort chunks by relevance score first, then by page order
    fileChunks.sort((a, b) => {
      // Primary sort: by score (descending)
      const scoreDiff = (b.score || 0) - (a.score || 0);
      if (Math.abs(scoreDiff) > 0.1) return scoreDiff;
      
      // Secondary sort: by page number (ascending)
      const pageA = a.pageNumber || 0;
      const pageB = b.pageNumber || 0;
      if (pageA !== pageB) return pageA - pageB;
      
      // Tertiary sort: by chunk index (ascending)
      const chunkA = a.chunkIndex || 0;
      const chunkB = b.chunkIndex || 0;
      return chunkA - chunkB;
    });

    for (const chunk of fileChunks) {
      const chunkText = `\n[File: ${chunk.fileName} | Page ${chunk.pageNumber || 'N/A'} | Score: ${(chunk.score || 0).toFixed(2)} | Relevance: ${chunk.keywordHits || 0} hits]\n${chunk.text || 'No text available'}\n`;

      context += chunkText;
      totalChunks++;

     console.log(`   ✅ Added chunk from ${fileName}, Page ${chunk.pageNumber || 'N/A'} (${chunkText.length} chars, Score: ${(chunk.score || 0).toFixed(2)}, Keywords: ${chunk.keywordHits || 0})`);
console.log(`      Preview: "${(chunk.text || '').substring(0, 150)}..."`);

    }
  }

  console.log(`🔧 Context built: ${context.length} characters total from ${totalChunks} chunks - NO TRUNCATION`);
  return context.trim();
}



  // Search for specific file content
  async searchInFile(query, userId, fileName, limit = 3) {
    try {
      await this.initialize();

      const allChunks = await ragSystem.searchRelevantChunks(
        query,
        userId,
        null,
        20
      );
      const fileChunks = allChunks
        .filter((chunk) =>
          chunk.fileName.toLowerCase().includes(fileName.toLowerCase())
        )
        .slice(0, limit);

      return {
        hasResults: fileChunks.length > 0,
        chunks: fileChunks,
        fileName,
        context: this.buildContextFromChunks(fileChunks, 1500),
      };
    } catch (error) {
      console.error("❌ File search error:", error);
      return {
        hasResults: false,
        chunks: [],
        error: error.message,
      };
    }
  }

  // Get file summary using RAG
  async getFileSummary(userId, fileName) {
    try {
      await this.initialize();

      // Search for chunks from the specific file
      const chunks = await ragSystem.searchRelevantChunks(
        "summary overview content", // Generic query to get representative chunks
        userId,
        null,
        10
      );

      const fileChunks = chunks.filter(
        (chunk) => chunk.fileName.toLowerCase() === fileName.toLowerCase()
      );

      if (fileChunks.length === 0) {
        return {
          hasResults: false,
          summary: "No content found for this file.",
        };
      }

      // Combine summaries from chunks
      const combinedSummary = fileChunks
        .map((chunk) => chunk.summary)
        .filter((summary) => summary && summary !== "Summary generation failed")
        .join(" ");

      return {
        hasResults: true,
        summary: combinedSummary || "Summary not available.",
        totalChunks: fileChunks.length,
        fileName,
      };
    } catch (error) {
      console.error("❌ File summary error:", error);
      return {
        hasResults: false,
        summary: "Error generating summary.",
        error: error.message,
      };
    }
  }
}

// Export singleton instance
const semanticSearch = new SemanticSearch();

module.exports = {
  semanticSearch,
  SemanticSearch,
};