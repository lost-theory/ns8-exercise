var uuid = require('uuid/v1');
var crypto = require('crypto');

import {cfg} from './config';

let dbRunCb = function(resolve, reject) {
    return function(err) {
        if(err) {
            reject(err);
        } else {
            resolve();
        }
    };
};

export module User {
    export function validate(email:string, password:string, phoneNumber:string) {
        if(email === undefined) {
            throw {validationError: "The email field is required."};
        } else if(password === undefined) {
            throw {validationError: "The password field is required."};
        } else if(!email.match(/^[a-z0-9._+-]+@[a-z0-9-.]+\.[a-z]{2,}$/i)) {
            throw {validationError: "Invalid email address."};
        } else if(!(password.match(/[a-z]/i) && password.match(/\d/))) {
            throw {validationError: "Invalid password. Password must contain at least one letter and one number."};
        } else if(password.length < 8) {
            throw {validationError: "Invalid password. Password must be at least eight characters long."};
        } else if(phoneNumber && !phoneNumber.match(/^\d{3}-\d{3}-\d{4}$/i)) {
            throw {validationError: "Invalid phone number."};
        }
        return true;
    };

    export function create(db:any, email:string, password:string, phoneNumber:string) {
        return new Promise(function(resolve, reject) {
            let created = Math.floor((new Date()).getTime() / 1000);
            let userId = uuid();
            validate(email, password, phoneNumber);
            let hashedPassword = crypto.createHash('sha256').update(password + userId + cfg.salt);
            db.run(
                "INSERT INTO users VALUES (?, ?, ?, ?, ?)",
                [userId, email, hashedPassword.digest('base64'), phoneNumber, created],
                dbRunCb(resolve, reject)
            );
        });
    };

    export function all(db:any) {
        return new Promise(function(resolve, reject) {
            db.all("SELECT id, email, phoneNumber, created FROM users", [], function(err, rows) {
                return resolve({err: err, rows: rows});
            });
        });
    };
};

export module Event {
    export function validate(userId:string, eventType:string) {
        if(userId === undefined) {
            throw {validationError: "The userId field is required."};
        } else if(eventType === undefined || eventType.length == 0) {
            throw {validationError: "The eventType field is required."};
        }
        return true;
    };

    export function create(db:any, userId:string, eventType:string) {
        return new Promise(function(resolve, reject) {
            let created = Math.floor((new Date()).getTime() / 1000);
            let eventId = uuid();
            validate(userId, eventType);
            db.run(
                "INSERT INTO events VALUES (?, ?, ?, ?)",
                [eventId, userId, eventType, created],
                dbRunCb(resolve, reject)
            );
        });
    };

    export function all(db:any) {
        return new Promise(function(resolve, reject) {
            db.all("SELECT id, userId, eventType, created FROM events", [], function(err, rows) {
                return resolve({err: err, rows: rows});
            });
        });
    };

    export function filter(db:any, userId?:string, createdAfter?:number) {
        let params = [], query = "SELECT id, userId, eventType, created FROM events";
        if(!!createdAfter) {
            params = [createdAfter], query = "SELECT id, userId, eventType, created FROM events WHERE created >= ?";
        } else if(!!userId) {
            params = [userId], query = "SELECT id, userId, eventType, created FROM events WHERE userId = ?";
        }
        // XXX: should add one more condition for when both createdAfter *and* userId are specified, see README.md
        return new Promise(function(resolve, reject) {
            db.all(query, params, function(err, rows) {
                return resolve({err: err, rows: rows});
            });
        });
    };
};
