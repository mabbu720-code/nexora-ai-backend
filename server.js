const http=require("http");
const {GoogleGenAI}=require("@google/genai");

const PORT=process.env.PORT||3000;
const ai=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});

const server=http.createServer(async(req,res)=>{
res.setHeader("Access-Control-Allow-Origin","*");
res.setHeader("Access-Control-Allow-Methods","GET,POST,OPTIONS");
res.setHeader("Access-Control-Allow-Headers","Content-Type");

if(req.method==="OPTIONS"){res.writeHead(204);return res.end();}

if(req.method==="GET"&&req.url==="/"){
res.writeHead(200,{"Content-Type":"application/json"});
return res.end(JSON.stringify({status:"Nexora backend is running"}));
}

if(req.method==="POST"&&req.url==="/api/chat"){
let body="";
req.on("data",chunk=>body+=chunk);
req.on("end",async()=>{
try{
const data=JSON.parse(body);
const message=String(data.message||"").trim();
if(!message){
res.writeHead(400,{"Content-Type":"application/json"});
return res.end(JSON.stringify({error:"Message is required"}));
}
const result=await ai.models.generateContent({
model:"gemini-3.8-flash",
contents:message,
config:{
systemInstruction:"You are Nexora AI, a helpful and friendly AI assistant. Give clear and easy-to-understand answers. Created by Abbu and Ibad."
}
});
res.writeHead(200,{"Content-Type":"application/json"});
res.end(JSON.stringify({reply:result.text}));
}catch(error){
console.error(error);
res.writeHead(500,{"Content-Type":"application/json"});
res.end(JSON.stringify({error:"Nexora AI could not generate a response"}));
}
});
return;
}

res.writeHead(404,{"Content-Type":"application/json"});
res.end(JSON.stringify({error:"Not found"}));
});

server.listen(PORT,"0.0.0.0",()=>console.log(`Nexora backend running on port ${PORT}`));
