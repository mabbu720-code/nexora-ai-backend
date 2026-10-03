const http=require("http");
const {GoogleGenAI}=require("@google/genai");

const PORT=process.env.PORT||3000;
const API_KEY=process.env.GEMINI_API_KEY;

let ai=null;
if(API_KEY) ai=new GoogleGenAI({apiKey:API_KEY});

function send(res,status,data){
res.writeHead(status,{"Content-Type":"application/json","Cache-Control":"no-store"});
res.end(JSON.stringify(data));
}

function readBody(req){
return new Promise((resolve,reject)=>{
let body="";
req.on("data",chunk=>{
body+=chunk;
if(body.length>1000000){
reject(new Error("Request too large"));
req.destroy();
}
});
req.on("end",()=>resolve(body));
req.on("error",reject);
});
}

async function generateReply(message){
if(!ai) throw new Error("GEMINI_API_KEY is missing");

const result=await ai.models.generateContent({
model:"gemini-3.8-flash",
contents:message,
config:{
systemInstruction:"You are Nexora AI, a helpful and friendly AI assistant. Give clear, useful and easy-to-understand answers. Remember that Nexora AI was created by Abbu and Ibad."
}
});

const reply=String(result.text||"").trim();
if(!reply) throw new Error("Empty AI response");
return reply;
}

const server=http.createServer(async(req,res)=>{
res.setHeader("Access-Control-Allow-Origin","*");
res.setHeader("Access-Control-Allow-Methods","GET,POST,OPTIONS");
res.setHeader("Access-Control-Allow-Headers","Content-Type");

if(req.method==="OPTIONS"){
res.writeHead(204);
return res.end();
}

if(req.method==="GET"&&req.url==="/"){
return send(res,200,{
status:"online",
service:"Nexora AI Backend"
});
}

if(req.method==="GET"&&req.url==="/health"){
return send(res,200,{
status:"ok",
aiConfigured:Boolean(API_KEY)
});
}

if(req.method==="POST"&&req.url==="/api/chat"){
try{
const raw=await readBody(req);
let data;

try{
data=JSON.parse(raw);
}catch{
return send(res,400,{error:"Invalid JSON"});
}

const message=String(data.message||"").trim();

if(!message){
return send(res,400,{error:"Message is required"});
}

if(message.length>20000){
return send(res,400,{error:"Message is too long"});
}

console.log("AI request received");

const reply=await generateReply(message);

console.log("AI response generated");

return send(res,200,{reply});
}catch(error){
console.error("Nexora backend error:",error);

const message=String(error?.message||"Unknown error");

if(message.includes("GEMINI_API_KEY")){
return send(res,500,{error:"Gemini API key is not configured"});
}

return send(res,500,{
error:"Nexora AI could not generate a response"
});
}
}

return send(res,404,{error:"Not found"});
});

server.listen(PORT,"0.0.0.0",()=>{
console.log(`Nexora backend running on port ${PORT}`);
});
