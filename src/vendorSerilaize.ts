import { cons } from "effect/List";
import { PDF } from "./convertAndChunk";
type InvoiceParties = {
  supplierName: string | null;
  supplierAddress: string | null;
  supplierEmail: string | null;
  supplierMobile: string | null;
  supplierGSTIN: string | null;

  receiverName: string | null;
  receiverAddress: string | null;
  receiverGSTIN: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  billingPeriod: string | null;
};

export function extractInvoiceParties(text: string): InvoiceParties {
  const clean = text
    .replace(/\u0000/g, "")
    .replace(/\r/g, "")
    .replace(/\n+/g, "\n")
    .trim();

  const match = (regex: RegExp) => clean.match(regex)?.[1]?.trim() ?? null;

  return {
    // ---------------- SUPPLIER ----------------
    supplierName: match(/^([A-Za-z0-9 &.-]+)\n/i),

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
}
function gstPercentage(text: string) {
  const match = text.match(/-\s*(\d+(?:\.\d+)?%)/);
  const gstPercentae = match?.[1]; // "5.00%"

  return {"gstPercentage":gstPercentae};
}
const gstDetial = gstPercentage(PDF?.third || "")
const VenderSubDetails = extractInvoiceParties(PDF?.first || "");
export const VendorDetils = {...VenderSubDetails, ...gstDetial};
