import { extractText } from 'unpdf';


const extractPdfData = async (filePath: string) => {
  try {
    // Read the PDF file into a buffer
    const data = Bun.file(filePath)

    // Extract text using unpdf
    const { text } = await extractText(data);

    console.log('Extracted Text:', text);
  } catch (error) {
    console.error('Error extracting PDF data:', error);
  }
};

// Replace 'your-document.pdf' with the path to your PDF file
extractPdfData('./your-document.pdf');
