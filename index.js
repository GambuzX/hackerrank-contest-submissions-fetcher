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

function createContestFolder() {
    if (!fs.existsSync(resultsPath)) {
        fs.mkdirSync(resultsPath);
    }
    if (!fs.existsSync(contestPath)) {
        fs.mkdirSync(contestPath);
    }
}

function saveUsersSubmissions(usersSubmissions) {
    createContestFolder();

    // save general submissions info
    const filePath = path.join(contestPath, 'submissions.json');
    fs.writeFile(filePath, JSON.stringify(usersSubmissions,null,2), (err) => {
        if (err) console.log(err);
    });
}


(async () => {
    try {
        // get all contest submissions
        const submissions = await getContestSubmissions();

        // separate submissions per user
        const submissionsPerUser = submissions.reduce((acc, curr) => {
            const user = curr.hacker_username;           
            if (!(user in acc)) 
                acc[user] = [];

            acc[user].push(curr);
            return acc;
        }, {});

        // save the submissions of each user in separate folders
        saveUsersSubmissions(submissionsPerUser);
    }
    catch (error) {
        console.error("An error occured: %d", error.statusCode);
        console.error(error);
    }
})();

/* TODO
 - separate user info per challenge
 - call submissionInfo API and save the code of each user's submission
 - detect users with more than 1 submissions per week
 - detect users copying from each other
*/
