import { Effect } from "effect";
import { extractText } from "unpdf";
import { FileSystem } from "@effect/platform";
import { PdfEctraError } from "./error";



const extractPdfData = async () => {
  try {
    // Read the PDF file into a buffer
    const data = Bun.file("../publlc/label.pdf");
    const buffer = await data.arrayBuffer();
    // Extract text using unpdf
    const result = await extractText(buffer);
    return result;
  } catch (e) {
    console.log(e);
  }
};
const EffectxractPdfData = Effect.gen(function* (){
  const file = Bun.file("../public/label.pdf")

  const buffer = yield* Effect.tryPromise({
  try: () => file.arrayBuffer(),
  catch:(e)=>new PdfEctraError(String(e))
  });

  const text = yield* Effect.tryPromise({
    try: ()=> extractText(buffer),
    catch: (e)=>new PdfEctraError(String(e))
  })
  return text;
})

async function ValidateAdnReturn() {
  const data = await extractPdfData();
  const rawData = data?.text.join("\n") || "";
  const cleaned = rawData.replace(/\u0000/g, "").replace(/\r/g, "");
  const first = cleaned.slice(0, cleaned.indexOf("ITEM DETAILS"));
  const Second = cleaned.slice(cleaned.indexOf("ITEM DETAILS"), rawData.indexOf("BILLING SUMMARY"));
  const third =  cleaned.slice(cleaned.indexOf("TOTAL"), cleaned.length );

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
};

export const PDF = await GetpdfData();

const effectData = Effect.runPromise(EffectxractPdfData);
console.log(effectData)
