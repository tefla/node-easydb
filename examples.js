var easydb = require('easydb');

// Set the main database config
easydb.setConfig({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'mydatabase',
  port: 8889,
  logQueries: false
});


// Find all rows in the 'apps' table where the id is 3280 (should be an array of length 1)
easydb.find({
  table: 'apps',
  conditions: {
    id: 3280
  }
}, function(apps) {
  console.log(apps);
});
