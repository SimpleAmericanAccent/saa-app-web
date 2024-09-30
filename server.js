import http from 'http';
import https from 'https';
// import fs from 'fs/promises';
import url from 'url';
import path from 'path';
import express from 'express';
import pkg from 'express-openid-connect';
const { auth, requiresAuth } = pkg;

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 5000;
// const API_BASE_URL = process.env.API_BASE_URL;
// const API_KEY_NAME = process.env.API_KEY_NAME;
const API_KEY_VALUE = process.env.API_KEY_VALUE;
const auth0_secret = process.env.AUTH0_SECRET;
const auth0_base_url = process.env.AUTH0_BASE_URL;
const auth0_client_id = process.env.AUTH0_CLIENT_ID;
const auth0_issuer_base_url = process.env.AUTH0_ISSUER_BASE_ID;
const environment_flag = process.env.ENVIRONMENT_FLAG;
const environment_internet_flag = process.env.ENVIRONMENT_INTERNET_FLAG;

const config = {
  authRequired: true,
  auth0Logout: true,
  secret: `${auth0_secret}`,
  baseURL: `${auth0_base_url}`,
  clientID: `${auth0_client_id}`,
  issuerBaseURL: `${auth0_issuer_base_url}`
}

const app = express();

if (environment_internet_flag == "online") {
    app.use(auth(config));

    app.use(function (req, res, next) {
        app.locals.user = req.oidc.user;
        // console.log(app);
        next();
    });  
}
else if (environment_flag == "offline") {
    // app.use(auth(config));

    app.use(function (req, res, next) {
        // res.locals.user = req.oidc.user;
        next();
    });  
}


app.use(express.static(path.join(__dirname, 'public')));

if (environment_internet_flag == "online") {
    app.all('/api/*', (req, res) => {
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
            // console.log(postData);
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

    app.get('/authz', requiresAuth(), (req, res) => {
        
        ///////////////////////
        ///// 1) look up people/user list in Airtable and see if can find currently logged in user. if yes, store relevant info such as which resources they have access to
        //////////////////////

        ///////////////////////
        ///// 2) look up audio list in Airtable and grab the info for the audios the currently logged in user has access to
        //////////////////////

        ///////////////////////
        ///// 3) respond with whatever info the front-end needs / is allowed to see
        //////////////////////

        
        ///////////////////////
        ///// 1
        //////////////////////
        
        let peopleObjectString = '';
        let peopleObject = {};
        let currentUserId = req.oidc.user.sub;
        let currentUserAirtable;
        let currentUserAudioReadAccess;
        let audioObjectString = '';
        let audioObject = {};
        let currentUserAudioReadAccessObject = {'records': []};
        let currentUserAudioReadAccessObjectSpeakerNames = {'records': []};
        const postData1 = '';
        let options1 = {
            hostname: 'api.airtable.com',
            path: `/v0/app7v05YMhvA8hpEY/People`,
            method: 'GET',
            headers: {
                // 'Content-Type': 'text/plain',
                'Authorization': `Bearer ${API_KEY_VALUE}`
            }
        };

        const req1 = https.request(options1, (res1) => {
            res1.setEncoding('utf8');
            res1.on('data', (chunk) => {
                peopleObjectString += chunk;
            });
            res1.on('end', () => {
                peopleObject = JSON.parse(peopleObjectString);
                for (let i=0; i < Object.keys(peopleObject.records).length; i++) {
                    let user_id = peopleObject.records[i].fields['auth0 user _id']
                    if (typeof user_id !== "undefined") {
                        if (user_id == currentUserId) {
                            currentUserAirtable = peopleObject.records[i];
                            currentUserAudioReadAccess = peopleObject.records[i].fields['Read access to audios'];
                            console.log(currentUserAirtable);
                            console.log("Airtable match found for current user's Autho0 user_id: ",user_id);
                            console.log("Current user email is: ", req.oidc.user.email);
                            console.log("Per Airtable, current user has read access to: ",currentUserAudioReadAccess);
                        }
                    }
                }

                ///////////////////////
                ///// 2) look up audio list in Airtable and grab the info for the audios the currently logged in user has access to
                //////////////////////


                
                const postData2 = '';
                let options2 = {
                    hostname: 'api.airtable.com',
                    path: `/v0/app7v05YMhvA8hpEY/Audio%20Source`,
                    method: 'GET',
                    headers: {
                        // 'Content-Type': 'text/plain',
                        'Authorization': `Bearer ${API_KEY_VALUE}`
                    }
                };

                const req2 = https.request(options2, (res2) => {
                    res2.setEncoding('utf8');
                    res2.on('data', (chunk) => {
                        audioObjectString += chunk;
                    });
                    res2.on('end', () => {
                        audioObject = JSON.parse(audioObjectString);
                        // console.log(audioObject);
                        // console.log(audioObject.records[0].id);

                        for (let i=0,k=0; i < currentUserAudioReadAccess.length; i++) {
                            // console.log(i);
                            
                        
                            for (let j=0; j < Object.keys(audioObject.records).length; j++) {
                                // console.log(j);

                                

                                if (currentUserAudioReadAccess[i] === audioObject.records[j].id) {
                                    currentUserAudioReadAccessObject.records[k] = audioObject.records[j];
                                    k++;
                                }




                                // let user_id = peopleObject.records[i].fields['auth0 user _id']
                                // if (typeof user_id !== "undefined") {
                                //     if (user_id == currentUserId) {
                                //         currentUserAirtable = peopleObject.records[i];
                                //         currentUserAudioReadAccess = peopleObject.records[i].fields['Read access to audios'];
                                //         console.log(currentUserAirtable);
                                //         console.log("Airtable match found for current user's Autho0 user_id: ",user_id);
                                //         console.log("Current user email is: ", req.oidc.user.email);
                                //         console.log("Per Airtable, current user has read access to: ",currentUserAudioReadAccess);
                                //     }
                                // }
                            }

                        }
                    
                        console.log(currentUserAudioReadAccessObject);
                        console.log(currentUserAudioReadAccessObject.records[0].fields.Speaker);
                        console.log(peopleObject);

                        for (let i=0,k=0; i < Object.keys(peopleObject.records).length; i++) {
                            for (let j=0; j < Object.keys(currentUserAudioReadAccessObject.records).length; j++) {
                                if (peopleObject.records[i].id === currentUserAudioReadAccessObject.records[j].fields.Speaker[0]) {
                                    currentUserAudioReadAccessObjectSpeakerNames.records[k] = peopleObject.records[i];
                                    // console.log(peopleObject.records[i].fields.Name);
                                    k++
                                }
                            }
                        }

                        console.log(currentUserAudioReadAccessObjectSpeakerNames);

                        ///////////////////////
                        ///// 3
                        //////////////////////

                        res.setHeader('Content-Type', 'application/json');
                        res.write(JSON.stringify({'people': currentUserAudioReadAccessObjectSpeakerNames, 'audios': currentUserAudioReadAccessObject}));
                        res.end();

                    });
                });

                req2.write(postData2);
                req2.end();

            });
        });
        req1.write(postData1);
        req1.end();





        
    });

    app.get('/user', requiresAuth(), (req, res) => {
        res.setHeader('Content-Type','application/json');
        res.send(JSON.stringify(req.oidc.user, null, 3));
    });

    app.get('/profile', requiresAuth(), (req, res) => {
        res.setHeader('Content-Type','application/json');
        res.send(JSON.stringify(req.oidc.user, null, 3));
        // res.send(req);
        // console.log(req);
    });
}
else if (environment_internet_flag == "offline") {
    app.all('/api/*', (req, res) => {
        res.send('{"records": ""}');
    });

    app.get('/profile', (req, res) => {
        // res.send(JSON.stringify(req.oidc.user));
        // res.send(req.oidc.user);
        res.send('{"records": ""}');
    });
}

http.createServer(app)
    .listen(port, () => {
        console.log(`Server running on port ${port}`);
    });