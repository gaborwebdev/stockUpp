import stockData from './stockData.json' with { type: 'json' };

import fs from 'fs';

let stock = stockData;

let newStockData = [
/*     {
        category: "üveges_üdítõk",
        items:[

        ]
    } */
];

stock.map(item => {
/*     if(item.itemGroup === "üveges_üdítõk") {
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

        } */
// console.log("ITEM: ", item.category);

item.items.map(subItem => {


    delete subItem.measurementType[Object.keys(subItem.measurementType)[0]].multiplier;

    subItem.measurementType[Object.keys(subItem.measurementType)[0]].step = 1

        console.log(subItem.itemName, Object.keys(subItem.measurementType)[0], subItem.measurementType[Object.keys(subItem.measurementType)[0]].multiplier,  subItem.measurementType[Object.keys(subItem.measurementType)[0]].step);


   //console.log("mt: ", subItem.measurementType);
});
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


    // newStockData[0].items.push(item);

}
);



let newData = newStockData;

//fs.writeFileSync("updated.json", JSON.stringify(stock, null, 2), "utf-8");
// console.log(stock[0].items.forEach((subItem) => { console.log(subItem.measurementType);}));

console.log("✅ JSON kiírva!");


