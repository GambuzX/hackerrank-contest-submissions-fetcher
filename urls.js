module.exports = {
    contestSubmissions: (contestName) => {
        return `https://www.hackerrank.com/rest/contests/${contestName}/judge_submissions?limit=9999999`
    },
    submissionInfo: (contestName, submissionId) => {
        return `https://www.hackerrank.com/rest/contests/${contestName}/submissions/${submissionId}`
    }
};
