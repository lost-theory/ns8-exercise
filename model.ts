var uuid = require('uuid/v1');

export module User {
    export function create(db:any, email:string, phoneNumber:string) {
        let created = Math.floor((new Date()).getTime() / 1000);
        let userId = uuid();
        db.run("INSERT INTO users VALUES (?, ?, ?, ?)", userId, email, phoneNumber, created);
    };
};
