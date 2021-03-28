module.exports = {
    contestSubmissions: (contestName) => {
        return `https://www.hackerrank.com/rest/contests/${contestName}/judge_submissions`
    },
    submissionInfo: (contestName, submissionId) => {
        return `https://www.hackerrank.com/rest/contests/${contestName}/submissions/${submissionId}`
    }
};
