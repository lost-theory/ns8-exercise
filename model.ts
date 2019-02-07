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
        if(!email.match(/^[a-z0-9._+-]+@[a-z0-9-.]+\.[a-z]{2,}$/i)) {
            throw {validationError: "Invalid email address."};
        } else if(!(password.match(/[a-z]/i) && password.match(/\d/))) {
            throw {validationError: "Invalid password. Password must contain at least one letter and one number."};
        } else if(password.length < 8) {
            throw {validationError: "Invalid password. Password must be at least eight characters long."};
        } else if(!phoneNumber.match(/^\d{3}-\d{3}-\d{4}$/i)) {
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
