import { file } from 'bun';
import { couldStartTrivia, ExitStatus } from 'typescript';
import { extractText } from 'unpdf';


const extractPdfData = async () => {
  try {
    // Read the PDF file into a buffer
    const data = Bun.file("../public/label.pdf")
    const buffer = await data.arrayBuffer();
    // Extract text using unpdf
    const result = await extractText(buffer)
    return result;

  }
  catch (e) {
    console.log(e)
  }
}
const data = await extractPdfData()
const rawData = data?.text.join("\n") || ""
const cleaned = rawData
  .replace(/\u0000/g, "")
  .replace(/\r/g, "");
export const first = cleaned.slice(0, rawData.indexOf("ITEM DETAILS"));
export const Second = cleaned.slice(rawData.indexOf("ITEM DETAILS"), rawData.length);
console.log(first)