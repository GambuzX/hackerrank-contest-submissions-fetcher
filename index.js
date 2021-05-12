const fs = require('fs');
const path = require('path');
const axios = require('axios');
const urls = require('./urls');
const { sleep, axiosGet, randomUserAgent, createFolder } = require('./utils.js');
require('dotenv').config()

// set default headers for authenticating requests
axios.defaults.headers.common['Cookie'] = process.env.COOKIE;
axios.defaults.headers.common['User-Agent'] = randomUserAgent(); // this needs to have some value or it returns 403

// global variables
const contestSlug = process.env.CONTEST;
const resultsPath = 'results';
const contestPath = path.join(resultsPath, contestSlug);
const fetchSubmissionsDelay = process.env.FETCH_DELAY || 30; // time to wait between API calls if error 429, in seconds

// map language to file extension
const fileExtensions = {
    cpp: 'cpp',
    cpp14: 'cpp',
    csharp: 'cs',
    java: 'java',
    java8: 'java',
    javascript: 'js',
    python: 'py'
};

async function getContestSubmissions() {
    // get all contest submissions
    const params = {
        limit: 99999999 // max number of submissions to fetch, by default is only 10
    }
    const response = await axiosGet(urls.contestSubmissions(contestSlug), params);
    if (response.error) throw response.error;

    // filter submissions that are code and whose file extension is known
    return response.data.models.filter((submission) => {
        return Object.keys(fileExtensions).includes(submission.language) &&
            submission.in_contest_bounds &&
            submission.kind === 'code'
    });
}

function separateSubmissionsPerUser(submissions) {
    return submissions.reduce((acc, curr) => {
        const user = curr.hacker_username;           
        if (!(user in acc)) 
            acc[user] = [];

        acc[user].push(curr);
        return acc;
    }, {});
}

function separateSubmissionsPerUserPerChallenge(submissions) {
    return submissions.reduce((acc, curr) => {
        const user = curr.hacker_username;           
        const challenge = curr.challenge.slug;
        if (!(user in acc)) 
            acc[user] = {};
        if (!(challenge in acc[user]))
            acc[user][challenge] = [];

        acc[user][challenge].push(curr);
        return acc;
    }, {});
}

function createContestFolder() {
    createFolder(resultsPath);
    createFolder(contestPath);
}

function saveJSONFile(data, filename) {
    const filePath = path.join(contestPath, `${filename}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data,null,2), (err) => {
        if (err) console.log(err);
    });
}

async function fetchSubmissionsCode(submissionIds) {
    for (let i = 0; i < submissionIds.length; i++) {
        const submissionId = submissionIds[i];
        
        // fetch submission info
        const response = await axiosGet(urls.submissionInfo(contestSlug, submissionId));
        if (response.error) {
            const res = response.error.response;
            if (!res || res.status !== 429) throw response.error;

            // too many requests, wait some time and try again
            console.log(`Too many requests, waiting for ${fetchSubmissionsDelay}s and trying again`);
            await sleep(fetchSubmissionsDelay*1000);
            i--;
            continue;
        }
        const submission = response.data.model;
    
        // create user folder
        const userPath = path.join(contestPath, submission.hacker_username);
        createFolder(userPath);
    
        // save submission code
        const filename = `${submission.challenge_slug}-${submissionId}.${fileExtensions[submission.language]}`;
        const filePath = path.join(userPath, filename);
        fs.writeFileSync(filePath, submission.code);
        
        if (i % 10 == 0) console.log(`Fetched submission ${i+1}/${submissionIds.length}`)
    }
}


(async () => {
    try {
        // get all contest submissions
        console.log("[+] Fetching contest submissions")
        const submissions = await getContestSubmissions();
        const submissionsPerUser = separateSubmissionsPerUser(submissions);
        const submissionsPerUserPerChallenge = separateSubmissionsPerUserPerChallenge(submissions);

        // save general info about submissions
        console.log("[+] Saving submissions info")
        createContestFolder(resultsPath);
        saveJSONFile(submissions, 'submissions');
        saveJSONFile(submissionsPerUser, 'submissionsPerUser');
        saveJSONFile(submissionsPerUserPerChallenge, 'submissionsPerUserPerChallenge');

        // fetch and save the code of each submission
        console.log("[+] Fetching the code for each submission")
        await fetchSubmissionsCode(submissions.map(submission => submission.id));

        console.log("[+] Finished")
    }
    catch (error) {
        console.error(`An error ocurred: ${error}`);
    }
})();