// Usage: node pdf-to-text.js <pdf_file_path> [output_txt_file]
const pdf = require('pdf-parse');
const fs = require('fs');

async function extractTextFromPdf(pdfFilePath) {
  try {
    const dataBuffer = fs.readFileSync(pdfFilePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return null;
  }
}

async function main() {
  if (process.argv.length < 3) {
    console.log('Usage: node pdf-to-text.js <pdf_file_path> [output_txt_file]');
    process.exit(-1);
  }
  const pdfFilePath = process.argv[2];
  const outputFile = process.argv[3];
  const text = await extractTextFromPdf(pdfFilePath);
  if (text) {
    if (outputFile) {
      fs.writeFileSync(outputFile, text, 'utf8');
      console.log(`Extracted text written to ${outputFile}`);
    } else {
      console.log('Extracted Text:\n', text);
    }
  } else {
    console.log('Failed to extract text from PDF.');
  }
}

main();
