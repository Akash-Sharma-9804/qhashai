const OpenAI = require("openai");
const { v4: uuidv4 } = require("uuid");

// Use REST API instead of the problematic qdrant-client
class QdrantRestClient {
  constructor(url) {
    this.baseUrl = url.endsWith("/") ? url.slice(0, -1) : url;
  }

  async request(method, path, data = null) {
    const url = `${this.baseUrl}${path}`;
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 second timeout
    };

    if (data) {
      options.body = JSON.stringify(data);

      // ✅ LOG PAYLOAD WITHOUT VECTORS
      if (data.points && Array.isArray(data.points)) {
        console.log(
          `🔍 Qdrant ${method} ${path} - Storing ${data.points.length} chunks`
        );
        data.points.forEach((point, index) => {
          console.log(
            `   Chunk ${index + 1}: ${
              point.payload?.fileName || "Unknown"
            } (Page ${point.payload?.pageNumber || "?"})`
          );
          console.log(
            `      Text: "${
              point.payload?.text?.substring(0, 100) || "No text"
            }..."`
          );
        });
      } else if (data.vector && Array.isArray(data.vector)) {
        console.log(
          `🔍 Qdrant ${method} ${path} - Search with ${data.vector.length}D vector, limit: ${data.limit}`
        );
        console.log(`   Filter:`, JSON.stringify(data.filter, null, 2));
      } else {
        console.log(
          `🔍 Qdrant ${method} ${path} payload:`,
          JSON.stringify(data, null, 2)
        );
      }
    }

    try {
      console.log(`🔗 Making Qdrant request: ${method} ${url}`);
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `❌ Qdrant API error: ${response.status} ${response.statusText}`,
          errorText
        );
        throw new Error(
          `Qdrant API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const result = await response.json();

      // ✅ LOG RESULTS WITHOUT VECTORS
      if (result.result && Array.isArray(result.result)) {
        console.log(
          `✅ Qdrant ${method} ${path} - Found ${result.result.length} results`
        );
        result.result.forEach((item, index) => {
          if (item.payload) {
            console.log(
              `   Result ${index + 1}: ${
                item.payload.fileName || "Unknown"
              } (Score: ${item.score?.toFixed(3) || "N/A"})`
            );
          }
        });
      } else {
        console.log(`✅ Qdrant ${method} ${path} success`);
      }

      return result;
    } catch (error) {
      console.error(
        `❌ Qdrant request failed: ${method} ${url}`,
        error.message
      );
      throw error;
    }
  }

  async getCollections() {
    return this.request("GET", "/collections");
  }

  async createCollection(name, config) {
    return this.request("PUT", `/collections/${name}`, config);
  }

  async upsert(collectionName, data) {
    return this.request("PUT", `/collections/${collectionName}/points`, data);
  }

  async search(collectionName, searchData) {
    return this.request(
      "POST",
      `/collections/${collectionName}/points/search`,
      searchData
    );
  }

  async count(collectionName, data = {}) {
    return this.request(
      "POST",
      `/collections/${collectionName}/points/count`,
      data
    );
  }

  async delete(collectionName, data) {
    return this.request(
      "POST",
      `/collections/${collectionName}/points/delete`,
      data
    );
  }
}

// Initialize clients
const qdrantClient = new QdrantRestClient("https://qdrant.qhashai.com");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuration
const COLLECTION_NAME = "file_chunks";
const CHUNK_SIZE = 1000; // tokens
const CHUNK_OVERLAP = 200; // tokens
const EMBEDDING_MODEL = "text-embedding-ada-002"; // better semantic performance

const SUMMARIZATION_MODEL = "gpt-3.5-turbo";

class RAGSystem {
  constructor() {
    this.initialized = false;
  }

  // Initialize Qdrant collection
  async initialize() {
    try {
      console.log("🔄 Initializing RAG system...");

      // Check if collection exists
      const collections = await qdrantClient.getCollections();
      const collectionExists = collections.result?.collections?.some(
        (col) => col.name === COLLECTION_NAME
      );

      if (!collectionExists) {
        console.log("📦 Creating Qdrant collection...");
        await qdrantClient.createCollection(COLLECTION_NAME, {
          vectors: {
            size: 1536, // OpenAI ada-002 embedding size
            distance: "Cosine",
          },
        });
        console.log("✅ Qdrant collection created successfully");
      } else {
        console.log("✅ Qdrant collection already exists");
      }

      this.initialized = true;
      console.log("✅ RAG system initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize RAG system:", error);
      throw error;
    }
  }

  // Tokenize text (simple approximation: 1 token ≈ 4 characters)
  tokenizeText(text) {
    return Math.ceil(text.length / 4);
  }

  // Split text into chunks with overlap
  // 🔧 Smart chunking: do NOT split tables, preserve them fully
// createChunks(text, pageNumber = 1) {
//   const CHUNK_CHAR_LIMIT = 1200; // ~300 tokens
//   const OVERLAP_CHARS = 240; // 20% overlap
//   const chunks = [];
//   let chunkIndex = 0;

//   // Split into logical blocks (paragraphs or tables)
//   const lines = text.split('\n');
//   let currentBlock = [];
//   let insideTable = false;

//   const flushBlock = () => {
//     if (currentBlock.length > 0) {
//       const blockText = currentBlock.join('\n').trim();
//       if (blockText.length > 50) {
//         // sliding window over block
//         for (let i = 0; i < blockText.length; i += (CHUNK_CHAR_LIMIT - OVERLAP_CHARS)) {
//           let part = blockText.slice(i, i + CHUNK_CHAR_LIMIT);
//           // align to sentence end
//           if (i + CHUNK_CHAR_LIMIT < blockText.length) {
//             const lastStop = Math.max(
//               part.lastIndexOf('.'),
//               part.lastIndexOf('?'),
//               part.lastIndexOf('!')
//             );
//             if (lastStop > CHUNK_CHAR_LIMIT * 0.6) {
//               part = part.slice(0, lastStop + 1);
//             }
//           }
//           if (part.trim().length > 50) {
//             chunks.push({ text: part.trim(), pageNumber, startIndex: chunkIndex, endIndex: chunkIndex + 1 });
//             chunkIndex++;
//           }
//         }
//       }
//       currentBlock = [];
//     }
//   };

//   for (const line of lines) {
//     const trimmed = line.trim();
//     if (trimmed.includes('|')) {
//       // it's a table row
//       insideTable = true;
//       currentBlock.push(line);
//     } else if (insideTable && trimmed === '') {
//       // end of table
//       flushBlock();
//       insideTable = false;
//     } else if (!insideTable && trimmed === '') {
//       // end of paragraph
//       flushBlock();
//     } else {
//       currentBlock.push(line);
//     }
//   }
//   flushBlock();

//   console.log(`📄 [SmartChunker] Created ${chunks.length} chunks (with overlap)`);
//   return chunks;
// }
// ✅ Page-wise chunking: treat the entire page as a single chunk (tables preserved as-is)
createChunks(text, pageNumber = 1) {
  const cleaned = text.trim();
  const chunks = [];

  if (cleaned.length > 0) {
    chunks.push({
      text: cleaned,
      pageNumber,
      startIndex: 0,
      endIndex: 0,
      chunkIndex: 0
    });
  }

  console.log(`📄 [PageChunker] Created ${chunks.length} chunk(s) for page ${pageNumber}`);
  return chunks;
}


// 📌 Fetch neighboring chunks around a given chunk index
async getNeighborChunks(fileName, pageNumber, chunkIndex, userId, conversationId, radius = 2) {
  const all = await this.debugSearchChunks(userId, conversationId);
  const sameFile = all.filter(c => c.payload?.fileName === fileName && c.payload?.pageNumber === pageNumber);
  return sameFile
    .filter(c =>
      Math.abs(c.payload.chunkIndex - chunkIndex) <= radius &&
      c.payload.chunkIndex !== chunkIndex
    )
    .map(c => ({
      text: c.payload.text,
      pageNumber: c.payload.pageNumber,
      chunkIndex: c.payload.chunkIndex
    }));
}



  // Generate embedding for text
  // Preprocess text for better embeddings
preprocessTextForEmbedding(text) {
  if (!text || typeof text !== 'string') return '';
  
  // Remove repeated headers/footers (common patterns)
  let cleaned = text
    // Remove page numbers and headers
    .replace(/^Page \d+.*$/gm, '')
    .replace(/^\d+\s*$/gm, '')
    // Remove repeated footer patterns
    .replace(/^.*confidential.*$/gmi, '')
    .replace(/^.*proprietary.*$/gmi, '')
    .replace(/^.*copyright.*$/gmi, '')
    // Remove excessive whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/\s+/g, ' ')
    // Remove special characters that don't add semantic value
    .replace(/[^\w\s\.\,\!\?\;\:\-\(\)]/g, ' ')
    .trim();
    
  // Normalize text
  cleaned = cleaned
    .toLowerCase()
    .replace(/\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
    
  return cleaned;
}

// Generate embedding for text
async generateEmbedding(text) {
  try {
    const preprocessedText = this.preprocessTextForEmbedding(text);
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: preprocessedText,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("❌ Failed to generate embedding:", error);
    throw error;
  }
}


  // Generate summary for chunk using LLM
  // async generateChunkSummary(chunkText) {
  //   try {
  //     const response = await openai.chat.completions.create({
  //       model: SUMMARIZATION_MODEL,
  //       messages: [
  //         {
  //           role: 'system',
  //           content: 'You are a helpful assistant that creates concise summaries of text chunks. Provide a brief, informative summary in 1-2 sentences that captures the main points and key information.',
  //         },
  //         {
  //           role: 'user',
  //           content: `Please summarize this text chunk:\n\n${chunkText}`,
  //         },
  //       ],
  //       max_tokens: 100,
  //       temperature: 0.3,
  //     });

  //     return response.choices[0].message.content.trim();
  //   } catch (error) {
  //     console.error('❌ Failed to generate chunk summary:', error);
  //     return 'Summary generation failed';
  //   }
  // }

  // Process and store file chunks
  async processAndStoreFile(
    extractedText,
    fileMetadata,
    userId,
    conversationId
  ) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      console.log(
        `🔄 Processing file for RAG: ${fileMetadata.originalFileName}`
      );
      const startTime = Date.now();

      // Split text into pages if it contains page markers
      const pages = this.extractPages(extractedText);
      const allChunks = [];

      // Process each page
      for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        const pageText = pages[pageIndex];
        const pageNumber = pageIndex + 1;
        // 👉 Force page-wise chunking: treat each page as one chunk
const chunks = [{ text: pageText.trim(), pageNumber, startIndex: 0, endIndex: 0 }];

        allChunks.push(...chunks);
      }

      console.log(
        `📄 Created ${allChunks.length} chunks from ${pages.length} pages`
      );

      // Process chunks in batches for better performance
      const batchSize = 10;
      const processedChunks = [];

      for (let i = 0; i < allChunks.length; i += batchSize) {
        const batch = allChunks.slice(i, i + batchSize);

        // Process batch in parallel
        const batchPromises = batch.map(async (chunk, batchIndex) => {
          const chunkId = uuidv4();
          const globalIndex = i + batchIndex;

          try {
            // Generate embedding and summary in parallel
            const embedding = await this.generateEmbedding(chunk.text);

            // ❌ Skip summary for speed
            const summary = ""; // optionally fill later in background

            const chunkData = {
              id: chunkId,
              text: chunk.text,
              summary,
              embedding,
              metadata: {
                fileId: fileMetadata.fileId,
                fileName: fileMetadata.originalFileName,
                fileType: fileMetadata.fileType,
                userId,
                conversationId,
                pageNumber: chunk.pageNumber,
                chunkIndex: globalIndex,
                tokenCount: chunk.tokenCount,
                createdAt: new Date().toISOString(),
                startIndex: chunk.startIndex,
                endIndex: chunk.endIndex,
              },
            };

            return chunkData;
          } catch (error) {
            console.error(`❌ Failed to process chunk ${globalIndex}:`, error);
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        const validChunks = batchResults.filter((chunk) => chunk !== null);
        processedChunks.push(...validChunks);

        console.log(
          `✅ Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            allChunks.length / batchSize
          )}`
        );
      }

      // Store all chunks in Qdrant
      if (processedChunks.length > 0) {
        await this.storeChunksInQdrant(processedChunks);
      }

      const processingTime = Date.now() - startTime;
      console.log(`✅ RAG processing completed in ${processingTime}ms`);
      console.log(
        `📊 Stored ${processedChunks.length} chunks for file: ${fileMetadata.originalFileName}`
      );

      return {
        success: true,
        chunksStored: processedChunks.length,
        processingTime,
        fileId: fileMetadata.fileId,
      };
    } catch (error) {
      console.error("❌ RAG processing failed:", error);
      return {
        success: false,
        error: error.message,
        chunksStored: 0,
      };
    }
  }

  // Extract pages from text (look for page markers)
  extractPages(text) {
    // Look for common page markers
    const pageMarkers = [
      /--- Page \d+ ---/g,
      /Page \d+/g,
      /\f/g, // Form feed character
    ];

    let pages = [text]; // Default to single page

    for (const marker of pageMarkers) {
      if (marker.test(text)) {
        pages = text.split(marker).filter((page) => page.trim().length > 0);
        break;
      }
    }

    return pages;
  }

  // Store chunks in Qdrant
  // Store chunks in Qdrant
  async storeChunksInQdrant(chunks) {
    const BATCH_SIZE = 50;
    try {
      for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE);
        await qdrantClient.upsert(COLLECTION_NAME, {
          points: batch.map((chunk) => ({
            id: chunk.id,
            vector: chunk.embedding,
            payload: {
              text: chunk.text,
              summary: chunk.summary || "",
              userId: String(chunk.metadata.userId),
              conversationId: String(chunk.metadata.conversationId),
              fileId: String(chunk.metadata.fileId),
              fileName: chunk.metadata.fileName,
              fileType: chunk.metadata.fileType,
              pageNumber: Number(chunk.metadata.pageNumber),
              chunkIndex: Number(chunk.metadata.chunkIndex),
             tokenCount: chunk.metadata.tokenCount ?? 0,

              createdAt: chunk.metadata.createdAt,
              startIndex: Number(chunk.metadata.startIndex),
              endIndex: Number(chunk.metadata.endIndex),
              neighbors: [], // placeholder for later expansion
            },
          })),
        });
        console.log(
          `✅ Upserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
            chunks.length / BATCH_SIZE
          )}`
        );
      }
      console.log(
        `✅ Stored ${chunks.length} chunks in Qdrant with consistent data types`
      );
    } catch (error) {
      console.error("❌ Failed to store chunks in Qdrant:", error);
      throw error;
    }
  }

  // Search for relevant chunks
  // Search for relevant chunks
  // Search for relevant chunks
  // Enhanced search with lower thresholds and better filtering
  async searchRelevantChunks(query, userId, conversationId = null, limit = 5) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      console.log(
        `🔍 Searching chunks for user: ${userId}, conversation: ${conversationId}, query: "${query.substring(
          0,
          100
        )}..."`
      );

      // Generate embedding for query
      const queryEmbedding = await this.generateEmbedding(query);
      console.log(
        `🧠 Generated query embedding: ${queryEmbedding.length} dimensions`
      );

      // Build search filter
      let searchFilter;
      if (
        conversationId &&
        conversationId !== "null" &&
        conversationId !== null
      ) {
        searchFilter = {
          must: [
            {
              should: [
                { key: "userId", match: { value: String(userId) } },
                { key: "userId", match: { value: Number(userId) } },
              ],
            },
            {
              should: [
                {
                  key: "conversationId",
                  match: { value: String(conversationId) },
                },
                {
                  key: "conversationId",
                  match: { value: Number(conversationId) },
                },
              ],
            },
          ],
        };
      } else {
        searchFilter = {
          should: [
            { key: "userId", match: { value: String(userId) } },
            { key: "userId", match: { value: Number(userId) } },
          ],
        };
      }

      // Try multiple search strategies with different thresholds
      const searchStrategies = [
        { threshold: 0.05, limit: limit },
        { threshold: 0.02, limit: limit * 2 },
        { threshold: 0.0, limit: limit * 3 },
      ];

      let relevantChunks = [];

      for (const strategy of searchStrategies) {
        console.log(
          `🎯 Trying search with threshold: ${strategy.threshold}, limit: ${strategy.limit}`
        );

        const searchPayload = {
          vector: queryEmbedding,
          filter: searchFilter,
          limit: strategy.limit,
          with_payload: true,
          score_threshold: strategy.threshold,
        };

        const searchResult = await qdrantClient.search(
          COLLECTION_NAME,
          searchPayload
        );
        const chunks = searchResult.result || [];

        if (chunks.length > 0) {
          relevantChunks = chunks
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

          console.log(
            `✅ Found ${relevantChunks.length} chunks with threshold ${strategy.threshold}`
          );
          break;
        }
      }

      // Format results
      const formattedChunks = relevantChunks.map((result) => ({
        id: result.id,
        score: result.score,
        text: result.payload.text,
        summary: result.payload.summary,
        fileName: result.payload.fileName,
        pageNumber: result.payload.pageNumber,
        chunkIndex: result.payload.chunkIndex,
        metadata: result.payload,
      }));

     console.log(
  `🔍 Final search results: ${formattedChunks.length} chunks found`
);
formattedChunks.forEach((chunk, index) => {
  console.log(
    `   ${index + 1}. ${chunk.fileName} (Page ${
      chunk.pageNumber
    }, Score: ${chunk.score.toFixed(3)})`
  );
  // Don't log full text preview to reduce noise
  console.log(`      Content length: ${(chunk.text || '').length} chars`);
});

      // ✨ Merge neighboring chunks to get better context
// ✨ Merge neighboring chunks to get better context
const mergedChunks = [];
for (const c of formattedChunks) {
  // fetch neighbors on the same file/page
  const neighbors = await this.getNeighborChunks(
    c.fileName,
    c.pageNumber,
    c.chunkIndex,
    userId,
    conversationId,
    2 // radius: 1 means previous and next chunk
  );


  // merge texts: current + neighbors
  const neighborTexts = neighbors.map(n => n.text);
  const mergedText = [c.text, ...neighborTexts].join('\n');
  mergedChunks.push({ ...c, text: mergedText });
}


// console.log(`✅ Merged with neighbors, total merged chunks: ${mergedChunks.length}`);

// ✅ HYBRID RETRIEVAL
// ✅ HYBRID RETRIEVAL with single fetch
let hybridResults = mergedChunks;
const importantKeywords = extractKeywordsFromMessage(query);

// 👉 Fetch all chunks once for keyword search
console.log('📥 RAGSystem: Fetching all chunks for hybrid keyword search...');
const allChunks = await this.debugSearchChunks(userId, conversationId);
console.log(`📊 RAGSystem: Retrieved ${allChunks.length} total chunks for keyword search`);

// 👉 Run keyword search in parallel with vector results processing
const keywordSearchPromise = this.enhancedKeywordSearch(query, allChunks, importantKeywords);
const keywordResults = await keywordSearchPromise;

console.log(`🔎 RAGSystem: Keyword search returned ${keywordResults.length} chunks`);

// 👉 Merge keywordResults with vectorResults (avoid duplicates)
const existingIds = new Set(hybridResults.map(c => c.id));
const newKeywordChunks = keywordResults.filter(c => !existingIds.has(c.id));

console.log(`🔄 RAGSystem: Merging ${hybridResults.length} vector results with ${newKeywordChunks.length} new keyword results`);
hybridResults = [...hybridResults, ...newKeywordChunks];

// 👉 Enhanced reranking with multiple factors
hybridResults = hybridResults.map(c => {
  let keywordScore = 0;
  let exactMatchBonus = 0;
  const text = (c.text || '').toLowerCase();
  
  // Count keyword matches with word boundaries
  for (const keyword of importantKeywords) {
    const wordBoundaryRegex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'g');
    const matches = text.match(wordBoundaryRegex);
    if (matches) {
      keywordScore += matches.length * 0.2;
      exactMatchBonus += 0.1;
    }
  }
  
  // Bonus for multiple keyword co-occurrence
  const cooccurrenceBonus = importantKeywords.filter(kw => 
    text.includes(kw.toLowerCase())
  ).length > 1 ? 0.3 : 0;
  
  return { 
    ...c, 
    score: c.score + keywordScore + exactMatchBonus + cooccurrenceBonus,
    keywordScore,
    exactMatchBonus,
    cooccurrenceBonus
  };
}).sort((a, b) => b.score - a.score);

console.log(`✅ RAGSystem: Enhanced reranked ${hybridResults.length} chunks by multiple relevance factors`);

// Debug: Show top chunks with their scores and matched terms
console.log(`📊 TOP RANKED CHUNKS:`);
hybridResults.slice(0, 10).forEach((chunk, idx) => {
  console.log(`   ${idx + 1}. Page ${chunk.pageNumber} - Score: ${chunk.score.toFixed(2)} - File: ${chunk.fileName}`);
  if (chunk.matchedTerms && chunk.matchedTerms.length > 0) {
    console.log(`      Matched: ${chunk.matchedTerms.join(', ')}`);
  }
  console.log(`      Preview: "${(chunk.text || '').substring(0, 100)}..."`);
});

console.log(`✅ RAGSystem: Hybrid retrieval returning ${hybridResults.length} chunks`);
return hybridResults;



       
    } catch (error) {
      console.error("❌ Failed to search chunks:", error);
      return [];
    }
  }

  // Debug method to check stored chunks
  // ✅ Fetch ALL chunks for a user & conversation using Qdrant's scroll endpoint
// Cache for chunks to avoid repeated fetches
// Cache for chunks to avoid repeated fetches
static chunkCache = new Map();
static cacheTimeout = 5 * 60 * 1000; // 5 minutes

// ✅ Fetch ALL chunks for a user & conversation using Qdrant's scroll endpoint with caching
async debugSearchChunks(userId, conversationId) {
  const cacheKey = `${userId}_${conversationId}`;
  const cached = RAGSystem.chunkCache.get(cacheKey);
  
  // Return cached result if still valid
  if (cached && (Date.now() - cached.timestamp) < RAGSystem.cacheTimeout) {
    // Only log once per search session to reduce noise
    if (!cached.loggedThisSession) {
      console.log(`🔍 DEBUG: Using cached chunks for user ${userId}, conversation ${conversationId} (${cached.chunks.length} chunks)`);
      cached.loggedThisSession = true;
    }
    return cached.chunks;
  }

  const chunks = [];
  let nextPageOffset = null;

  try {
    console.log(`🔍 DEBUG: Fetching ALL chunks for user ${userId}, conversation ${conversationId}`);

    do {
      const payload = {
        filter: {
          must: [
            {
              should: [
                { key: "userId", match: { value: String(userId) } },
                { key: "userId", match: { value: Number(userId) } }
              ]
            },
            {
              should: [
                { key: "conversationId", match: { value: String(conversationId) } },
                { key: "conversationId", match: { value: Number(conversationId) } }
              ]
            }
          ]
        },
        with_payload: true,
        limit: 100
      };

      // Add offset only if we have one
      if (nextPageOffset) {
        payload.offset = nextPageOffset;
      }

      const res = await fetch(`https://qdrant.qhashai.com/collections/file_chunks/points/scroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "api-key": "YOUR_API_KEY_IF_ANY"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      // ✅ FIX HERE: look into data.result.*
      const points = data?.result?.points || [];
      chunks.push(...points);

      nextPageOffset = data?.result?.next_page_offset || null;
    } while (nextPageOffset);

    console.log(`✅ DEBUG: Retrieved ${chunks.length} chunks`);
    
    // Cache the results
    RAGSystem.chunkCache.set(cacheKey, {
      chunks,
      timestamp: Date.now(),
      loggedThisSession: false
    });
    
    return chunks;
  } catch (err) {
    console.error("❌ Debug search failed:", err);
    return [];
  }
}



// Make generateEmbedding method accessible externally
async generateEmbeddingExternal(text) {
  return this.generateEmbedding(text);
}


  // Get file statistics
  async getFileStats(userId, fileId = null) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const filter = {
        must: [
          {
            key: "userId",
            match: { value: userId },
          },
        ],
      };

      if (fileId) {
        filter.must.push({
          key: "fileId",
          match: { value: fileId },
        });
      }

      const result = await qdrantClient.count(COLLECTION_NAME, {
        filter,
      });

      return {
        totalChunks: result.result?.count || 0,
        userId,
        fileId,
      };
    } catch (error) {
      console.error("❌ Failed to get file stats:", error);
      return { totalChunks: 0, userId, fileId };
    }
  }

  // Delete chunks for a file
  async deleteFileChunks(userId, fileId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      await qdrantClient.delete(COLLECTION_NAME, {
        filter: {
          must: [
            {
              key: "userId",
              match: { value: userId },
            },
            {
              key: "fileId",
              match: { value: fileId },
            },
          ],
        },
      });

      console.log(`✅ Deleted chunks for file: ${fileId}`);
      return true;
    } catch (error) {
      console.error("❌ Failed to delete file chunks:", error);
      return false;
    }
  }
// inside class RAGSystem
// Enhanced keyword search method in RAGSystem
// Enhanced keyword search method in RAGSystem with better relevance scoring
enhancedKeywordSearch(query, allChunks, keywords) {
  if (!Array.isArray(allChunks) || allChunks.length === 0) {
    console.log('⚠️ RAGSystem: No chunks provided for keyword search');
    return [];
  }

  console.log(`🔍 RAGSystem: Enhanced keyword search on ${allChunks.length} chunks`);
  console.log(`🔑 RAGSystem: Using keywords: ${keywords.join(', ')}`);

  // Extract meaningful terms from query
  const stopWords = new Set(['what', 'are', 'the', 'of', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'this', 'that', 'is', 'was', 'were', 'be', 'been', 'being', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'file?', 'file']);
  
  // Clean the message and preserve important punctuation
  const cleaned = query.toLowerCase()
    .replace(/[^\w\s\-\/]/g, ' ') // Keep hyphens and slashes
    .replace(/\s+/g, ' ')
    .trim();
  
  // Extract individual words
  const words = cleaned
    .split(/\s+/)
    .filter(term => term.length > 2 && !stopWords.has(term) && !/^\d+$/.test(term));
  
  // Extract meaningful keywords
  const meaningfulKeywords = keywords.filter(k => k.length > 2 && !stopWords.has(k.toLowerCase()));
  
  // Combine all terms and add phrase matching
  const allTerms = [...new Set([...words, ...meaningfulKeywords.map(k => k.toLowerCase())])];
  
  // Add important phrases from the query
  const phrases = [];
  const wordArray = cleaned.split(/\s+/);
  for (let i = 0; i < wordArray.length - 1; i++) {
    const phrase = wordArray.slice(i, i + 2).join(' ');
    if (phrase.length > 5 && !stopWords.has(wordArray[i]) && !stopWords.has(wordArray[i + 1])) {
      phrases.push(phrase);
    }
  }
  
  const finalTerms = [...allTerms, ...phrases];
  
  console.log(`🎯 RAGSystem: Searching for meaningful terms: ${finalTerms.join(', ')}`);

  // Special debug for incident/description queries
  if (query.toLowerCase().includes('incident') || query.toLowerCase().includes('description')) {
    console.log(`🚨 INCIDENT QUERY DETECTED - Looking for incident descriptions`);
    console.log(`🔍 Key terms to match: ${finalTerms.filter(t => t.length > 3).join(', ')}`);
  }
  
  const results = [];

  for (const point of allChunks) {
    const originalText = point.payload?.text || "";
    const text = originalText.toLowerCase();
    let hits = 0;
    let exactMatches = 0;
    let termFrequency = 0;
    let contextualScore = 0;
    const matchedTerms = [];

    // Count keyword hits with better matching
    for (const term of finalTerms) {
      // Escape special regex characters
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Try exact word boundary matching first
      const wordBoundaryRegex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');
      const exactMatches_temp = text.match(wordBoundaryRegex);
      
      if (exactMatches_temp) {
        hits += exactMatches_temp.length;
        termFrequency += exactMatches_temp.length;
        matchedTerms.push(term);
        
        // Bonus for exact word matches
        if (term.length > 3) {
          exactMatches++;
          contextualScore += 0.8;
        }
        
        // Extra bonus for multi-word phrases
        if (term.includes(' ')) {
          contextualScore += 1.0;
        }
      }
      // Try partial matching for compound words and variations
      else if (text.includes(term.toLowerCase()) && term.length > 3) {
        hits += 0.6;
        termFrequency += 0.6;
        matchedTerms.push(`~${term}`);
        contextualScore += 0.3;
      }
      
      // Special handling for technical terms with hyphens, underscores
      else if (term.includes('-') || term.includes('_')) {
        const variations = [
          term.replace(/-/g, ' '),
          term.replace(/_/g, ' '),
          term.replace(/[-_]/g, '')
        ];
        
        for (const variation of variations) {
          if (text.includes(variation.toLowerCase())) {
            hits += 0.7;
            termFrequency += 0.7;
            matchedTerms.push(`*${term}`);
            contextualScore += 0.4;
            break;
          }
        }
      }
    }

    // Only include chunks with meaningful matches
    if (hits > 0.5) {
      // Calculate weighted score with better relevance
      const baseScore = hits;
      const frequencyBonus = Math.min(termFrequency * 0.2, 2); // Cap frequency bonus
      const exactMatchBonus = exactMatches * 0.4;
      const diversityBonus = matchedTerms.length > 1 ? 0.3 : 0; // Bonus for multiple term matches
      const finalScore = baseScore + frequencyBonus + exactMatchBonus + contextualScore + diversityBonus;

      results.push({
        id: point.id,
        score: finalScore,
        text: originalText, // Keep original text
        summary: point.payload?.summary || "",
        fileName: point.payload?.fileName,
        pageNumber: point.payload?.pageNumber,
        chunkIndex: point.payload?.chunkIndex,
        metadata: point.payload,
        keywordHits: Math.round(hits),
        exactMatches,
        termFrequency: Math.round(termFrequency),
        matchedTerms: matchedTerms.slice(0, 5), // Limit for logging
        contextualScore
      });
    }
  }

  // Sort by score descending and filter for quality
  results.sort((a, b) => b.score - a.score);
  
  // Filter out low-quality matches
  const qualityResults = results.filter(r => r.score > 1.0 || r.exactMatches > 0);
  
  console.log(`✅ RAGSystem: Keyword search found ${qualityResults.length} relevant chunks (filtered from ${results.length})`);
  
  // Log top results for debugging
  qualityResults.slice(0, 5).forEach((chunk, idx) => {
    console.log(`   ${idx + 1}. ${chunk.fileName} (Page ${chunk.pageNumber}) - Score: ${chunk.score.toFixed(2)}, Hits: ${chunk.keywordHits}, Exact: ${chunk.exactMatches}`);
    console.log(`      Matched terms: ${chunk.matchedTerms.join(', ')}`);
    console.log(`      Text contains keywords: ${chunk.matchedTerms.map(term => `"${term}"`).join(', ')}`);
  });

  return qualityResults.slice(0, 30); // Return more results for better coverage
}




  
}
// ✨ CHANGE HERE – Helper to extract keywords from any user query
function extractKeywordsFromMessage(message) {
  const stopWords = new Set([
    "what","is","the","of","and","or","but","in","on","at","to","for","with","by",
    "about","this","that","it","am","are","was","were","be","been","being","do",
    "does","did","from","as","if","then","than","into","over","under","a","an"
  ]);
  
  // Clean the message and preserve important punctuation
  const cleaned = message.toLowerCase()
    .replace(/[^\w\s\-\/]/g, ' ') // Keep hyphens and slashes
    .replace(/\s+/g, ' ')
    .trim();
  
  // Extract individual words
  const words = cleaned
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w) && !/^\d+$/.test(w));
  
  // Extract compound terms (hyphenated, slashed)
  const compounds = [];
  const compoundRegex = /\b\w+[-\/]\w+(?:[-\/]\w+)*\b/g;
  let match;
  while ((match = compoundRegex.exec(cleaned)) !== null) {
    compounds.push(match[0]);
  }
  
  // Extract phrases (2-3 words)
  const phrases = [];
  const wordArray = cleaned.split(/\s+/);
  for (let i = 0; i < wordArray.length - 1; i++) {
    if (!stopWords.has(wordArray[i]) && !stopWords.has(wordArray[i + 1])) {
      const phrase = wordArray.slice(i, i + 2).join(' ');
      if (phrase.length > 5) {
        phrases.push(phrase);
      }
    }
  }
  
  // Combine all extracted terms
  const allTerms = [...new Set([...words, ...compounds, ...phrases])];
  
  console.log(`🔑 Extracted keywords: ${allTerms.join(', ')}`);
  return allTerms;
}


// Export singleton instance
const ragSystem = new RAGSystem();

module.exports = {
  ragSystem,
  RAGSystem,
  extractKeywordsFromMessage, // ✅ export it

};