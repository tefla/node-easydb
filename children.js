var easydb = require("./index");

// Set the main database config
easydb.setConfig({
  host: "127.0.0.1",
  user: "root",
  password: "password",
  database: "easydb-test",
  port: 3306,
  logQueries: true // set to true if you want to log all queries to the console (good for debugging)
});

easydb.find({
  table: "users",
  children: {
    apps: ["apps", "id", "user_id"],
    image: ["user_pictures", "id", "user_id", "object"]
  }
}, function (results) {
  console.log(results[0]);
});
