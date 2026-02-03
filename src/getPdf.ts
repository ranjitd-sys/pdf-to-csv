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
    return  result;

  }
  catch(e){
    console.log(e)
  }
}
export const data = await extractPdfData()
export const rawData = data?.text.join("\n") || ""
export const first = rawData.slice(rawData.indexOf("ITEM DETAILS"), rawData.length)
