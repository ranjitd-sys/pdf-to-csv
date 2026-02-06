import { Effect } from "effect";
import { TabulerData } from "./TabullerSerilize";
import { VendorDetils } from "./vendorSerilaize";
import { stringify } from "csv-stringify/sync";

const columns = [
  { key: "srNo", header: "S. No." },
  { key: "description", header: "DESCRIPTION" },
  { key: "orderNo", header: "ORDER NO" },
  { key: "hsn", header: "HSN CODE" },
  { key: "qty", header: "QTN" },
  { key: "rate", header: "RATE" },
  { key: "discount", header: "DISC (%)" },
  { key: "amount", header: "Amount" },
  { key: "gstPercentage", header: "GST %" },
  { key: "supplierName", header: "Supplier Name" },
  { key: "supplierAddress", header: "Supplier Address" },
  { key: "supplierEmail", header: "Supplier Email" },
  { key: "supplierMobile", header: "Contact Number" },
  { key: "supplierGSTIN", header: "Supplier GSTIN" },
  { key: "receiverName", header: "Reciever Name" },
  { key: "receiverAddress", header: "Reciever Address" },
  { key: "receiverGSTIN", header: "Reciever GSTIN" },
  { key: "invoiceNumber", header: "Invoice Number" },
  { key: "invoiceDate", header: "Invoice Number" },
  { key: "billingPeriod", header: "Billing Period" },
];

export const convertToCSV = () =>
  Effect.gen(function* () {
    let products = [];
    for (let i in TabulerData) {
      products.push({
        ...TabulerData[i],
        ...VendorDetils,
      });
    }

    const csv = stringify(products, {
      header: true,
      columns,
    });

    yield* Effect.tryPromise(() => Bun.write("../output/products.csv", csv));
  });
// console.log(products)
