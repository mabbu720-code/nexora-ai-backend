const http=require("http");

const PORT=process.env.PORT||3000;

const server=http.createServer((req,res)=>{
res.writeHead(200,{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"});
res.end(JSON.stringify({status:"Nexora backend is running"}));
});

server.listen(PORT,"0.0.0.0",()=>{
console.log(`Nexora backend running on port ${PORT}`);
});
