const axios = require('axios');
const urls = require('./urls');
require('dotenv').config()

// set default headers for authenticating requests
axios.defaults.headers.common['Cookie'] = process.env.COOKIE;
axios.defaults.headers.common['User-Agent'] = 'scraper'; // this needs to have some value or it returns 403


async function getContestSubmissions(contestSlug) {
    const response = await axios.get(urls.contestSubmissions(contestSlug));
    return response.data.models;
}


(async () => {
    try {
        // get all contest submissions
        const submissions = await getContestSubmissions(process.env.CONTEST);

        // separate submissions per user
        const submissionsPerUser = submissions.reduce((acc, curr) => {
            const user = curr.hacker_username;           
            if (!(user in acc)) 
                acc[user] = [];

            acc[user].push(curr);
            return acc;
        }, {});

        console.log(submissionsPerUser);
    }
    catch (error) {
        console.error("An error occured: %d", error.statusCode);
        console.error(error);
    }
})();

/* TODO
 - create results folder for each user
 - save 'submissions.json' for each user with general info about all user submissions
 - call submissionInfo API and save the code of each user's submission
 - detect users with more than 1 submissions per week
 - detect users copying from each other
*/
