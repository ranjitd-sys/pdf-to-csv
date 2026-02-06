import { NodeSdk } from "@effect/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Effect, Duration } from "effect";
import { effectValidateReturn } from "./chunk";
import { EffectExtractPdfData } from "./chunk";
import { extractInvoiceParties } from "./vendorSerilaize";
import { extractProducts } from "./TabullerSerilize";
import { convertToCSV } from "./PDFtoCSV";

const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: "Pdf-to-csv" },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));

const program = Effect.gen(function* () {
  yield* Effect.gen(function* () {
    // 1. Run validation and wrap it in a span
    const { first, second } = yield* effectValidateReturn.pipe(
      Effect.withSpan("validate-return-PARENT"),
    );


    yield* extractInvoiceParties(first).pipe(Effect.withSpan("Vender Data"));

    yield* extractProducts(second).pipe(Effect.withSpan("Tabuler Data"));

    yield*convertToCSV().pipe(Effect.withSpan("Final CSV"))
  }).pipe(Effect.withSpan("pdf-processing-root"));
});

Effect.runPromise(
  program.pipe(
    Effect.provide(NodeSdkLive),
    Effect.catchAllCause(Effect.logError),
  ),
);
