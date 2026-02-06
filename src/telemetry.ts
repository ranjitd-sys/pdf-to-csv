import { NodeSdk } from "@effect/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Effect } from "effect";
import { effectValidateReturn } from "./chunk";
import { EffectExtractPdfData } from "./chunk";
import { extractInvoiceParties } from "./vendorSerilaize";
import { first } from "./test";
const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: "Pdf-to-csv" },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));

const program = Effect.gen(function* () {
  yield* EffectExtractPdfData;
  yield* Effect.sleep(`${100} millis`);
  yield* effectValidateReturn;
  yield* Effect.sleep(`${100} millis`);
  
});

Effect.runPromise(
  program.pipe(
    Effect.provide(NodeSdkLive),
    Effect.catchAllCause(Effect.logError),
  ),
);
