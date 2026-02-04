import { TabulerData } from "./TabullerSerilize";
import { VendorDetils } from "./vendorSerilaize";
import { stringify } from "csv-stringify/sync";


const columns = [
  "srNo",
  "description",
  "orderNo",
  "hsn",
  "qty",
  "rate",
  "discount",
  "amount",
  "gstPercentage",
  "supplierName",
  "supplierAddress",
  "supplierEmail",
  "supplierMobile",
  "supplierGSTIN",
  "receiverName",
  "receiverAddress",
  "receiverGSTIN",
  "invoiceNumber",
  "invoiceDate",
  "billingPeriod",
  
];

let  products = [];
for(let i in TabulerData){
    products.push(
        {
            ...TabulerData[i],...VendorDetils
        }
    )
}

const csv = stringify(products, {
  header: true,
  columns
});

await Bun.write("../output/products.csv", csv);
// console.log(products)

