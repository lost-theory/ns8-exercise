export let cfg = {
    // Where to store the sqlite database, use :memory: for in-memory.
    databaseUri: "app.db",

    // Used to salt passwords in the database.
    // XXX: See README.md, this value should be overwritten by dotenv or similar.
    salt: "AdD43KYGF9vPd1aQSfXoQ4JFKUlxRM2K0MQDWPUMMhCkvnvJnCFiXj8hVxNn",

    // Express app server port number.
    portNumber: 8000,
};
