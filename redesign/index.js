/*let triangle = 5;

for (let i = 0; i <= 5; ++i){
    switch(i){
        case 1:
            console.log('#');
            break;
        case 2:
            console.log('##');
            break;
        case 3:
            console.log("###");
            break;
        case 4:
            console.log('####');
            break;
        case 5:
            console.log('#####');
            break;
        default:
            console.log("unknown");
            break;
    }
}

const x = 100;
for(let i = 0; i <= x; ++i){
    if(i%3===0){
        if(i%5===0){
            console.log("FizzBuzz");
        }else{
            console.log("Fizz");
        }
    }else{
        console.log(i);
    }
}*/

/*const size = 2;

for(let i = 0; i <= size; ++i){
    if(i !== '\0' ){
        if(i % 2 === 0){
            console.log("# # # # ");
        }else{
            console.log(" # # # #");
        }
        
    }else{
        console.log("\n");
    }
}*/
/*const x = 13
function findSolution(target){
    function find(current, history){
        if(current == target){
            return history;
        }else if(current > target){
            return null;
        }else{
            return find(current + 5, `(${history}) + 5`) || find(current * 3, `(${history}) * 3`);
        }
    }
    return find(1, "1");
}
console.log(findSolution(x));*/
//inventory 
/*function printFarmInventory(cows, chickens){
    let cowString = String(cows);
    while(cowString.length<6){
        cowString = "0" + cowString;
    }
    console.log(`${cowString} Cows`);
    let chickenString = String(chickens);
    while(chickenString.length<6){
        chickenString = "0" + chickenString;
    }
    console.log(`${chickenString} Chickens`);
}
printFarmInventory(7, 11);
///.........................................
function zeroPad(number, width){
    let string = String(number);
    while(string.length < width){
        string= "0" + string;
    }
    return string;
}
function printFarmInventory(cows, chickens, pigs){
    console.log(`${zeroPad(cows, 3)} Cows`);
    console.log(`${zeroPad(chickens, 3)} Chickens`);
    console.log(`${zeroPad(pigs, 3)} Pigs`);
}
printFarmInventory(7, 16, 3);
*/

/*const isEven = (a) => {
    if(a < 0){
        console.log("use a number greater than 0");
    }else{
        if(a % 2 === 0){
            console.log("true");
        }else if((a-2) % 2 === 0){
            console.log("true");
        }else {
            console.log("false");
        }
    }
}

console.log(isEven(-2));*/
//const a = "Be the New Boss In BnBs";
/*const countBs = () => {
    let str = "Be the New Boss In BnBs";
    let result = 0;
    upperCase = str.length - str.replace(/[A-Z]/g,'').length;
    for(let i = 0; i < upperCase; ++i){
        result++;
    }
    return result;
}
console.log(countBs());
*/
//let listOfNumbers = [2, 3, 5, 7, 11];
//
//console.log(listOfNumbers[0 + 4]);
//console.log(listOfNumbers.length)
//let ch = "where";
//console.log(ch.toUpperCase());

/*let journal =[
    {
        squirrel : false,
        events : ["work", "touched tree", "pizza", "running"]
    },
    {
        squirrel : false,
        events : ["work", "touched tree", "brushed teeth", "cauliflower"]
    },
    {
        squirrel : false,
        events : ["work", "touched tree", "lasagna", "ice cream"]
    },
    {
        squirrel : true,
        events : ["weekend", "cycling", "break", "beer", "peanuts"]
    }
] ;

function addEntry(events, squirrel){
    journal.push({events, squirrel});
}
//addEntry(["work", "touched tree", "pizza", "running"], false)
//console.log(journal);
//coefficient function
function phi(table){
    return (table[3] * table[0] - table[2] * table[1]) / 
        Math.sqrt((table[2] + table[3]) * 
                  (table[0] + table[1]) * 
                  (table[1] + table[3]) * 
                  (table[0] + table[2]));
}
//console.log(phi([76, 9, 4, 1]));

//a two-by-two for a specific event from the journal it loops over all the entries
// and tally how many times the event occurs in relation to the transformation
function tableFor(event, journal){
    let table = [0, 0, 0, 0];
    for (let i = 0; i < journal.length; i++){
        let entry = journal[i], index = 0;
        if(entry.events.includes(event)) index += 1;
        if (entry.squirrel) index += 2;
        table[index] += 1;
    }
    return table;
}

//console.log(tableFor("pizza", journal))

//compute correlation for every type of event that occurs in the data set
function journalEvents(journal){
    let events = [];
    for (let entry of journal){
        for (let event of entry.events){
            if (!events.includes(event)){
                events.push(event);
            }
        }
    }
    return events;
}

//console.log(journalEvents(journal));
for (let event of journalEvents(journal)){
    let correlation = phi(tableFor(event, journal));
    if (correlation > 0.1 || correlation <-0.1){
        console.log(event + ":", correlation);
    }
}
for (let entry of journal){
    if(entry.events.includes("peanuts") && !entry.events.includes("brushed teeth")){
        entry.events.push("peanut teeth");
    }
}
console.log(phi(tableFor("peanut teeth", journal)));
*/

// todo list
//let todoList = [];
//function remember(task){
//    todoList.push(task);
//}
//function getTask(){
//    return todoList.shift();
//}
//function rememberUrgently(task){
//    todoList.unshift(task);
//}
/*let numbers = [4,8,9,3,13,14,55,-9];
function max(...numbers){
    let result = -Infinity;
    for(let number of numbers){
        if(number > result) result = number;
        return result;
    }
}
console.log(max(...numbers));
*/
function phi([n00, n01, n10, n11]){
    return (n11 * n00 - n10 * n01) /
        Math.sqrt((n10 + n11) * (n00 + n01) *
                  (n01 + n11) * (n00 + n10));
}