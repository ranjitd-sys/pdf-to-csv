import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

// Step 1: Create an exporter (the thing that sends data to Grafana)
const exporter = new OTLPTraceExporter({
  url: "http://localhost:4318/v1/traces",  // Grafana's address
});

// Step 2: Create the SDK with config
const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: "pdf-processor",  // Your app name
  }),
  traceExporter: exporter,  // Use the exporter we created
});

// Step 3: Start it!
sdk.start();

// Step 4: Cleanup when app exits
process.on("SIGTERM", () => {
  sdk.shutdown().finally(() => process.exit(0));
});

console.log("✓ OpenTelemetry started");