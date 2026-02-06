import { Effect, pipe, Chunk, Option } from "effect";
import { extractText } from "unpdf";
import { PdfEctraError } from "./error";
import * as S from "@effect/schema/Schema";
import { NodeSdk } from "@effect/opentelemetry"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"

export type Invoice = S.Schema.Type<typeof InvoiceSchema>;

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
})

export const effectValidateReturn = Effect.gen(function* () {
  const data = yield* EffectExtractPdfData;
  const rawData = data.text.join("\n");

  const lines = pipe(
    rawData.split("\n"),
    Chunk.fromIterable,
    Chunk.map((line: any) => line.replace(/\u0000/g, "").replace(/\r/g, "")),
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
    totalIdx: Option.getOrElse(totalIdx, () => Chunk.size(lines)),
  };

  const first = pipe(lines, Chunk.take(indices.items), Chunk.join("\n"));

  const second = pipe(
    lines,
    Chunk.drop(indices.items),
    Chunk.take(indices.billing - indices.items),
    Chunk.join("\n"),
  );

  const third = pipe(lines, Chunk.drop(indices.totalIdx), Chunk.join("\n"));

  const result = { first, second, third };

  return yield* S.decode(InvoiceSchema)(result);
})




const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: "Pdf-to-csv" },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter())
}))
const program = Effect.gen(function* (){
  yield * EffectExtractPdfData;
  yield* Effect.sleep(10);
  yield* effectValidateReturn;
})

Effect.runPromise(
  program.pipe(
    Effect.provide(NodeSdkLive),
    Effect.catchAllCause(Effect.logError)
  )
)
export const PDF = await Effect.runPromise(effectValidateReturn)