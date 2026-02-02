import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import api from './api.js'

const my_path = import.meta.dirname;
const FE = path.join(my_path, '../frontend');
const API_KEY = api;
//unsafe method

function getExt(ext){
    const types = {
        ".js":"text/javascript",
        ".css":"text/css",
        ".json":"application/json",
        ".png":"image/png",
        ".jpg":"image/jpeg",
        ".jpeg":"image/jpeg",
        ".gif":"image/gif",
        ".svg":"image/svg+xml"
    }

    return types[ext.toLowerCase()] || "text/html"
}

const message = `You are a Computer science teacher that explains complex computer science concepts easily. You will 
be given an array of questions each related to different concept of the subject. You should explain the concepts and 
give the answers of those questions. Your response should be no more than 50 words.
`
async function report(repo_data){
    const respond = await fetch("https://router.huggingface.co/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-20b:groq",
                messages: [
                    {role: "system",
                    content: message},
                    {role: "user", 
                    content: repo_data}
                ]
            })
        }
    );

    const rep = await respond.json();
    return (rep.choices[0].message.content);
}

const server = http.createServer(async (req,res)=>{
    if (!req.url.startsWith("/questions") && !req.url.startsWith("/ai") ){
        const file_paths = path.join(FE, req.url === "/" ? "index.html" : req.url);
        const ext = path.extname(file_paths);
        const cntType = getExt(ext);

        try{
            const content = await fs.readFile(file_paths);
            res.statusCode = 200;
            res.setHeader("Content-Type", cntType);
            res.end(content)
        }catch(err){
            res.statusCode = 404;
            res.setHeader("Content-Type", "text/plain");
            res.end("Page not found!")
        }
    }else if (req.url.startsWith("/questions")){
        const questionDB = path.join(my_path, "./questions.json");
        const jsonData = await fs.readFile(questionDB, 'utf-8');

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(jsonData)
    }else if(req.url.startsWith("/ai") && req.method === 'POST'){

        try{
            let packet = '';

            for await(const chunk of req){
                packet += chunk;
            }

            const parsedData = JSON.parse(packet);

            const ai_response = await Promise.all(
                parsedData.map(p => report(p))
            );

            const responsePayload = {
                success: true,
                summaries: ai_response
            };

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");            
            res.end(JSON.stringify(responsePayload));
        }catch(err){
            res.statusCode = 503;
            res.setHeader("Content-Type","text/plain");
            res.end()
        }

    }else{
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");
        res.end("Page not found!")        
    }
});

server.listen(3000, ()=> console.log("Server running on port 3000"))