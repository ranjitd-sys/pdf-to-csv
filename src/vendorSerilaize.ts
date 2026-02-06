import { cons } from "effect/List";
import { PDF } from "./chunk";
import { Effect, Schema } from "effect";
const InvoicePartiesSchema = Schema.Struct({
  supplierName: Schema.NullOr(Schema.String),
  supplierAddress: Schema.NullOr(Schema.String),
  supplierEmail: Schema.NullOr(Schema.String),
  supplierMobile: Schema.NullOr(Schema.String),
  supplierGSTIN: Schema.NullOr(Schema.String),
  receiverName: Schema.NullOr(Schema.String),
  receiverAddress: Schema.NullOr(Schema.String),
  receiverGSTIN: Schema.NullOr(Schema.String),
  invoiceNumber: Schema.NullOr(Schema.String),
  invoiceDate: Schema.NullOr(Schema.String),
  billingPeriod: Schema.NullOr(Schema.String),
  gstPercentage: Schema.NullOr(Schema.String),
});


export const  extractInvoiceParties =  (text: string) => Effect.gen( function* () {
  const clean = text
    .replace(/\u0000/g, "")
    .replace(/\r/g, "")
    .replace(/\n+/g, "\n")
    .trim();

  const match = (regex: RegExp) => clean.match(regex)?.[1]?.trim() ?? null;

  return {
    // ---------------- SUPPLIER ----------------
    supplierName:  match(/^([A-Za-z0-9 &.-]+)\n/i),

    supplierAddress: match(/^[A-Za-z0-9 &.-]+\n([\s\S]*?)\nEmail:/i),

    supplierEmail: match(/Email:\s*([^\n]+)/i),

    supplierMobile: match(/Phone:\s*([0-9]+)/i),

    supplierGSTIN: match(/GSTIN:\s*([A-Z0-9]+)/i),

    // ---------------- RECEIVER ----------------
    receiverName: match(/Party’s Details:\s*\nName:\s*([^\n]+)/i),

    receiverAddress: match(
      /Party’s Details:[\s\S]*?Address:\s*([\s\S]*?)\nGSTIN:/i,
    ),

    receiverGSTIN: match(/Party’s Details:[\s\S]*?GSTIN:\s*([A-Z0-9]+)/i),

    // ---------------- INVOICE ----------------
    invoiceNumber: match(/Invoice Number:\s*([A-Z0-9-]+)/i),

    invoiceDate: match(/Invoice Date:\s*([0-9-]+)/i),

    billingPeriod: match(/Billing Period:\s*([^\n]+)/i),
  };
}).pipe(Effect.withSpan("vendor serirlizes"))

function gstPercentage(text: string) {
  const match = text.match(/-\s*(\d+(?:\.\d+)?%)/);
  const gstPercentae = match?.[1]; // "5.00%"

  return {"gstPercentage":gstPercentae};
}
const gstDetial = gstPercentage(PDF?.third || "")
const VenderSubDetails = extractInvoiceParties(PDF?.first);
export const VendorDetils = {...VenderSubDetails, ...gstDetial};
