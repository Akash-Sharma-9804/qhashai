
 
 

// const mammoth = require("mammoth");
// const xlsx = require("xlsx");
// const convertImageToPDF = require("./imageToPDF");
// const uploadToFTP = require("./ftpUploader");
// const cheerio = require("cheerio");
// const { sanitizeDisplayName } = require("./FilenameGenerator");
// const JSZip = require('jszip'); // Add this for PPTX extraction
// const { ragSystem } = require('./ragSystem'); // ✅ ADD THIS IMPORT
// // Add this helper function at the top
// const cleanExtractedText = (text) => {
//   if (!text || typeof text !== 'string') return "";
  
//   return text
//     .replace(/\r\n/g, '\n')  // Normalize line endings
//     .replace(/\n{3,}/g, '\n\n')  // Remove excessive line breaks
//     .replace(/\s{2,}/g, ' ')  // Remove excessive spaces
//     .replace(/[^\x20-\x7E\n\t\u00A0-\uFFFF]/g, '')  // Remove non-printable characters but keep Unicode
//     .trim();
// };

// const extractText = async (buffer, mimeType, ftpUrl, originalFileName) => {
//   console.log("🔄 Processing file:", originalFileName, "| FTP URL:", ftpUrl);
  
//   try {
//     // ✅ SANITIZE ORIGINAL FILENAME FOR LOGGING
//     const safeFileName = sanitizeDisplayName(originalFileName || "unknown_file");
//     console.log("📄 Safe filename for processing:", safeFileName);

//     // ✅ If image, convert to PDF and re-upload
//     if (mimeType.startsWith("image/")) {
//       console.log(`🖼️ Converting image to PDF: ${safeFileName}`);
//       const pdfBuffer = await convertImageToPDF(buffer);
//       const pdfFileName = `converted_${Date.now()}_${safeFileName}.pdf`;
//       const newFtpUrl = await uploadToFTP(pdfBuffer, pdfFileName);
//       ftpUrl = newFtpUrl;
//       mimeType = "application/pdf";
//       console.log(`✅ Image converted to PDF: ${newFtpUrl}`);
//     }

//     // ✅ OCR for PDFs using public URL
//     if (mimeType === "application/pdf") {
//       const documentUrl = `https://qhashai.com${ftpUrl}`;
//       console.log("🔗 Document URL for OCR:", documentUrl);

//       try {
//         const response = await fetch("https://api.mistral.ai/v1/ocr", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
//           },
//           body: JSON.stringify({
//             model: "mistral-ocr-latest",
//             document: {
//               type: "document_url",
//               document_url: documentUrl,
//             },
//             include_image_base64: false,
//           }),
//         });

//         if (!response.ok) {
//           const errText = await response.text();
//           throw new Error(`Mistral API error: ${response.status} ${errText}`);
//         }

//         const data = await response.json();
//         console.log(`📥 OCR response received for: ${safeFileName}`);

//         if (data?.pages?.length > 0) {
//           let fullText = "";
//           data.pages.forEach((page, index) => {
//             const markdown = page?.markdown?.trim();
//             if (markdown) {
//               fullText += `\n\n--- Page ${index + 1} ---\n${markdown}`;
//             }
//           });

//           console.log(`✅ OCR extraction successful: ${fullText.length} characters from ${safeFileName}`);
//           return fullText.length > 0 ? fullText.trim() : "[No text extracted from OCR]";
//         }

//         return "[No pages or markdown found in OCR result]";
//       } catch (ocrError) {
//         console.error(`❌ Mistral OCR error for ${safeFileName}:`, ocrError.message);
//         return "[Error with OCR extraction]";
//       }
//     }

//     // ✅ Plain text (.txt)
//     if (mimeType === "text/plain") {
//       console.log(`📄 Processing plain text file: ${safeFileName}`);
//       const textContent = buffer.toString("utf-8").trim();
//       console.log(`✅ Plain text extracted: ${textContent.length} characters from ${safeFileName}`);
//       return textContent;
//     }

//     // ✅ PowerPoint files (.ppt and .pptx) - NEW ADDITION
//     if (
//       mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
//       mimeType === "application/vnd.ms-powerpoint" ||
//       originalFileName?.toLowerCase().endsWith('.pptx') ||
//       originalFileName?.toLowerCase().endsWith('.ppt')
//     ) {
//       console.log(`📊 Processing PowerPoint file: ${safeFileName}`);
//       try {
//         const extractedText = await extractTextFromPowerPoint(buffer, safeFileName);
//         console.log(`✅ PowerPoint extraction successful from ${safeFileName}: ${extractedText.length} characters`);
//         return extractedText;
//       } catch (pptError) {
//         console.error(`❌ Error extracting PowerPoint file ${safeFileName}:`, pptError.message);
//         return `[Error extracting PowerPoint file: "${safeFileName}"]`;
//       }
//     }

//     // ✅ Check if it's a DOC file (older format)
//     const isDocFile = originalFileName?.toLowerCase().endsWith('.doc') && 
//                      !originalFileName?.toLowerCase().endsWith('.docx');
    
//     // ✅ Check if it's a DOCX file
//     const isDocxFile = mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
//                        originalFileName?.toLowerCase().endsWith('.docx');

//     // ✅ Handle DOC files (older format) - IMPROVED APPROACH
//     if (isDocFile) {
//       console.log(`📄 Detected DOC file: ${safeFileName}, attempting multiple extraction methods...`);
      
//       try {
//         // Method 1: Try mammoth first (sometimes works with DOC files)
//         try {
//           console.log(`🔧 Attempting mammoth extraction on DOC file: ${safeFileName}`);
//           const result = await mammoth.extractRawText({ buffer });
//           if (result.value && result.value.trim().length > 50) {
//             console.log(`✅ Mammoth successfully extracted DOC content from ${safeFileName}: ${result.value.length} characters`);
//             return result.value.trim();
//           }
//         } catch (mammothError) {
//           console.log(`⚠️ Mammoth failed on DOC file ${safeFileName}, trying other methods...`);
//         }

//         // Method 2: Check if it contains HTML content (some DOC files are HTML-based)
//         const rawText = buffer.toString('utf-8');
//         console.log(`📄 Raw text length for ${safeFileName}:`, rawText.length);
        
//         const containsHTML = rawText.includes('<html') || rawText.includes('<HTML') || 
//                            rawText.includes('<body') || rawText.includes('<BODY') ||
//                            rawText.includes('<p>') || rawText.includes('<P>') ||
//                            rawText.includes('<div') || rawText.includes('<DIV');
        
//         if (containsHTML) {
//           console.log(`🌐 Detected HTML content in DOC file: ${safeFileName}`);
//           const extractedText = await extractHTMLFromDoc(rawText);
//           if (extractedText && extractedText.length > 50 && !extractedText.includes('[Error')) {
//             console.log(`✅ HTML extraction successful from ${safeFileName}: ${extractedText.length} characters`);
//             return extractedText;
//           }
//         }
        
//         // Method 3: Check if it contains Word XML schema
//         const containsWordXML = rawText.includes('w:document') || rawText.includes('w:body') ||
//                                rawText.includes('xmlns:w=') || rawText.includes('wordDocument');
        
//         if (containsWordXML) {
//           console.log(`📄 Detected Word XML schema in DOC file: ${safeFileName}`);
//           const extractedText = await extractTextFromWordXML(rawText);
//           if (extractedText && extractedText.length > 50 && !extractedText.includes('[Error')) {
//             console.log(`✅ Word XML extraction successful from ${safeFileName}: ${extractedText.length} characters`);
//             return extractedText;
//           }
//         }
        
//         // Method 4: Basic text extraction with better encoding handling
//         console.log(`🔧 Attempting basic text extraction for ${safeFileName}...`);
//         const basicText = extractBasicTextFromBuffer(buffer);
//         if (basicText && basicText.length > 50 && !basicText.includes('[Error') && !basicText.includes('[Could not')) {
//           console.log(`✅ Basic text extraction successful from ${safeFileName}: ${basicText.length} characters`);
//           return basicText;
//         }
        
//         console.log(`❌ All extraction methods failed for DOC file: ${safeFileName}`);
//         return `[DOC file detected: "${safeFileName}" but content extraction failed. Please convert to DOCX or PDF format for better results.]`;
        
//       } catch (docError) {
//         console.error(`❌ DOC processing error for ${safeFileName}:`, docError.message);
//         return `[Error processing DOC file: "${safeFileName}". Please try converting to DOCX or PDF format.]`;
//       }
//     }

//     // Handle DOCX files with mammoth
//     if (isDocxFile) {
//       console.log(`📄 Processing DOCX file with mammoth: ${safeFileName}`);
//       try {
//         const result = await mammoth.extractRawText({ buffer });
//         console.log(`✅ DOCX extraction successful from ${safeFileName}: ${result.value.length} characters`);
//         return result.value.trim();
//       } catch (docxError) {
//         console.error(`❌ Error extracting DOCX ${safeFileName}:`, docxError.message);
//         return `[Error extracting DOCX file: "${safeFileName}"]`;
//       }
//     }

//     // ✅ Excel files (.xls and .xlsx)
//     if (
//       mimeType.includes("spreadsheet") ||
//       mimeType.includes("excel") ||
//       mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
//       mimeType === "application/vnd.ms-excel" ||
//       originalFileName?.toLowerCase().endsWith('.xls') ||
//       originalFileName?.toLowerCase().endsWith('.xlsx')
//     ) {
//       console.log(`📊 Processing Excel file: ${safeFileName}`);
//       try {
//         const workbook = xlsx.read(buffer, { type: "buffer" });
//         let output = "";

//         workbook.SheetNames.forEach((sheetName) => {
//           const sheet = workbook.Sheets[sheetName];
//           const text = xlsx.utils.sheet_to_txt(sheet);
//           output += `\n--- Sheet: ${sheetName} ---\n${text}`;
//         });

//         console.log(`✅ Excel extraction successful from ${safeFileName}: ${output.length} characters from ${workbook.SheetNames.length} sheets`);
//         return output.trim();
//       } catch (excelError) {
//         console.error(`❌ Error extracting Excel file ${safeFileName}:`, excelError.message);
//         return `[Error extracting Excel file: "${safeFileName}"]`;
//       }
//     }

//     console.log(`⚠️ Unsupported file type for ${safeFileName}: ${mimeType}`);
//     return `[Unsupported file type: "${safeFileName}" (${mimeType})]`;
//   } catch (err) {
//     console.error(`❌ extractText error for ${originalFileName}:`, err.message);
//     return `[Error extracting text from: "${originalFileName}"]`;
//   }
// };

// // NEW: Helper function to extract text from PowerPoint files
// const extractTextFromPowerPoint = async (buffer, safeFileName) => {
//   try {
//     // For PPTX files (which are ZIP archives)
//     const zip = await JSZip.loadAsync(buffer);
//     let extractedText = "";
//     let slideCount = 0;

//     // Look for slide files in the ZIP
//     for (const [filename, file] of Object.entries(zip.files)) {
//       if (filename.startsWith('ppt/slides/slide') && filename.endsWith('.xml')) {
//         slideCount++;
//         const slideXml = await file.async('text');
        
//         // Extract text from XML by removing tags
//         const slideText = slideXml
//           .replace(/<[^>]*>/g, ' ')
//           .replace(/&lt;/g, '<')
//           .replace(/&gt;/g, '>')
//           .replace(/&amp;/g, '&')
//           .replace(/&quot;/g, '"')
//           .replace(/&#39;/g, "'")
//           .replace(/\s+/g, ' ')
//           .trim();

//         if (slideText.length > 0) {
//           extractedText += `\n\n--- Slide ${slideCount} ---\n${slideText}`;
//         }
//       }
//     }

//     if (extractedText.length > 0) {
//       console.log(`✅ Extracted text from ${slideCount} slides`);
//       return extractedText.trim();
//     } else {
//       return `[No text content found in PowerPoint file: "${safeFileName}"]`;
//     }

//   } catch (error) {
//     console.error(`❌ PowerPoint extraction error:`, error.message);
//     return `[Error extracting PowerPoint file: "${safeFileName}"]`;
//   }
// };

// // Helper function to extract HTML content from DOC files
// const extractHTMLFromDoc = async (rawText) => {
//   try {
//     console.log("🌐 Extracting HTML content...");
    
//     let htmlContent = '';
    
//     // Try to find HTML tags and extract content between them
//     const htmlMatches = rawText.match(/<html[\s\S]*?<\/html>/gi) || 
//                        rawText.match(/<body[\s\S]*?<\/body>/gi) ||
//                        rawText.match(/<div[\s\S]*?<\/div>/gi);
    
//     if (htmlMatches && htmlMatches.length > 0) {
//       htmlContent = htmlMatches.join('\n');
//     } else {
//       htmlContent = rawText;
//     }
    
//     // Use cheerio to parse and extract text from HTML
//     const $ = cheerio.load(htmlContent, { 
//       decodeEntities: true,
//       normalizeWhitespace: true 
//     });
    
//     // Remove script and style elements
//     $('script, style, meta, link').remove();
    
//     // Extract text content
//     let extractedText = $('body').text() || $.text();
    
//     // Clean up the text
//     extractedText = extractedText
//       .replace(/\s+/g, ' ')
//       .replace(/\n\s*\n/g, '\n')
//       .trim();
    
//       console.log("✅ HTML extraction completed, text length:", extractedText.length);
//     return extractedText.length > 0 ? extractedText : "[No readable text found in HTML content]";
    
//   } catch (htmlError) {
//     console.error("❌ HTML extraction error:", htmlError.message);
//     return "[Error extracting HTML content from DOC file]";
//   }
// };

// // Helper function to extract text from Word XML schema
// const extractTextFromWordXML = async (rawText) => {
//   try {
//     console.log("📄 Extracting text from Word XML...");
    
//     let cleanText = rawText
//       .replace(/<[^>]*>/g, ' ')
//       .replace(/&lt;/g, '<')
//       .replace(/&gt;/g, '>')
//       .replace(/&amp;/g, '&')
//       .replace(/&quot;/g, '"')
//       .replace(/&#39;/g, "'")
//       .replace(/&nbsp;/g, ' ')
//       .replace(/\s+/g, ' ')
//       .replace(/\n\s*\n/g, '\n')
//       .trim();
    
//     console.log("✅ Word XML extraction completed, text length:", cleanText.length);
//     return cleanText.length > 0 ? cleanText : "[No readable text found in Word XML]";
    
//   } catch (xmlError) {
//     console.error("❌ Word XML extraction error:", xmlError.message);
//     return "[Error extracting text from Word XML]";
//   }
// };

// // Helper function for basic text extraction with better encoding
// const extractBasicTextFromBuffer = (buffer) => {
//   try {
//     const encodings = ['utf-8', 'latin1', 'ascii', 'utf16le'];
    
//     for (const encoding of encodings) {
//       try {
//         const text = buffer.toString(encoding);
//         // Filter out non-printable characters but keep basic punctuation
//         const cleanText = text
//           .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
//           .replace(/\s+/g, ' ')
//           .trim();
        
//         // Check if we got meaningful text (not just garbage)
//         const meaningfulWords = cleanText.split(' ').filter(word => 
//           word.length > 2 && /[a-zA-Z]/.test(word)
//         ).length;
        
//         if (cleanText.length > 100 && meaningfulWords > 10) {
//           console.log(`✅ Basic extraction successful with ${encoding} encoding`);
//           return cleanText;
//         }
//       } catch (encodingError) {
//         continue;
//       }
//     }
    
//     return "[Could not extract readable text from file]";
//   } catch (error) {
//     console.error("❌ Basic text extraction error:", error.message);
//     return "[Error in basic text extraction]";
//   }
// };

// module.exports = extractText;

const mammoth = require("mammoth");
const xlsx = require("xlsx");
const convertImageToPDF = require("./imageToPDF");
const uploadToFTP = require("./ftpUploader");
const cheerio = require("cheerio");
const { sanitizeDisplayName } = require("./FilenameGenerator");
const JSZip = require('jszip');
const { ragSystem } = require('./ragSystem');



// Add this helper function at the top
const cleanExtractedText = (text) => {
  if (!text || typeof text !== 'string') return "";
  
  return text
    .replace(/\r\n/g, '\n')  // Normalize line endings
    .replace(/\n{3,}/g, '\n\n')  // Remove excessive line breaks
    .replace(/\s{2,}/g, ' ')  // Remove excessive spaces
    .replace(/[^\x20-\x7E\n\t\u00A0-\uFFFF]/g, '')  // Remove non-printable characters but keep Unicode
    .trim();
};

// ✅ ENHANCED EXTRACT TEXT WITH RAG INTEGRATION
const extractText = async (buffer, mimeType, ftpUrl, originalFileName, fileMetadata = null) => {
  console.log("🔄 Processing file:", originalFileName, "| FTP URL:", ftpUrl);
  
  try {
    // ✅ SANITIZE ORIGINAL FILENAME FOR LOGGING
    const safeFileName = sanitizeDisplayName(originalFileName || "unknown_file");
    console.log("📄 Safe filename for processing:", safeFileName);

    let extractedText = "";

    // ✅ If image, convert to PDF and re-upload
    if (mimeType.startsWith("image/")) {
      console.log(`🖼️ Converting image to PDF: ${safeFileName}`);
      const pdfBuffer = await convertImageToPDF(buffer);
      const pdfFileName = `converted_${Date.now()}_${safeFileName}.pdf`;
      const newFtpUrl = await uploadToFTP(pdfBuffer, pdfFileName);
      ftpUrl = newFtpUrl;
      mimeType = "application/pdf";
      console.log(`✅ Image converted to PDF: ${newFtpUrl}`);
    }

    // ✅ OCR for PDFs using public URL
    if (mimeType === "application/pdf") {
      const documentUrl = `https://qhashai.com${ftpUrl}`;
      console.log("🔗 Document URL for OCR:", documentUrl);

      try {
        const response = await fetch("https://api.mistral.ai/v1/ocr", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
          },
          body: JSON.stringify({
            model: "mistral-ocr-latest",
            document: {
              type: "document_url",
              document_url: documentUrl,
            },
            include_image_base64: false,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Mistral API error: ${response.status} ${errText}`);
        }

        const data = await response.json();
        console.log(`📥 OCR response received for: ${safeFileName}`);

        if (data?.pages?.length > 0) {
          let fullText = "";
          data.pages.forEach((page, index) => {
            const markdown = page?.markdown?.trim();
            if (markdown) {
              fullText += `\n\n--- Page ${index + 1} ---\n${markdown}`;
            }
          });

          extractedText = fullText.length > 0 ? fullText.trim() : "[No text extracted from OCR]";
          console.log(`✅ OCR extraction successful: ${extractedText.length} characters from ${safeFileName}`);
        } else {
          extractedText = "[No pages or markdown found in OCR result]";
        }
      } catch (ocrError) {
        console.error(`❌ Mistral OCR error for ${safeFileName}:`, ocrError.message);
        extractedText = "[Error with OCR extraction]";
      }
    }

    // ✅ Plain text (.txt)
    else if (mimeType === "text/plain") {
      console.log(`📄 Processing plain text file: ${safeFileName}`);
      const textContent = buffer.toString("utf-8").trim();
      extractedText = textContent;
      console.log(`✅ Plain text extracted: ${extractedText.length} characters from ${safeFileName}`);
    }

    // ✅ PowerPoint files (.ppt and .pptx)
    else if (
      mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      mimeType === "application/vnd.ms-powerpoint" ||
      originalFileName?.toLowerCase().endsWith('.pptx') ||
      originalFileName?.toLowerCase().endsWith('.ppt')
    ) {
      console.log(`📊 Processing PowerPoint file: ${safeFileName}`);
      try {
        extractedText = await extractTextFromPowerPoint(buffer, safeFileName);
        console.log(`✅ PowerPoint extraction successful from ${safeFileName}: ${extractedText.length} characters`);
      } catch (pptError) {
        console.error(`❌ Error extracting PowerPoint file ${safeFileName}:`, pptError.message);
        extractedText = `[Error extracting PowerPoint file: "${safeFileName}"]`;
      }
    }

    // ✅ Check if it's a DOC file (older format)
    else if (originalFileName?.toLowerCase().endsWith('.doc') && 
             !originalFileName?.toLowerCase().endsWith('.docx')) {
      console.log(`📄 Detected DOC file: ${safeFileName}, attempting multiple extraction methods...`);
      
      try {
        // Method 1: Try mammoth first (sometimes works with DOC files)
        try {
          console.log(`🔧 Attempting mammoth extraction on DOC file: ${safeFileName}`);
          const result = await mammoth.extractRawText({ buffer });
          if (result.value && result.value.trim().length > 50) {
            extractedText = result.value.trim();
            console.log(`✅ Mammoth successfully extracted DOC content from ${safeFileName}: ${extractedText.length} characters`);
          }
        } catch (mammothError) {
          console.log(`⚠️ Mammoth failed on DOC file ${safeFileName}, trying other methods...`);
        }

        if (!extractedText) {
          // Method 2: Check if it contains HTML content (some DOC files are HTML-based)
          const rawText = buffer.toString('utf-8');
          console.log(`📄 Raw text length for ${safeFileName}:`, rawText.length);
          
          const containsHTML = rawText.includes('<html') || rawText.includes('<HTML') || 
                             rawText.includes('<body') || rawText.includes('<BODY') ||
                             rawText.includes('<p>') || rawText.includes('<P>') ||
                             rawText.includes('<div') || rawText.includes('<DIV');
          
          if (containsHTML) {
            console.log(`🌐 Detected HTML content in DOC file: ${safeFileName}`);
            extractedText = await extractHTMLFromDoc(rawText);
            if (extractedText && extractedText.length > 50 && !extractedText.includes('[Error')) {
              console.log(`✅ HTML extraction successful from ${safeFileName}: ${extractedText.length} characters`);
            }
          }
          
          // Method 3: Check if it contains Word XML schema
          if (!extractedText) {
            const containsWordXML = rawText.includes('w:document') || rawText.includes('w:body') ||
                                   rawText.includes('xmlns:w=') || rawText.includes('wordDocument');
            
            if (containsWordXML) {
              console.log(`📄 Detected Word XML schema in DOC file: ${safeFileName}`);
              extractedText = await extractTextFromWordXML(rawText);
              if (extractedText && extractedText.length > 50 && !extractedText.includes('[Error')) {
                console.log(`✅ Word XML extraction successful from ${safeFileName}: ${extractedText.length} characters`);
              }
            }
          }
          
          // Method 4: Basic text extraction with better encoding handling
          if (!extractedText) {
            console.log(`🔧 Attempting basic text extraction for ${safeFileName}...`);
            extractedText = extractBasicTextFromBuffer(buffer);
            if (extractedText && extractedText.length > 50 && !extractedText.includes('[Error') && !extractedText.includes('[Could not')) {
              console.log(`✅ Basic text extraction successful from ${safeFileName}: ${extractedText.length} characters`);
            }
          }
        }
        
        if (!extractedText) {
          console.log(`❌ All extraction methods failed for DOC file: ${safeFileName}`);
          extractedText = `[DOC file detected: "${safeFileName}" but content extraction failed. Please convert to DOCX or PDF format for better results.]`;
        }
        
      } catch (docError) {
        console.error(`❌ DOC processing error for ${safeFileName}:`, docError.message);
        extractedText = `[Error processing DOC file: "${safeFileName}". Please try converting to DOCX or PDF format.]`;
      }
    }

    // ✅ Handle DOCX files with mammoth
    else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
             originalFileName?.toLowerCase().endsWith('.docx')) {
      console.log(`📄 Processing DOCX file with mammoth: ${safeFileName}`);
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value.trim();
        console.log(`✅ DOCX extraction successful from ${safeFileName}: ${extractedText.length} characters`);
      } catch (docxError) {
        console.error(`❌ Error extracting DOCX ${safeFileName}:`, docxError.message);
        extractedText = `[Error extracting DOCX file: "${safeFileName}"]`;
      }
    }

    // ✅ Excel files (.xls and .xlsx)
    else if (
      mimeType.includes("spreadsheet") ||
      mimeType.includes("excel") ||
      mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mimeType === "application/vnd.ms-excel" ||
      originalFileName?.toLowerCase().endsWith('.xls') ||
      originalFileName?.toLowerCase().endsWith('.xlsx')
    ) {
      console.log(`📊 Processing Excel file: ${safeFileName}`);
      try {
        const workbook = xlsx.read(buffer, { type: "buffer" });
        let output = "";

        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const text = xlsx.utils.sheet_to_txt(sheet);
          output += `\n--- Sheet: ${sheetName} ---\n${text}`;
        });

        extractedText = output.trim();
        console.log(`✅ Excel extraction successful from ${safeFileName}: ${extractedText.length} characters from ${workbook.SheetNames.length} sheets`);
      } catch (excelError) {
        console.error(`❌ Error extracting Excel file ${safeFileName}:`, excelError.message);
        extractedText = `[Error extracting Excel file: "${safeFileName}"]`;
      }
    }

    else {
      console.log(`⚠️ Unsupported file type for ${safeFileName}: ${mimeType}`);
      extractedText = `[Unsupported file type: "${safeFileName}" (${mimeType})]`;
    }

    // ✅ CLEAN THE EXTRACTED TEXT
    extractedText = cleanExtractedText(extractedText);

    // ✅ RAG SYSTEM INTEGRATION - Process and store in vector database
    // ✅ RAG SYSTEM INTEGRATION - Process and store in vector database
if (fileMetadata && extractedText && extractedText.length > 100 && 
    !extractedText.includes('[Error') && !extractedText.includes('[Unsupported') &&
    !extractedText.includes('[No text') && !extractedText.includes('[DOC file detected')) {
  
  console.log(`🧠 Starting RAG processing for: ${safeFileName}`);
  
  try {
    // Prepare file metadata for RAG system
    const ragFileMetadata = {
      fileId: fileMetadata.fileId || `file_${Date.now()}`,
      originalFileName: safeFileName,
      fileType: mimeType,
      ftpUrl: ftpUrl,
      uploadedAt: new Date().toISOString(),
      // ✅ ENSURE CONSISTENT DATA TYPES
      userId: String(fileMetadata.userId), // Convert to string
      conversationId: String(fileMetadata.conversationId), // Convert to string
      ...fileMetadata
    };

    // Process file with RAG system synchronously (wait for it to finish)
    const ragResult = await ragSystem.processAndStoreFile(
      extractedText,
      ragFileMetadata,
      String(fileMetadata.userId), // Convert to string
      String(fileMetadata.conversationId) // Convert to string
    );

    if (ragResult.success) {
      console.log(`✅ RAG processing completed: ${ragResult.chunksStored} chunks stored for ${safeFileName}`);
    } else {
      console.error(`❌ RAG processing failed for ${safeFileName}:`, ragResult.error);
    }
    
  } catch (ragError) {
    console.error(`❌ RAG system error for ${safeFileName}:`, ragError.message);
    // Don't fail the main extraction process if RAG fails
  }
} else {
  console.log(`⏭️ Skipping RAG processing for ${safeFileName} - insufficient content or error in extraction`);
}


    return extractedText;

  } catch (err) {
    console.error(`❌ extractText error for ${originalFileName}:`, err.message);
    return `[Error extracting text from: "${originalFileName}"]`;
  }
};

// NEW: Helper function to extract text from PowerPoint files
const extractTextFromPowerPoint = async (buffer, safeFileName) => {
  try {
    // For PPTX files (which are ZIP archives)
    const zip = await JSZip.loadAsync(buffer);
    let extractedText = "";
    let slideCount = 0;

    // Look for slide files in the ZIP
    for (const [filename, file] of Object.entries(zip.files)) {
      if (filename.startsWith('ppt/slides/slide') && filename.endsWith('.xml')) {
        slideCount++;
        const slideXml = await file.async('text');
        
        // Extract text from XML by removing tags
        const slideText = slideXml
          .replace(/<[^>]*>/g, ' ')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, ' ')
          .trim();

                if (slideText.length > 0) {
          extractedText += `\n\n--- Slide ${slideCount} ---\n${slideText}`;
        }
      }
    }

    if (extractedText.length > 0) {
      console.log(`✅ Extracted text from ${slideCount} slides`);
      return extractedText.trim();
    } else {
      return `[No text content found in PowerPoint file: "${safeFileName}"]`;
    }

  } catch (error) {
    console.error(`❌ PowerPoint extraction error:`, error.message);
    return `[Error extracting PowerPoint file: "${safeFileName}"]`;
  }
};

// Helper function to extract HTML content from DOC files
const extractHTMLFromDoc = async (rawText) => {
  try {
    console.log("🌐 Extracting HTML content...");
    
    let htmlContent = '';
    
    // Try to find HTML tags and extract content between them
    const htmlMatches = rawText.match(/<html[\s\S]*?<\/html>/gi) || 
                       rawText.match(/<body[\s\S]*?<\/body>/gi) ||
                       rawText.match(/<div[\s\S]*?<\/div>/gi);
    
    if (htmlMatches && htmlMatches.length > 0) {
      htmlContent = htmlMatches.join('\n');
    } else {
      htmlContent = rawText;
    }
    
    // Use cheerio to parse and extract text from HTML
    const $ = cheerio.load(htmlContent, { 
      decodeEntities: true,
      normalizeWhitespace: true 
    });
    
    // Remove script and style elements
    $('script, style, meta, link').remove();
    
    // Extract text content
    let extractedText = $('body').text() || $.text();
    
    // Clean up the text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
    
    console.log("✅ HTML extraction completed, text length:", extractedText.length);
    return extractedText.length > 0 ? extractedText : "[No readable text found in HTML content]";
    
  } catch (htmlError) {
    console.error("❌ HTML extraction error:", htmlError.message);
    return "[Error extracting HTML content from DOC file]";
  }
};

// Helper function to extract text from Word XML schema
const extractTextFromWordXML = async (rawText) => {
  try {
    console.log("📄 Extracting text from Word XML...");
    
    let cleanText = rawText
      .replace(/<[^>]*>/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
    
    console.log("✅ Word XML extraction completed, text length:", cleanText.length);
    return cleanText.length > 0 ? cleanText : "[No readable text found in Word XML]";
    
  } catch (xmlError) {
    console.error("❌ Word XML extraction error:", xmlError.message);
    return "[Error extracting text from Word XML]";
  }
};

// Helper function for basic text extraction with better encoding
const extractBasicTextFromBuffer = (buffer) => {
  try {
    const encodings = ['utf-8', 'latin1', 'ascii', 'utf16le'];
    
    for (const encoding of encodings) {
      try {
        const text = buffer.toString(encoding);
        // Filter out non-printable characters but keep basic punctuation
        const cleanText = text
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Check if we got meaningful text (not just garbage)
        const meaningfulWords = cleanText.split(' ').filter(word => 
          word.length > 2 && /[a-zA-Z]/.test(word)
        ).length;
        
        if (cleanText.length > 100 && meaningfulWords > 10) {
          console.log(`✅ Basic extraction successful with ${encoding} encoding`);
          return cleanText;
        }
      } catch (encodingError) {
        continue;
      }
    }
    
    return "[Could not extract readable text from file]";
  } catch (error) {
    console.error("❌ Basic text extraction error:", error.message);
    return "[Error in basic text extraction]";
  }
};

module.exports = extractText;

