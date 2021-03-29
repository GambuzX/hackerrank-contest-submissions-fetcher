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


async function getContestSubmissions() {
    const response = await axios.get(urls.contestSubmissions(contestSlug));
    return response.data.models;
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
    if (!fs.existsSync(resultsPath)) {
        fs.mkdirSync(resultsPath);
    }
    if (!fs.existsSync(contestPath)) {
        fs.mkdirSync(contestPath);
    }
}

function saveJSONFile(data, filename) {
    const filePath = path.join(contestPath, `${filename}.json`);
    fs.writeFile(filePath, JSON.stringify(data,null,2), (err) => {
        if (err) console.log(err);
    });
}


(async () => {
    try {
        // get all contest submissions
        const submissions = await getContestSubmissions();
        const submissionsPerUser = separateSubmissionsPerUser(submissions);
        const submissionsPerUserPerChallenge = separateSubmissionsPerUserPerChallenge(submissions);

        // save general info about submissions
        createContestFolder();
        saveJSONFile(submissions, 'submissions');
        saveJSONFile(submissionsPerUser, 'submissionsPerUser');
        saveJSONFile(submissionsPerUserPerChallenge, 'submissionsPerUserPerChallenge');
    }
    catch (error) {
        console.error("An error occured: %d", error.statusCode);
        console.error(error);
    }
})();

/* TODO
 - call submissionInfo API and save the code of each user's submission
 - add prints to inform user about what is happening
 - detect users with more than 1 submissions per week
 - detect users copying from each other
*/
