const http = require("http");
const {EventEmitter} = require("events");
const NS_PER_SEC = 1e9;
if(process.argv[2] && Number.parseInt(process.argv[2]) && Number.parseInt(process.argv[2])<11){
  var val = Number.parseInt(process.argv[2]);
  console.log("Executing "+val+" requests.");
}else{
  var val = 10;
  console.log("No argument parsed or argument was to high (limit: 10). Executing"+"(default) number of requests.");
}
const wdh = val;
class myArray extends Array {
  constructor(emitlength, ...items){
    super(...items);
    this.emitter = new EventEmitter();
    this.emitlength = emitlength;
  }
  push(...items){
    let length = super.push(...items);
    if(this.emitlength === length){
      this.emitter.emit("length");
    }
    return length;
  }
}
var Totaltimes = new myArray(wdh);
Totaltimes.emitter.on("length", ()=>{
  let time = 0;
  Totaltimes.forEach((val, index, array)=>{
    time += val[0]*NS_PER_SEC+val[1];
  });
  let avg = time/Totaltimes.length;
  let totalString = "Total average: ";
  console.log(totalString+avg+" Nanoseconds");
  let avgms = avg/1e6;
  console.log(totalString+avgms+" ms");
  let avgs = avg/1e9;
  console.log(totalString+avgs+" s");
});
var localTimes = new myArray(wdh);
localTimes.emitter.on("length", ()=>{
  let time = 0;
  localTimes.forEach((val, index, array)=>{
    time += val[0]*NS_PER_SEC+val[1];
  });
  let avg = time/localTimes.length;
  let localString = "Local average: ";
  console.log(localString+avg+" Nanoseconds");
  let avgms = avg/1e6;
  console.log(localString+avgms+" ms");
  let avgs = avg/1e9;
  console.log(localString+avgs+" s");
});
function challenge1(i){
  var time = process.hrtime();
  // console.time("total "+i);  
  var req = http.request({host: "84.200.109.239", path: "/challenges/1/", method: "GET", port: 5000}, res=>{
    var local = process.hrtime();
    // console.time("local only "+i);
      res.setEncoding("utf8");
      res.on("data", chunk=>{
          // console.log(chunk);
          var send = http.request({host: "84.200.109.239", path: "/solutions/1/", port: 5000, method: "POST"}, resp=>{
            resp.setEncoding("utf8");
            resp.on("data", chunk=>{
              // console.timeEnd("total "+i);                
              Totaltimes.push(process.hrtime(time));
              if(chunk !== "Success"){
                console.log(chunk);
              }
            });
          }).on("error", e=>{
            console.log(e);
          });
          send.setHeader("content-type", "application/json");
          send.write(JSON.stringify({token: chunk}));
          send.end();
          // console.timeEnd("local only "+i); 
          localTimes.push(process.hrtime(local));         
        });
  }).on("error", e=>{
    console.log(e);
  });
  req.end();
}
function loop(loops, func){
  for(var i=1;loops>=i;i++){
    func(i);
  }
}
loop(wdh, challenge1);
