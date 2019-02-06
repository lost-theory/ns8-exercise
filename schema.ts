var sqlite3 = require('sqlite3').verbose();

import {cfg} from './config';
import {User} from './model';

var db = new sqlite3.Database(cfg.databaseUri);

console.log(`Initializing schema for ${cfg.databaseUri}.`);

db.serialize(function () {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(36) PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            phoneNumber VARCHAR(255),
            created INTEGER NOT NULL
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS events (
            id VARCHAR(36) PRIMARY KEY,
            userId VARCHAR(36) NOT NULL,
            eventType VARCHAR(255) NOT NULL,
            created INTEGER NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id)
        );
    `);
    db.run(`CREATE INDEX IF NOT EXISTS eventCreatedIdx ON events(created);`);
    db.run(`CREATE INDEX IF NOT EXISTS eventUserIdx ON events(userId);`);
    console.log("Schema created.");
    User.create(db, "test@testing.test", "thisismyp4ss", "248-555-1234").then((value) => {
        console.log(`Test user created.`);
    }, (reason) => {
        console.log(`Creating test user failed because ${reason} or ${reason.validationError}.`);
    });
});

db.close();
console.log("Done.");
