import * as express from 'express'
var bodyParser = require('body-parser');
var sqlite3 = require('sqlite3').verbose();

import {cfg} from './config';
import {User, Event} from './model';

// express app setup

const app = express();
const port = cfg.portNumber;
const oneDayInSeconds = 24 * 60 * 60;

var db = new sqlite3.Database(cfg.databaseUri);
app.set('json spaces', 2);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// request handlers

app.get('/', (req, res, next) => {
    res.json({resources: ["/users", "/events"]});
})

app.get('/users', (req, res, next) => {
    return User.all(db).then((val:any) => {
        res.json({users: val.rows});
    });
})

app.post('/users', (req, res, next) => {
    User.create(db, req.body.email, req.body.password, req.body.phoneNumber).then((value) => {
        res.json({result: "success"});
    }, (reason) => {
        if(reason.validationError) {
            res.status(400).json({result: "failure", error: reason.validationError});
        } else {
            console.log(`Creating user failed because ${reason}.`);
            res.status(500).json({"failure": "User creation failed with unhandled exception. See logs."});
        }
    });
})

app.get('/events', (req, res, next) => {
    let userId = req.query.userId;
    let createdAfter = null;
    if(req.query.lastDay) {
        createdAfter = (new Date()).getTime() / 1000 - oneDayInSeconds;
    } else if(req.query.createdAfter) {
        createdAfter = parseInt(req.query.createdAfter);
    }
    return Event.filter(db, userId, createdAfter).then((val:any) => {
        res.json({events: val.rows});
    });
})

app.post('/events', (req, res, next) => {
    Event.create(db, req.body.userId, req.body.eventType).then((value) => {
        res.json({result: "success"});
    }, (reason) => {
        if(reason.validationError) {
            res.status(400).json({result: "failure", error: reason.validationError});
        } else {
            console.log(`Creating event failed because ${reason}.`);
            res.status(500).json({"failure": "Event creation failed with unhandled exception. See logs."});
        }
    });
})

// listen

app.listen(port, () => {
    console.log(`App is listening on port ${port}.`)
})
