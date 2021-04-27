# HackerRank contest submissions fetcher

Tool to fetch information about the submissions of an HackerRank contest.

It uses an HackerRank API I discovered looking at other repos ([mostly this one](https://github.com/bmestanov/hackerrank-scraper)), I did not find any official documentation about this API or how to use it.

## Requirements
- [Node.js](https://nodejs.dev/)

## How to use
1. Install dependencies with `npm install`
2. Create a `.env` file with the following variables:
    - CONTEST: Slug of the contest from which to fetch information
    - COOKIE: Cookie that authenticates you in HackerRank, from an account with access to the given Contest. Since HackerRank uses some HttpOnly cookies, which are not acessible through `document.cookie`, I recommend using [this extension](https://chrome.google.com/webstore/detail/editthiscookie/fngmhnnpilhplaeedifhccceomclgfbg?hl=pt-PT) to fetch them. I don't know how it works, but by using the "export cookies" button you can get the full cookie.
    - FETCH_DELAY: time in seconds to wait between requests to the HackerRank API in case of error 429 (too many requests). If not set, by default will be 30.
3. Run the code with `npm start` 

## Considerations
- Sending too many requests to the API in a short amount of time results in an error 429 (too many requests) and you must wait some time in order to continue. The code is written so as to wait some time whenever it receives this error 429, which can be configured through the FETCH_DELAY env variable.

## Results
For each contest a folder with its name will be created: `results/<contest-slug>`.

Inside this folder will be:

- A folder for each user, where the name is the user's username. Each folder will contain the source code of all of the user's submissions, in separate files named `<contest-slug>-<submission-id>.<file-extension>`. Example: `awesome-challenge-12345678.cpp`
- submissions.json: json array containing information about every contest submission

```json=
[
  {
    "id": 1332887349,
    "contest_id": 123456,
    "challenge_id": 123456,
    "hacker_id": 12345678,
    "status": "Processed",
    "created_at": 1619481187,
    "kind": "code",
    "language": "cpp14",
    "hacker_username": "coolusername",
    "time_ago": "about 17 hours",
    "in_contest_bounds": true,
    "time_from_start": 60833.11666666667,
    "status_code": 2,
    "score": 0,
    "is_preliminary_score": null,
    "challenge": {
      "name": "Amazing Challenge",
      "slug": "amazing-challenge"
    },
    "inserttime": 1619481187,
    "testcase_message": [
      "Success",
      "Failure"
    ]
  },
  ...
]
```

- submissionsPerUser.json: information from all submissions organized by username
```json=
{
  "coolusername": [
    {
      "id": 1332887349,
      "contest_id": 123456,
      "challenge_id": 123456,
      "hacker_id": 12345678,
      "status": "Processed",
      "created_at": 1619481187,
      "kind": "code",
      "language": "cpp14",
      "hacker_username": "coolusername",
      "time_ago": "about 17 hours",
      "in_contest_bounds": true,
      "time_from_start": 60833.11666666667,
      "status_code": 2,
      "score": 0,
      "is_preliminary_score": null,
      "challenge": {
        "name": "Amazing Challenge",
        "slug": "amazing-challenge"
      },
      "inserttime": 1619481187,
      "testcase_message": [
        "Success",
        "Failure"
      ]
    }
  ],
  "othercoolusername": [...]
}
```

- submissionsPerUserPerChallenge.json: information from all submissions organized by username and by challenge
```json=
{
  "coolusername": {
    "amazing-challenge": [
      {
        "id": 1332887349,
        "contest_id": 123456,
        "challenge_id": 123456,
        "hacker_id": 12345678,
        "status": "Processed",
        "created_at": 1619481187,
        "kind": "code",
        "language": "cpp14",
        "hacker_username": "coolusername",
        "time_ago": "about 17 hours",
        "in_contest_bounds": true,
        "time_from_start": 60833.11666666667,
        "status_code": 2,
        "score": 0,
        "is_preliminary_score": null,
        "challenge": {
          "name": "Amazing Challenge",
          "slug": "amazing-challenge"
        },
        "inserttime": 1619481187,
        "testcase_message": [
          "Success",
          "Failure"
        ]
      }
    ],
    "other-challenge": [...]
  },,
  "othercoolusername": {...}
  ...
```
