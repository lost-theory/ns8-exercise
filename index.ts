import * as express from 'express'
var sqlite3 = require('sqlite3').verbose();

import {cfg} from './config';
import {User} from './model';

const app = express();
const port = cfg.portNumber;

var db = new sqlite3.Database(cfg.databaseUri);
app.set('json spaces', 2);

app.get('/', (req, res, next) => {
    res.json({resources: ["/users", "/events"]});
})

app.get('/users', (req, res, next) => {
    return User.all(db).then((val:any) => {
        res.json({users: val.rows});
    });
})

app.listen(port, () => {
    console.log(`App is listening on port ${port}.`)
})
