import { Effect } from "effect";
import { extractText } from "unpdf";
import { Effectify, FileSystem } from "@effect/platform";
import { PdfEctraError } from "./error";
import * as S from "@effect/schema/Schema";
const InvoiceSchema = S.Struct({
  first: S.String,

  second: S.String.pipe(
    S.filter((s) => s.includes("ITEM DETAILS"), {
      message: () => "Your Invoice should contain ITEM DETAILS",
    }),
  ),
  third: S.String.pipe(
    S.filter((s) => s.includes("TOTAL"), {
      message: () => "Your Invoce must contain Total",
    }),
  ),
});
const EffectxractPdfData = Effect.gen(function* () {
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
  const data = yield* EffectxractPdfData;
  const rawData = data.text.join("\n");

  const cleaned = rawData.replace(/\u0000/g, "").replace(/\r/g, "");

  const first = cleaned.slice(0, cleaned.indexOf("ITEM DETAILS"));

  const second = cleaned.slice(
    cleaned.indexOf("ITEM DETAILS"),
    cleaned.indexOf("BILLING SUMMARY"),
  );

  const third = cleaned.slice(cleaned.indexOf("TOTAL"), cleaned.length);
  const result = {first, second, third};
  const validate = yield* S.decode(InvoiceSchema)(result);

  return validate;
});
const effectData = Effect.runPromise(EffectxractPdfData);
export const PDF = await Effect.runPromise(effectValidateReturn)
