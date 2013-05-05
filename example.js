var easydb = require("./index");

// Set the main database config
easydb.setConfig({
  host: "127.0.0.1",
  user: "root",
  password: "password",
  database: "easydb-test",
  port: 3306,
  logQueries: false // set to true if you want to log all queries to the console (good for debugging)
});


// Find all rows in the "apps" table where the id is 3280 (should be an array of length 1)
// Keep the connection open as we"re going to run another query straight away
easydb.find({
  table: "users",
  conditions: {
    id: 3280
  },
  keepOpen: true
}, function(apps) {
  console.log(apps);
});

// Query the users, because we don"t have keepOpen: true here, the connection will close.
easydb.find({
  table: "users"
}, function(apps) {
  console.log(apps);
});
