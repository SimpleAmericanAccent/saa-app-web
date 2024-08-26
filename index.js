import http from 'http';
import fs from 'fs/promises';
import url from 'url';
import path from 'path';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(__filename, __dirname);

const PORT = process.env.PORT;

const server = http.createServer(async (req, res) => {
    try {
        // Check if GET request
        if (req.method === 'GET') {
            let filePath;
            let fileContentType;
            if (req.url === '/') {
                filePath = path.join(__dirname, 'public', 'index.html');
                fileContentType = 'text/html';
            }
            else if (req.url === '/about') {
                filePath = path.join(__dirname, 'public', 'about.html');
                fileContentType = 'text/html';
            }
            else if (req.url === '/script.js') {
                filePath = path.join(__dirname, 'public', 'script.js');
                fileContentType = 'application/javascript';
            }
            else if (req.url === '/JSON/issues2.json') {
                filePath = path.join(__dirname, 'public', 'JSON/issues2.json');
                fileContentType = 'application/json';
            }
            else if (req.url === '/JSON/speech3.json') {
                filePath = path.join(__dirname, 'public', 'JSON/speech3.json');
                fileContentType = 'application/json';
            }
            else if (req.url === '/audio/audio3.mp3') {
                filePath = path.join(__dirname, 'public', 'audio/audio3.mp3');
                fileContentType = 'audio/mpeg';
            }
            else if (req.url === '/JSON/annotations.json') {
                filePath = path.join(__dirname, 'public', 'JSON/annotations.json');
                fileContentType = 'application/json';
            }
            else {
                throw new Error('Error');
            }

            const data = await fs.readFile(filePath);
            res.setHeader('Content-Type', fileContentType);
            res.write(data);
            res.end();
        } else {
            throw new Error('Method not allowed');
        }
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
    }


    


    // console.log(req.url);
    // console.log(req.method);

    // res.writeHead(200, { 'Content-Type': 'text/html' });
    // res.end('<h1>Hello world</h1>');
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


// console.log("hello");