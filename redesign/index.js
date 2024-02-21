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
/*function phi([n00, n01, n10, n11]){
    return (n11 * n00 - n10 * n01) /
        Math.sqrt((n10 + n11) * (n00 + n01) *
                  (n01 + n11) * (n00 + n10));
}
*/
/*
//range function
function range(start, end, steps = start < end ? 1 : -1){
    let xy = [];
    if (steps > 0){
        for(let i = start; i <= end; i+=steps){
            xy.push(i);
        }
    }else {
        for(let i = start; i >= end; i+=steps){
            xy.push(i);
        }
    }
    return xy;
}
function sum(...numbers){
    let sum = 0;
    for(let i = 0; i < numbers.length; i++){
        sum +=numbers[i]
    }
    return sum;
}
console.log(sum.apply(null,range(1, 10, 6))); // apply is used to pass the array as a function paramenter
//console.log(range(10, 1, -1));
*/
/*
//reversing number arguments and outpiting in an array

function reverseArray(...numbers){
    let revers = [];
    for (let i = numbers.length -1; i >= 0; i--) {
        const indexValue = numbers[i];
        revers.push(indexValue);
    }
    return revers;
}
console.log(reverseArray(1,2,3,4,5,6,7,8,9));
*/
//the repeat function
function repeat(n, action){
    for (let i = 0; i < n; i++){
        action(i);
    }
}
/*let labels = [];
repeat(5, i => {
    labels.push(`Unit ${i + 1}`);
});
console.log(labels);*/
/*function noisy(f){
    return(...args) => {
        console.log("calling with", args);
        let result = f(...args);
        console.log("called with", args, ", returned", result);
        return result;
    };
}

noisy(Math.min)(3, 2, 1);
*/
//test argorithm  to use in project
//function unless(test, then){
//    if(!test) then();
//}
//repeat(10, n=>{
//    unless(n % 2 ==1, () => {
//        console.log(n, "is even");
//    });
//});
//function to filter an array and decides which elements passed the test
//and creates a new array for the passed element
/*function filter(array, test){
    let passed = [];
    for (let element of array){
        if(test(element)){
            passed.push(element);
        }
    }
    return passed;
}
*/
//class Rabbit{
//    constructor(type){
//        this.type = type;
//    }
//    speak(line){
//        console.log(`The ${this.type} rabit says '${line}'`);
//    }
//}
//
//let killerRabbit = new Rabbit("killer");
//let blackRabbit = new Rabbit("black");
/*let ages = {
    Boris: 39,
    Liang: 22,
    Julia: 62
};

console.log(`Julia is ${ages["Julia"]}`);
*/
/*
//-----------------------------------------------------
class MatrixIterator{
    constructor(matrix){
        this.x = 0;
        this.y = 0;
        this.matrix = matrix;
    }
    next(){
        if (this.y == this.matrix.height) return { done: true};

        let value = {
            x: this.x,
            y: this.y,
            value: this.matrix.get(this.x, this.y)
        };
        this.x++;
        if(this.x == this.matrix.width){
            this.x = 0;
            this.y++;
        }
        return {value, done: false};
    }
}
*/

/*class Temperature{
    constructor(celsius){
        this.celsius = celsius;        
    }
    get fahrenheit(){
        return this.celsius * 1.8 + 32;
    }
    set fahrenheit(value){
        this.celsius = (value - 32) / 1.8;
    }
    static fromFahrenheit(value){
        return new Temperature((value - 32) / 1.8);
    }
}

let temp = new Temperature(22);
console.log(temp.fahrenheit);
temp.fahrenheit = 86;
console.log(temp.celsius);
*/
/*class Matrix{
    constructor(width, height, element = (x, y) => undefined){
        this.width = width;
        this.height = height;
        this.content = [];

        for (let y = 0; y < height; y++){
            for (let x = 0; x < width; x++){
                this.content[y * width + x] = element(x, y);
            }
        }
    }
    get(x, y){
        return this.content[y * this.width + x];
    }
    set(x, y, value){
        this.content[y * this.width + x] = value;
    }
}

class SymmetricMatrix extends Matrix {
    constructor(size, element = (x, y) => undefined){
        super(size, size, (x, y) => {
            if(x < y) return element(y, x);
            else return element(x, y);
        });
    }
    set(x, y, value){
        super.set(x, y, value);
        if(x != y){
            super.set(y, x, value);
        }
    }
}
let matrix = new SymmetricMatrix(5, (x, y) => `${x},${y}`);
console.log(matrix.get(2, 3));
*/
/*
const fs = require('fs');
const { callbackify } = require('util');
// check the statistics of the file
fs.stat('index.html', function(err, stats){
    if(err){ throw err;}
    console.log(stats);
});

function openAndWriteToLogs(writeBuffer, callback){
    fs.open('./logs/log.txt', 'a+', function opened(err, fd){
        if(err){ throw err; }
        function notifyError(err){
            fs.close(fd, function(){
                callback(err);
            });
        }
        const bufferOffset = 0,
              bufferLength = writeBuffer.length,
              filePosition = null;
        fs.write(fd, writeBuffer, bufferOffset, bufferLength, filePosition,
            function wrote(err, writeBytes){
            if(err){ return notifyError(err); }
            fs.close(fd, function(){
                callback(err);
            });
        });
    });
}
openAndWriteToLogs(new Buffer.from('writing system logs'), function done(err){
    if(err){
        console.log("error while opening and writing:", err.message);
        return;
    }
    console.log('All done with no errors')
})
*/
const Data = {
    render: ()=>{
        return `
            <html>
                <title> hello</title>
                <body> test the system</body>
            </html>
        `;
    }
};

module.exports = Data;