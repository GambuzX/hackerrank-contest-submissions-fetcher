const fs = require('fs');
const axios = require('axios');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function axiosGet(url, params={}) {
    try {
        const response = await axios.get(url, { params });
        return response;
    }
    catch (error) {
        return {error: error};
    }
}

function randomUserAgent() {
    const rand = Math.floor((Math.random() * 1000000) + 1);
    return `useragent${rand}`;
}


function createFolder(path) {
    if (!fs.existsSync(path))
        fs.mkdirSync(path);
}

module.exports = {
    sleep,
    axiosGet,
    randomUserAgent,
    createFolder
}