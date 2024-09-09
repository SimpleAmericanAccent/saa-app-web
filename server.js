import http from 'http';
import https from 'https';
import fs from 'fs/promises';
import url from 'url';
import path from 'path';
import express from 'express';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 5000;
// const API_BASE_URL = process.env.API_BASE_URL;
// const API_KEY_NAME = process.env.API_KEY_NAME;
const API_KEY_VALUE = process.env.API_KEY_VALUE;

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.all('/api*', (req, res) => {
    // res.send('api');

    // make request to airtable api

    let pathSegments = req.url.split('/');
    let pathSegmentsFirst = pathSegments[1];
    let pathSegmentsExceptFirst = pathSegments.slice(2,pathSegments.length);
    let pathMinusFirstSegment = path.join.apply(null, pathSegmentsExceptFirst).replace('\\','/');

    // Uncomment if you want to troubleshoot types
    // console.log(pathSegments.constructor == Array);
    // console.log(typeof pathSegmentsFirst);
    // console.log(pathSegmentsExceptFirst.constructor == Array);
    // console.log(typeof pathMinusFirstSegment);

    // Uncomment for troubleshooting
    // console.log("pathSegments: " + pathSegments);
    // console.log("pathSegmentsFirst: " + pathSegmentsFirst);
    // console.log("pathSegmentsExceptFirst: " + pathSegmentsExceptFirst);
    // console.log("pathMinusFirstSegment: "+pathMinusFirstSegment);


    if (req.method === 'GET') {
        const postData = '';
        const options = {
            hostname: 'api.airtable.com',
            path: `/v0/app7v05YMhvA8hpEY/${pathMinusFirstSegment}`,
            method: 'GET',
            headers: {
                // 'Content-Type': 'text/plain',
                'Authorization': `Bearer ${API_KEY_VALUE}`
            }
        };

        // uncomment to help diagnose authorization issue if needed:
        // console.log({'Authorization': `Bearer ${API_KEY_VALUE}`});

        const req2 = https.request(options, (res2) => {
            // console.log(`STATUS: ${res2.statusCode}`);
            // console.log(`HEADERS: ${JSON.stringify(res2.headers)}`);
            res2.setEncoding('utf8');
            res.setHeader('Content-Type', 'application/json');
            res2.on('data', (chunk) => {
                res.write(chunk);
                // console.log(`BODY: ${chunk}`);
            });
            res2.on('end', () => {
                // console.log('No more data in response.');
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
    else if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        })
        req.on('end', () => {
            console.log(body);

            const options = {
                hostname: 'api.airtable.com',
                path: `/v0/app7v05YMhvA8hpEY/${pathMinusFirstSegment}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY_VALUE}`
                }
            };

            // uncomment to help diagnose authorization issue if needed:
            // console.log({'Authorization': `Bearer ${API_KEY_VALUE}`});

            const req2 = https.request(options, (res2) => {
                // console.log(`STATUS: ${res2.statusCode}`);
                // console.log(`HEADERS: ${JSON.stringify(res2.headers)}`);
                let body2 = '';
                res2.setEncoding('utf8');
                res.setHeader('Content-Type', 'application/json');
                res2.on('data', (chunk2) => {
                    // res.write(chunk2);
                    body2 += chunk2.toString();
                    // console.log(`BODY: ${chunk}`);
                });
                res2.on('end', () => {
                    // console.log('No more data in response.');
                    res.write(body2);
                    console.log(body2);
                    res.end();
                });
            });
            req2.write(body);
            req2.end();
            // show/send/display the airtable api response to user
            // may later make this do something else or in the background instead, not sure
            // res.setHeader('Content-Type', 'application/json');
            // res.write(JSON.stringify('hi'));
            // res.end();
        })
    }
    else if (req.method === 'PATCH') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        })
        req.on('end', () => {
            console.log(body);

            const options = {
                hostname: 'api.airtable.com',
                path: `/v0/app7v05YMhvA8hpEY/${pathMinusFirstSegment}`,
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY_VALUE}`
                }
            };

            // uncomment to help diagnose authorization issue if needed:
            // console.log({'Authorization': `Bearer ${API_KEY_VALUE}`});

            const req2 = https.request(options, (res2) => {
                // console.log(`STATUS: ${res2.statusCode}`);
                // console.log(`HEADERS: ${JSON.stringify(res2.headers)}`);
                res2.setEncoding('utf8');
                res.setHeader('Content-Type', 'application/json');
                res2.on('data', (chunk2) => {
                    res.write(chunk2);
                    // console.log(`BODY: ${chunk}`);
                });
                res2.on('end', () => {
                    // console.log('No more data in response.');
                    res.end();
                });
            });
            req2.write(body);
            req2.end();
            // show/send/display the airtable api response to user
            // may later make this do something else or in the background instead, not sure
            // res.setHeader('Content-Type', 'application/json');
            // res.write(JSON.stringify('hi'));
            // res.end();
        })
    }
    else if (req.method === 'DELETE') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        })
        req.on('end', () => {
            console.log(body);

            const options = {
                hostname: 'api.airtable.com',
                path: `/v0/app7v05YMhvA8hpEY/${pathMinusFirstSegment}`,
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${API_KEY_VALUE}`
                }
            };

            // uncomment to help diagnose authorization issue if needed:
            // console.log({'Authorization': `Bearer ${API_KEY_VALUE}`});

            const req2 = https.request(options, (res2) => {
                // console.log(`STATUS: ${res2.statusCode}`);
                // console.log(`HEADERS: ${JSON.stringify(res2.headers)}`);
                let body2 = '';
                res2.setEncoding('utf8');
                res.setHeader('Content-Type', 'application/json');
                res2.on('data', (chunk2) => {
                    // res.write(chunk2);
                    body2 += chunk2.toString();
                    // console.log(`BODY: ${chunk}`);
                });
                res2.on('end', () => {
                    // console.log('No more data in response.');
                    res.write(body2);
                    console.log(body2);
                    res.end();
                });
            });
            req2.write(body);
            req2.end();
            // show/send/display the airtable api response to user
            // may later make this do something else or in the background instead, not sure
            // res.setHeader('Content-Type', 'application/json');
            // res.write(JSON.stringify('hi'));
            // res.end();
        })
    }
});

http.createServer(app)
    .listen(port, () => {
        console.log(`Server running on port ${port}`);
    });