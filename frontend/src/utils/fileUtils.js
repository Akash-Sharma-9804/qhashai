


 export const readFile = (file, options = {}) => {
    const defaultOptions = {
      type: 'text', // Default to text file reading
      maxSizeMB: 30, // Maximum file size in MB
      encoding: 'UTF-8' // Default encoding
    };
  
    const config = { ...defaultOptions, ...options };
  
    // Validate file size
    if (file.size > config.maxSizeMB * 1024 * 1024) {
      return Promise.reject(new Error(`File size exceeds ${config.maxSizeMB}MB limit`));
    }
  
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      // Handle successful file reading
      reader.onload = () => {
        try {
          switch (config.type) {
            case 'text':
              resolve(reader.result);
              break;
            case 'base64':
              resolve(reader.result);
              break;
            case 'arrayBuffer':
              resolve(reader.result);
              break;
            case 'dataURL':
              resolve(reader.result);
              break;
            case 'pdf':
              if (file.type === 'application/pdf') {
                resolve(reader.result);
              } else {
                reject(new Error('Invalid file type for PDF reading'));
              }
              break;
            case 'image':
              if (file.type.startsWith('image/')) {
                resolve({
                  data: reader.result,
                  type: file.type
                });
              } else {
                reject(new Error('Invalid file type for image reading'));
              }
              break;
            case 'doc':
              if (
                file.type === 'application/msword' || 
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              ) {
                resolve(reader.result);
              } else {
                reject(new Error('Invalid file type for document reading'));
              }
              break;
            default:
              reject(new Error('Unsupported file reading type'));
          }
        } catch (error) {
          reject(error);
        }
      };
  
      // Handle errors
      reader.onerror = (error) => reject(error);
  
      // Read file based on type
      try {
        switch (config.type) {
          case 'text':
            reader.readAsText(file, config.encoding);
            break;
          case 'base64':
            reader.readAsDataURL(file);
            break;
          case 'arrayBuffer':
            reader.readAsArrayBuffer(file);
            break;
          case 'dataURL':
            reader.readAsDataURL(file);
            break;
          case 'pdf':
            reader.readAsArrayBuffer(file);
            break;
          case 'image':
            reader.readAsDataURL(file);
            break;
          case 'doc':
            reader.readAsArrayBuffer(file);
            break;
          default:
            throw new Error('Unsupported file reading type');
        }
      } catch (error) {
        reject(error);
      }
    });
  };
  
 
 

 
  