# Running

```bash
$ npm install

# initialize sqlite database on disk
$ npm run schema

# run express server
$ npm run start
```

# Notes, assumptions, etc.

* I used UUIDs for user & event IDs instead of numeric auto-increment IDs. UUIDs are easier to shard than numeric auto-increment IDs and immune to [enumeration attacks](https://www.owasp.org/index.php/Testing_for_User_Enumeration_and_Guessable_User_Account_%28OWASP-AT-002%29) (if using proper random number generation). Before moving to production I would use an integer column type (or UUID column type if available) instead of a string column type to store the UUIDs more efficiently.
* For input validation I used regexes in the model layer. To improve the current validation code I would:
  * 1. Use a validation library (e.g. replace the email regex with an NPM module that does more robust email validation).
  * 2. Move the validation code into a separate validation layer, outside of the model code.
* I added some basic password strength requirements (8 characters, 1 letter, 1 number).
* I used SHA256(password, uuid, salt) for hashing the password. This should be replaced with bcrypt or a similar cryptographic hashing library before moving to production.
* I created a `config.ts` file to store configuration values, but all of the values are currently hardcoded. The hardcoded values should exist as defaults (or moved to a `config.example.ts` file) but overwritten by environment variables, command line arguments, or by using a package like `dotenv`. This is especially true for `salt`, which is a secret value and should not be checked into the repo.

> ns8-exercise@0.0.1 start /home/app/ns8-exercise
> tsc && node dist/index.js

* I used the low level `sqlite3` library for persistence. I may need to do something smarter than creating a single shared `db` object at the top level of `index.ts` for concurrent requests. Also, for `Event.filter` it would have been nice to use an ORM to dynamically build up the query to filter based on the `created` column, `userId` column, both columns, or neither. As it is I had to write out the logic for each `SELECT` statement.
* Right now there is no authorization for any of the endpoints. One simple way to add authorization would be to require clients to send an API key in the headers, then check the incoming API key against an `api_keys` table in the database.
* I added Mocha to the package.json, but didn't have time to add any unit or integration tests. I've written up a manual test plan below with examples of the output returned.

# Test plan

Here are the steps I used to validate the REST endpoints on the command line using cURL. I would use a similar set of test cases for unit and integration tests (verify validation is firing, verify you can write to the database, and verify you can read data back).

## Initialize database

```bash
$ npm install
$ npm run schema
Initializing schema for app.db.
Schema created.
Done.
```

## Run the development server

```bash
$ npm run start
App is listening on port 8000.

$ curl http://127.0.0.1:8000/
{
  "resources": [
    "/users",
    "/events"
  ]
}
```

## Users

```bash
# validation error
$ curl -d '{"email": "test1%foobah,com", "password": "foo", "phoneNumber": "555"}' -H "Content-Type: application/json" http://127.0.0.1:8000/users
{
  "result": "failure",
  "error": "Invalid email address."
}

# success
$ curl -d '{"email": "test1@foobah.com", "password": "foopass123", "phoneNumber": "555-123-9999"}' -H "Content-Type: application/json" http://127.0.0.1:8000/users
{
  "result": "success"
}

# list all users
$ curl http://127.0.0.1:8000/users
{
  "users": [
    {
      "id": "435951c0-2a78-11e9-b095-a5481bbaf0da",
      "email": "test1@foobah.com",
      "phoneNumber": "555-123-9999",
      "created": 1549503162
    }
  ]
}
```

## Events

```bash
# validation error
$ curl -d '{"userId": "435951c0-2a78-11e9-b095-a5481bbaf0da"}' -H "Content-Type: application/json" http://127.0.0.1:8000/events
{
  "result": "failure",
  "error": "The eventType field is required."
}

# success
$ curl -d '{"userId": "435951c0-2a78-11e9-b095-a5481bbaf0da", "eventType": "login"}' -H "Content-Type: application/json" http://127.0.0.1:8000/events
{
  "result": "success"
}

# show all events
$ curl http://127.0.0.1:8000/events
{
  "events": [
    {
      "id": "ba363e70-2a78-11e9-b095-a5481bbaf0da",
      "userId": "435951c0-2a78-11e9-b095-a5481bbaf0da",
      "eventType": "login",
      "created": 1549503362
    }
  ]
}

# filter events by a non-existent userId
$ curl http://127.0.0.1:8000/events?userId=zzz
{
  "events": []
}

# filter events by the userId we used earlier
$ curl http://127.0.0.1:8000/events?userId=435951c0-2a78-11e9-b095-a5481bbaf0da
{
  "events": [
    {
      "id": "ba363e70-2a78-11e9-b095-a5481bbaf0da",
      "userId": "435951c0-2a78-11e9-b095-a5481bbaf0da",
      "eventType": "login",
      "created": 1549503362
    }
  ]
}

# filter events by last 24 hours
$ curl http://127.0.0.1:8000/events?lastDay=yes
(same output as above)

# filter events by created timestamp in the past
$ curl http://127.0.0.1:8000/events?createdAfter=1549501958
(same output as above)

# filter events by created timestamp one day in the future
$ python3 -c "import time; print(int(time.time())+24*60*60)"
1549590058
$ curl http://127.0.0.1:8000/events?createdAfter=1549590058
{
  "events": []
}
```
