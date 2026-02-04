import { cons } from "effect/List";
import { TabulerData } from "./TabullerSerilize";
import { VendorDetils } from "./vendorSerilaize";

let finalData = [];
for(let i in TabulerData){
    finalData.push(
        {
            ...TabulerData[i],...VendorDetils
        }
    )
}
console.log(finalData)