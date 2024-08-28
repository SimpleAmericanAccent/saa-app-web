import http from 'http';
import https from 'https';
import fs from 'fs/promises';
import url from 'url';
import path from 'path';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(__filename, __dirname);

// Env vars
const PORT = process.env.PORT;
const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY_NAME = process.env.API_KEY_NAME;
const API_KEY_VALUE = process.env.API_KEY_VALUE;

const server = http.createServer(async (req, res) => {
    try {
        // Check if GET request
        if (req.method === 'GET') {
            let filePath;
            let fileContentType;
            if (req.url !== '/api') {    
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
            }
            else if (req.url === '/api') {

                // make request to airtable api (TBD)
                // TBD - need to figure out how to do this

                const postData = '';

                const options = {
                    hostname: 'api.airtable.com',
                    path: '/v0/app7v05YMhvA8hpEY/tblhIVhLe7Yhke7Xy',
                    method: 'GET',
                    headers: {
                        // 'Content-Type': 'text/plain',
                        'Authorization': `Bearer ${API_KEY_VALUE}`
                    }
                };

                // uncomment to help diagnose authorization issue if needed:
                // console.log({'Authorization': `Bearer ${API_KEY_VALUE}`});

                const req2 = https.request(options, (res2) => {
                    console.log(`STATUS: ${res2.statusCode}`);
                    console.log(`HEADERS: ${JSON.stringify(res2.headers)}`);
                    res2.setEncoding('utf8');
                    res.setHeader('Content-Type', 'application/json');
                    res2.on('data', (chunk) => {
                        res.write(chunk);
                        console.log(`BODY: ${chunk}`);
                    });
                    res2.on('end', () => {
                        console.log('No more data in response.');
                        res.end();
                    });
                });

                req2.write(postData);
                req2.end();




                // show/send/display the airtable api response to user
                // may later make this do something else or in the background instead, not sure
                // res.setHeader('Content-Type', 'application/json');
                // res.write(JSON.stringify('hi'));
                // res.end();
            }
            else {
                throw new Error('Error');
            }
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