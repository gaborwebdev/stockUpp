import stockData from './items.json' with { type: 'json' };

import fs from 'fs';

let stock = stockData;

let newStockData = [
    {
        category: "üveges_üdítõk",
        items:[

        ]
    }
];

stock.forEach(item => {
    if(item.itemGroup === "üveges_üdítõk") {
        item.itemOnStock = 0;
        delete item.itemType;
        delete item.itemUnit;

        

                    item.measurementType = {
                üveg: {
                    maxCount: 23,       // popup 1–23
                    multiplier: 1 // 1 rekeszben 24 üveg
                },
                rekesz: {
                    maxCount: 9,          // popup 1–9
                    multiplier: 24
                }

        }

 
/* 
         
         if ( item.itemName.includes("0,33") ) {


            
            item.measurementType = {
                bottle: {
                    maxCount: 23,       // popup 1–23
                    multiplier: 1 // 1 rekeszben 24 üveg
                },
                crate: {
                    maxCount: 9,          // popup 1–9
                    multiplier: 24
                }
        }
    }  else  if ( item.itemName.includes("0,5") ) {
                item.measurementType = {
            bottle: {
                maxCount: 19,       // popup 1–23
                multiplier: 1 // 1 rekeszben 24 üveg
            },
            crate: {
                maxCount: 3,          // popup 1–9
                multiplier: 20
            }

        }
     } else if ( item.itemName.includes("Csapolt") ) {
            item.measurementType = {
                liter: {
                    maxCount: 29,       // popup 1–23
                    multiplier: 1 // 1 rekeszben 24 üveg
                },
                keg: {
                    maxCount: 3,          // popup 1–9
                    multiplier: 30
                }
            }
        } else {
            item.measurementType = {
                bottle: {
                    maxCount: 19,       // popup 1–23
                    multiplier: 1 // 1 rekeszben 24 üveg
                },
                crate: {
                    maxCount: 3,          // popup 1–9
                    multiplier: 20
                }

            }
    } 
 
  */



    ///


    newStockData[0].items.push(item);

}
});



let newData = newStockData;

fs.writeFileSync("üveges_üdítõk.json", JSON.stringify(newData, null, 2), "utf-8");
console.log(newData);

console.log("✅ JSON kiírva!");


