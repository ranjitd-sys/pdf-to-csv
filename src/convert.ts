import { file, listen, secrets } from "bun";
import {
  convertCompilerOptionsFromJson,
  couldStartTrivia,
  ExitStatus,
} from "typescript";
import { extractText } from "unpdf";

const extractPdfData = async () => {
  try {
    // Read the PDF file into a buffer
    const data = Bun.file("../public/label.pdf");
    const buffer = await data.arrayBuffer();
    // Extract text using unpdf
    const result = await extractText(buffer);
    return result;
  } catch (e) {
    console.log(e);
  }
};
async function ValidateAdnReturn() {
  const data = await extractPdfData();
  const rawData = data?.text.join("\n") || "";
  const cleaned = rawData.replace(/\u0000/g, "").replace(/\r/g, "");
  const first = cleaned.slice(0, rawData.indexOf("ITEM DETAILS"));
  const Second = cleaned.slice(rawData.indexOf("ITEM DETAILS"), rawData.indexOf("BILLING SUMMARY"));
  const third =  cleaned.slice(rawData.indexOf("BILLING SUMMARY"), cleaned.length );

  if(!cleaned.includes("ITEM DETAILS") && !cleaned.includes("BILLING SUMMARY")){
    console.log("dafds")
    return "Invlid Data"
  }
  return {
    first, Second, third
  }
}

async function GetpdfData() {
  const data = await ValidateAdnReturn();
  if(data === "Invlid Data"){
    return;
  }
  const {first, Second, third } = data
  return {first,Second,third}
}
export const PDF = await GetpdfData()