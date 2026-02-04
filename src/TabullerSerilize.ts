import { PDF } from "./chunk";

type Product = {
    srNo: number;
    description: string | undefined;
    orderNo: string | undefined;
    hsn: string | undefined;
    qty: number;
    rate: number;
    discount: string | undefined;
    amount: number;
};

export function extractProducts(text: string): Product[] {
    
    const productRegex =
        /(\d+)\s+([\s\S]*?)\n([A-Z]{2}\d{9})\s+(\d{8})\s+(\d+)\s+([\d.]+)\s+(\d+%)\s+([\d.]+)/g;

    const products: Product[] = [];

    for (const match of text.matchAll(productRegex)) {
        const [
            ,
            srNo,
            description,
            orderNo,
            hsn,
            qty,
            rate,
            discount,
            amount,
        ] = match;
      
        products.push({
            srNo: Number(srNo),
            description: description || ""
                .replace(/\s+/g, " ")
                .trim(),
            orderNo,
            hsn,
            qty: Number(qty),
            rate: Number(rate),
            discount,
            amount: Number(amount),
        });
    }

    return products;
}


export const TabulerData = extractProducts(PDF?.Second || "");
