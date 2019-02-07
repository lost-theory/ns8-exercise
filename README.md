# Running

```bash
    npm install

    # initialize sqlite database on disk
    npm run schema

    # run express server
    npm run server
```

# Notes, assumptions, etc.

* I used UUIDs for user & event IDs instead of numeric auto-increment IDs. UUIDs are easier to shard than numeric auto-increment IDs and immune to [enumeration attacks](https://www.owasp.org/index.php/Testing_for_User_Enumeration_and_Guessable_User_Account_%28OWASP-AT-002%29) (if using proper random number generation). Before moving to production I would use an integer column type (or UUID column type if available) instead of a string column type to store the UUIDs more efficiently.
* For input validation I used regexes in the model layer. To improve the current validation code I would:
  * 1. Use a validation library (e.g. replace the email regex with an NPM module that does more robust email validation).
  * 2. Move the validation code into a separate validation layer, outside of the model code.
* I added some basic password strength requirements (8 characters, 1 letter, 1 number).
* I used SHA256(password, uuid, salt) for hashing the password. This should be replaced with bcrypt or a similar cryptographic hashing library before moving to production.
* I created a `config.ts` file to store configuration values, but all of the values are currently hardcoded. The hardcoded values should exist as defaults (or moved to a `config.example.ts` file) but overwritten by environment variables, command line arguments, or by using a package like `dotenv`. This is especially true for `salt`, which is a secret value and should not be checked into the repo.
