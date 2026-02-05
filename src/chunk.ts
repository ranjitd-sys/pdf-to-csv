import { Effect, pipe, Chunk } from "effect";
import { extractText } from "unpdf";
import { PdfEctraError } from "./error";
import * as S from "@effect/schema/Schema";
import { Option } from "effect";

const InvoiceSchema = S.Struct({
  first: S.String,
  second: S.String.pipe(
    S.filter((s) => s.includes("ITEM DETAILS"), {
      message: () => "Your Invoice should contain ITEM DETAILS",
    }),
  ),
  third: S.String.pipe(
    S.filter((s) => s.includes("TOTAL"), {
      message: () => "Your Invoice must contain TOTAL",
    }),
  ),
});

// Type inference from schema
type Invoice = S.Schema.Type<typeof InvoiceSchema>;

// extract PDF
const EffectExtractPdfData = Effect.gen(function* () {
  const file = Bun.file("../public/label.pdf");

  const buffer = yield* Effect.tryPromise({
    try: () => file.arrayBuffer(),
    catch: (e) => new PdfEctraError(String(e)),
  });

  const text = yield* Effect.tryPromise({
    try: () => extractText(buffer),
    catch: (e) => new PdfEctraError(String(e)),
  });
  return text;
});

export const effectValidateReturn = Effect.gen(function* () {
  const data = yield* EffectExtractPdfData;

  const rawData = data.text.join("\n");

  const lines = pipe(
    rawData.split("\n"), // Split into lines first
    Chunk.fromIterable,
    Chunk.map((line) => line.replace(/\u0000/g, "").replace(/\r/g, "")),
  );
  
  

  const itemDetailsIdx = Chunk.findFirstIndex(lines, (line) =>
    line.includes("ITEM DETAILS"),
  );

  const billingIdx = Chunk.findFirstIndex(lines, (s) =>
    s.includes("BILLING SUMMARY"),
  );

  const totalIdx = Chunk.findFirstIndex(lines, (s) => s.includes("TOTAL"));

  const indices = {
    items: Option.getOrElse(itemDetailsIdx, () => 0),
    billing: Option.getOrElse(billingIdx, () => Chunk.size(lines)),
    totalIdx: Option.getOrElse(totalIdx, () => Chunk.size(lines))
  };

  

  // Extract sections
  const first = pipe(
    lines, 
    Chunk.take(indices.items), 
    Chunk.join("\n")
  );
  
  const second = pipe(
    lines, 
    Chunk.drop(indices.items),
    Chunk.take(indices.billing - indices.items),
    Chunk.join("\n")
  );
  
  const third = pipe(
    lines, 
    Chunk.drop(indices.totalIdx), 
    Chunk.join("\n")
  );

  const result = { first, second, third };
  
  
  // Decode and validate with schema
  return yield* S.decode(InvoiceSchema)(result);
});

// Run and get validated result
export const PDF = await Effect.runPromise(effectValidateReturn);

// Now PDF is properly typed as Invoice
console.log(PDF.second)
