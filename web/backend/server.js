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
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
// const API_KEY_NAME = process.env.API_KEY_NAME;
const AIRTABLE_KEY_READ_WRITE_VALUE = process.env.AIRTABLE_KEY_READ_WRITE_VALUE;
const AIRTABLE_KEY_READ_ONLY_VALUE = process.env.AIRTABLE_KEY_READ_ONLY_VALUE;
let AIRTABLE_KEY_SELECTED = AIRTABLE_KEY_READ_ONLY_VALUE;
const DEFAULT_AUDIO_REC_ID = process.env.DEFAULT_AUDIO_REC_ID;
const auth0_secret = process.env.AUTH0_SECRET;
const auth0_base_url = process.env.AUTH0_BASE_URL;
const auth0_client_id = process.env.AUTH0_CLIENT_ID;
const auth0_issuer_base_url = process.env.AUTH0_ISSUER_BASE_ID;
const environment_flag = process.env.ENVIRONMENT_FLAG;
const environment_internet_flag = process.env.ENVIRONMENT_INTERNET_FLAG;
let currentUserAudioAccess;

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


app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.use(express.static(path.join(__dirname, '../frontend/public')));

if (environment_internet_flag == "online") {
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
        let currentUserAudioAccess;
        let audioObjectString = '';
        let audioObject = {};
        let currentUserAudioAccessObject = [];
        let currentUserAudioAccessObjectSpeakerNames = [];
        let currentUserRole;
        const postData1 = '';
        let options1 = {
            hostname: 'api.airtable.com',
            path: `/v0/${AIRTABLE_BASE_ID}/People`,
            method: 'GET',
            headers: {
                // 'Content-Type': 'text/plain',
                'Authorization': `Bearer ${AIRTABLE_KEY_SELECTED}`
            }
        };

        const req1 = https.request(options1, (res1) => {
            res1.setEncoding('utf8');
            res1.on('data', (chunk) => {
                peopleObjectString += chunk;
            });
            res1.on('end', () => {
                peopleObject = JSON.parse(peopleObjectString);
                // console.log("weeeeeeeeeeeeeeeeeeeee");
                for (let i=0; i < Object.keys(peopleObject.records).length; i++) {
                    let user_id = peopleObject.records[i].fields['auth0 user_id'];
                    // console.log("peopleObject.records[i].fields['auth0 user _id']:",peopleObject.records[i].fields['auth0 user _id']);
                    // console.log("peopleObject.records[i].fields:",peopleObject.records[i].fields);
                    if (typeof user_id !== "undefined") {
                        if (user_id == currentUserId) {
                            console.log("weeeeeeeeeeeeeeeeeeeee");
                            console.log("peopleObject.records[i]:",peopleObject.records[i]);
                            currentUserAirtable = peopleObject.records[i];
                            currentUserAudioAccess = peopleObject.records[i].fields['Access to audios'];
                            currentUserRole = peopleObject.records[i].fields['Role'];
                            // console.log("currentUserAirtable:",currentUserAirtable);
                            console.log("Airtable match found for current user's Autho0 user_id: ",user_id);
                            console.log("Current user email is: ", req.oidc.user.email);
                            console.log("Per Airtable, current user has access to the following audio/transcripts: ",currentUserAudioAccess);
                            console.log("Per Airtable, current user has role: ",currentUserRole);
                            // console.log("currentUserAirtable:",currentUserAirtable);
                            app.locals.currentUserAudioAccess = currentUserAudioAccess;
                            app.locals.currentUserRole = currentUserRole;
                        }
                    }
                }

                ///////////////////////
                ///// 2) look up audio list in Airtable and grab the info for the audios the currently logged in user has access to
                //////////////////////


                
                const postData2 = '';
                let options2 = {
                    hostname: 'api.airtable.com',
                    path: `/v0/${AIRTABLE_BASE_ID}/Audio%20Source`,
                    method: 'GET',
                    headers: {
                        // 'Content-Type': 'text/plain',
                        'Authorization': `Bearer ${AIRTABLE_KEY_SELECTED}`
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
                        peopleObject
                        // console.log("peopleObject:",peopleObject);
                        // console.log("currentUserAudioAccess:",currentUserAudioAccess);

                        for (let i=0,k=0; i < currentUserAudioAccess.length; i++) {
                            // console.log(i);
                            
                        
                            for (let j=0; j < Object.keys(audioObject.records).length; j++) {
                                // console.log(j);

                                

                                if (currentUserAudioAccess[i] === audioObject.records[j].id) {
                                    currentUserAudioAccessObject[k] = {};
                                    currentUserAudioAccessObject[k].id = audioObject.records[j].id;
                                    currentUserAudioAccessObject[k].Name = audioObject.records[j].fields.Name;
                                    currentUserAudioAccessObject[k].SpeakerName = audioObject.records[j].fields.Speaker[0];
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
                    
                        // console.log(currentUserAudioAccessObject);
                        // console.log(currentUserAudioAccessObject.records[0].fields.Speaker);
                        // console.log(peopleObject);

                        for (let i=0,k=0; i < Object.keys(peopleObject.records).length; i++) {
                            for (let j=0; j < currentUserAudioAccessObject.length; j++) {
                                if (peopleObject.records[i].id === currentUserAudioAccessObject[j].SpeakerName) {
                                    currentUserAudioAccessObjectSpeakerNames[k] = {};
                                    currentUserAudioAccessObjectSpeakerNames[k].id = peopleObject.records[i].id;
                                    currentUserAudioAccessObjectSpeakerNames[k].Name = peopleObject.records[i].fields.Name;
                                    // console.log(peopleObject.records[i].fields.Name);
                                    k++
                                }
                            }
                        }

                        // console.log("currentUserAudioAccessObject:",currentUserAudioAccessObject);

                        ///////////////////////
                        ///// 3
                        //////////////////////

                        res.setHeader('Content-Type', 'application/json');
                        res.write(JSON.stringify({'people': currentUserAudioAccessObjectSpeakerNames, 'audios': currentUserAudioAccessObject, 'userRole': currentUserRole}));
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

    app.get('/data/loadDefault', (req, res) =>{
        const postData = '';
        let defaultAudioDataString = '';
        let defaultAudioData = {};
        let defaultAudioDataSanitized = {};
        let defaultAudioRecId = `${DEFAULT_AUDIO_REC_ID}`;
        let defaultTranscriptDataString = '';
        let defaultTranscriptData = {};
        let audioName;
        let audioNameURLEncoded;
        const options1 = {
            hostname: 'api.airtable.com',
            path: `/v0/${AIRTABLE_BASE_ID}/Audio%20Source/${defaultAudioRecId}`,
            method: 'GET',
            headers: {
                // 'Content-Type': 'text/plain',
                'Authorization': `Bearer ${AIRTABLE_KEY_SELECTED}`
            }
        };

        // uncomment to help diagnose authorization issue if needed:
        // console.log({'Authorization': `Bearer ${API_KEY_VALUE}`});

        const req1 = https.request(options1, (res1) => {
            // console.log(`STATUS: ${res2.statusCode}`);
            // console.log(`HEADERS: ${JSON.stringify(res2.headers)}`);
            res1.setEncoding('utf8');
            res1.on('data', (chunk) => {
                defaultAudioDataString += chunk;
                // res.write(chunk);
                // console.log(`BODY: ${chunk}`);
            });
            res1.on('end', () => {
                // console.log('No more data in response.');
                defaultAudioData = JSON.parse(defaultAudioDataString);

                defaultAudioDataSanitized.mp3url = defaultAudioData.fields['mp3 url'];
                defaultAudioDataSanitized.tranurl = defaultAudioData.fields['tran/alignment JSON url'];
                defaultAudioDataSanitized.name = defaultAudioData.fields.Name;
                // console.log("defaultAudioDataSanitized:",defaultAudioDataSanitized);



                audioName = defaultAudioData.fields['Name'];
                audioNameURLEncoded = encodeURIComponent(audioName);
                // console.log(audioName);
                // console.log(audioNameURLEncoded);


                
                ///////////////////////////////
                const postData2 = '';
                let options2 = {
                    hostname: 'api.airtable.com',
                    path: `/v0/${AIRTABLE_BASE_ID}/Words%20(instance)?filterByFormula=%7BAudio%20Source%7D%3D%22${audioNameURLEncoded}%22`,
                    method: 'GET',
                    headers: {
                        // 'Content-Type': 'text/plain',
                        'Authorization': `Bearer ${AIRTABLE_KEY_SELECTED}`
                    }
                };

                const req2 = https.request(options2, (res2) => {
                    res2.setEncoding('utf8');
                    res2.on('data', (chunk) => {
                        defaultTranscriptDataString += chunk;
                    });
                    res2.on('end', () => {
                        defaultTranscriptData = JSON.parse(defaultTranscriptDataString);

                        res.setHeader('Content-Type', 'application/json');
                        res.write(JSON.stringify({'defaultAudio': defaultAudioDataSanitized, 'defaultAirtableWords': defaultTranscriptData}));
                        res.end();
                    });
                });
                req2.write(postData2);
                req2.end();
                ///////////////////////////////
            });
        });
        // console.log(postData);
        req1.write(postData);
        req1.end();
        // show/send/display the airtable api response to user
        // may later make this do something else or in the background instead, not sure
        // res.setHeader('Content-Type', 'application/json');
        // res.write(JSON.stringify('hi'));
        // res.end();
    });

    app.get('/data/loadIssues', (req, res) =>{
        const postData = '';
        // console.log("app.locals.currentUserAudioAccess:",app.locals.currentUserAudioAccess);
        // console.log("app.locals.currentUserRole:",app.locals.currentUserRole);
        let airtableIssuesString = '';
        let airtableIssues = {};
        let airtableIssuesSanitized = {};
        const options1 = {
            hostname: 'api.airtable.com',
            path: `/v0/${AIRTABLE_BASE_ID}/BR%20issues`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_KEY_SELECTED}`
            }
        };

        const req1 = https.request(options1, (res1) => {
            res1.setEncoding('utf8');
            res1.on('data', (chunk) => {
                airtableIssuesString += chunk;
            });
            res1.on('end', () => {
                airtableIssues = JSON.parse(airtableIssuesString);
                // console.log('length:',Object.keys(airtableIssues.records).length);

                for (let i=0; i < Object.keys(airtableIssues.records).length; i++) {
                    airtableIssuesSanitized[airtableIssues.records[i].id] = airtableIssues.records[i].fields.Name; 
                }

                // console.log("airtableIssues:",airtableIssues.records[0].fields.Name);
                // console.log("airtableIssuesSanitized:",airtableIssuesSanitized);
                res.setHeader('Content-Type', 'application/json');
                res.write(JSON.stringify(airtableIssuesSanitized));
                res.end();
            });
        });
        req1.write(postData);
        req1.end();
    });

    app.get('/data/loadAudio/:AudioRecId', (req, res) =>{
        // console.log("app.locals.currentUserAudioAccess:",app.locals.currentUserAudioAccess);
        if (app.locals.currentUserAudioAccess.includes(req.params.AudioRecId)) {
            const postData = '';
            // console.log(req.params);
            let selectedAudioDataString = '';
            let selectedAudioData = {};
            let selectedAudioDataSanitized = {};
            let selectedAirtableWordsDataString = '';
            let selectedAirtableWordsData = {};
            let audioName;
            let audioNameURLEncoded;
            const options1 = {
                hostname: 'api.airtable.com',
                path: `/v0/${AIRTABLE_BASE_ID}/Audio%20Source/${req.params.AudioRecId}`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_KEY_SELECTED}`
                }
            };

            const req1 = https.request(options1, (res1) => {
                res1.setEncoding('utf8');
                res1.on('data', (chunk) => {
                    selectedAudioDataString += chunk;
                });
                res1.on('end', () => {
                    selectedAudioData = JSON.parse(selectedAudioDataString);
                    
                    selectedAudioDataSanitized.mp3url = selectedAudioData.fields['mp3 url'];
                    selectedAudioDataSanitized.tranurl = selectedAudioData.fields['tran/alignment JSON url'];
                    selectedAudioDataSanitized.name = selectedAudioData.fields.Name;
                    // console.log("selectedAudioDataSanitized:",selectedAudioDataSanitized);
                    
                    audioName = selectedAudioData.fields['Name'];
                    audioNameURLEncoded = encodeURIComponent(audioName);
                    // console.log(audioName);
                    // console.log(audioNameURLEncoded);

                    ////////////////////////

                    const postData2 = '';
                    let options2 = {
                        hostname: 'api.airtable.com',
                        path: `/v0/${AIRTABLE_BASE_ID}/Words%20(instance)?filterByFormula=%7BAudio%20Source%7D%3D%22${audioNameURLEncoded}%22`,
                        method: 'GET',
                        headers: {
                            // 'Content-Type': 'text/plain',
                            'Authorization': `Bearer ${AIRTABLE_KEY_SELECTED}`
                        }
                    };

                    const req2 = https.request(options2, (res2) => {
                        res2.setEncoding('utf8');
                        res2.on('data', (chunk) => {
                            selectedAirtableWordsDataString += chunk;
                        });
                        res2.on('end', () => {
                            selectedAirtableWordsData = JSON.parse(selectedAirtableWordsDataString);

                            res.setHeader('Content-Type', 'application/json');
                            res.write(JSON.stringify({'selectedAudio': selectedAudioDataSanitized, 'selectedAirtableWords': selectedAirtableWordsData}));
                            res.end();
                        });
                    });
                    req2.write(postData2);
                    req2.end();


                    //////////////////////





                    // res.setHeader('Content-Type', 'application/json');
                    // res.write(JSON.stringify({'audio':selectedAudioData}));
                    // // console.log("audio:",selectedAudioData);
                    // res.end();
                });
            });
            req1.write(postData);
            req1.end();
        }
        else {
            res.setHeader('Content-Type', 'text/plain');
            res.write("not found");
            res.end();
        }
    });
    
    app.all('/api/*', (req, res) => {
        if (app.locals.currentUserRole === 'write') {
            AIRTABLE_KEY_SELECTED = AIRTABLE_KEY_READ_WRITE_VALUE;
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

            // // Uncomment for troubleshooting
            // console.log("pathSegments: " + pathSegments);
            // console.log("pathSegmentsFirst: " + pathSegmentsFirst);
            // console.log("pathSegmentsExceptFirst: " + pathSegmentsExceptFirst);
            // console.log("pathMinusFirstSegment: "+pathMinusFirstSegment);


            if (req.method === 'GET') {
                const postData = '';
                const options = {
                    hostname: 'api.airtable.com',
                    path: `/v0/${AIRTABLE_BASE_ID}/${pathMinusFirstSegment}`,
                    method: 'GET',
                    headers: {
                        // 'Content-Type': 'text/plain',
                        'Authorization': `Bearer ${AIRTABLE_KEY_SELECTED}`
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
                    // console.log(body);

                    const options = {
                        hostname: 'api.airtable.com',
                        path: `/v0/${AIRTABLE_BASE_ID}/${pathMinusFirstSegment}`,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${AIRTABLE_KEY_SELECTED}`
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
                    // console.log(body);

                    const options = {
                        hostname: 'api.airtable.com',
                        path: `/v0/${AIRTABLE_BASE_ID}/${pathMinusFirstSegment}`,
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${AIRTABLE_KEY_SELECTED}`
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
                    // console.log(body);

                    const options = {
                        hostname: 'api.airtable.com',
                        path: `/v0/${AIRTABLE_BASE_ID}/${pathMinusFirstSegment}`,
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${AIRTABLE_KEY_SELECTED}`
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
                            // console.log(body2);
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

        }
        else {
            res.setHeader('Content-Type', 'text/plain');
            res.write("not authorized");
            res.end();
        }

    });

    app.get('/user', requiresAuth(), (req, res) => {
        res.setHeader('Content-Type','application/json');
        res.send(JSON.stringify(req.oidc.user, null, 3));
    });

    app.get('/callback', requiresAuth(), (req, res) => {
        res.sendFile('../frontend/public/home.html');
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