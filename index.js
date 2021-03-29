const fs = require('fs');
const path = require('path');
const axios = require('axios');
const urls = require('./urls');
require('dotenv').config()

// set default headers for authenticating requests
axios.defaults.headers.common['Cookie'] = process.env.COOKIE;
axios.defaults.headers.common['User-Agent'] = 'scraper'; // this needs to have some value or it returns 403

// global variables
const contestSlug = process.env.CONTEST;
const resultsPath = 'results';
const contestPath = path.join(resultsPath, contestSlug);

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
    const response = await axios.get(urls.contestSubmissions(contestSlug));

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

function createFolder(path) {
    if (!fs.existsSync(path))
        fs.mkdirSync(path);
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

async function fetchSubmissionCode(submissionId) {
    // fetch submission info
    const response = await axios.get(urls.submissionInfo(contestSlug, submissionId))
    const submission = response.data.model;

    // create user folder
    const userPath = path.join(contestPath, submission.hacker_username);
    createFolder(userPath);

    // save submission code
    const filename = `${submission.challenge_slug}-${submissionId}.${fileExtensions[submission.language]}`;
    const filePath = path.join(userPath, filename);
    fs.writeFileSync(filePath, submission.code);
}


(async () => {
    try {
        // get all contest submissions
        const submissions = await getContestSubmissions();
        const submissionsPerUser = separateSubmissionsPerUser(submissions);
        const submissionsPerUserPerChallenge = separateSubmissionsPerUserPerChallenge(submissions);

        // save general info about submissions
        createContestFolder(resultsPath);
        saveJSONFile(submissions, 'submissions');
        saveJSONFile(submissionsPerUser, 'submissionsPerUser');
        saveJSONFile(submissionsPerUserPerChallenge, 'submissionsPerUserPerChallenge');

        // fetch and save the code of each submission
        await Promise.all(submissions.map(submission => submission.id).map(fetchSubmissionCode));
    }
    catch (error) {
        console.error("An error occured: %d", error.statusCode);
        console.error(error);
    }
})();

/* TODO
 - add prints to inform user about what is happening
 - detect users with more than 1 submissions per week
 - detect users copying from each other
*/
