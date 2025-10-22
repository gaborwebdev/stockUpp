import stockData from './updated.json' with { type: 'json' };

import fs from 'fs';

let stock = stockData;

let newStockData = [
/*     {
        category: "üveges_üdítõk",
        items:[

        ]
    } */
];

stock.map((item, index) => {
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

if ( item.category === "üveges_üdítõk" ) {
    console.log(index);

    item.items.map(subItem => {

        // add baseUnit
        // áviz
        if ( subItem.itemName.includes("XXX0,33") ) {      
            subItem.baseUnit = "bottle";
            subItem.measurementType.bottle.toBase = 1;
            subItem.measurementType.bottle.unit = "bottle";
            subItem.measurementType.crate.toBase = 24;
            subItem.measurementType.crate.unit = "crate";
        } else if ( subItem.itemName.includes("XXX0,75") ) {
            delete subItem.measurementType; 
            subItem.baseUnit = "bottle";
            subItem.measurementType = {
                bottle: {
                    maxCount: 29,
                    step: 1,
                    unit: "bottle",
                    toBase: 1
                }
            }
        } else {
            delete subItem.measurementType;
            subItem.baseUnit = "bottle";
            subItem.measurementType = {
                bottle: {
                    maxCount: 23,
                    step: 1,
                    unit: "bottle",
                    toBase: 1
                },
                crate: {
                    maxCount: 15,       
                    step: 1,
                    unit: "crate",
                    toBase: 24
                }

            };
        }


            
        
    
    
        // delete subItem.measurementType[Object.keys(subItem.measurementType)[0]].multiplier;
    
        //subItem.measurementType[Object.keys(subItem.measurementType)[0]].step = 1
    
            //console.log(subItem.itemName, Object.keys(subItem.measurementType)[0], subItem.measurementType[Object.keys(subItem.measurementType)[0]].multiplier,  subItem.measurementType[Object.keys(subItem.measurementType)[0]].step);
    
    
       //console.log("mt: ", subItem.measurementType);
       console.log(subItem);
    });
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


    //newStockData[0].items.push(item);

}
);

//console.log(stock[8]);

let newData = newStockData;

fs.writeFileSync("üd2.json", JSON.stringify(stock[8], null, 2), "utf-8");
// console.log(stock[0].items.forEach((subItem) => { console.log(subItem.measurementType);}));

console.log("✅ JSON kiírva!");


