const axios = require('axios');
const urls = require('./urls');
require('dotenv').config()

// set default headers for authenticating requests
axios.defaults.headers.common['Cookie'] = process.env.COOKIE;
axios.defaults.headers.common['User-Agent'] = 'scraper'; // this needs to have some value or it returns 403


async function getContestSubmissions() {
    const response = await axios.get(urls.contestSubmissions(process.env.CONTEST));
    return response.data.models;
}


(async () => {
    try {
        const submissions = await getContestSubmissions();
        console.log(submissions);
    }
    catch (error) {
        console.error("An error occured: %d", error.statusCode);
        console.error(err);
    }
})();

/* TODO
 - separate submissions per user
 - create results folder for each user
 - save 'submissions.json' for each user with general info about all user submissions
 - call submissionInfo API and save the code of each user's submission
 - detect users with more than 1 submissions per week
 - detect users copying from each other
*/
