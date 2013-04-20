var mysql = require("mysql");
var _     = require("lodash");


// The connection
var connection;

// Current status of the connection
var isConnectionOpen = false;


exports.query = function (query, config ,cb) {

  // Get out the connection details
  var connectionDetails = _.pick(config, 'host', 'user', 'password', 'database', 'port');

  // Create the connection
  openConnection(connectionDetails);

  // Log queries if we're on debug mode
  if (config.logQueries === true) {
    console.log("\n"+query);
  }

  // Do the query
  connection.query(query, function(err, rows, fields) {
    if (err) {
      cb(false);
      throw err;
    } else {
      cb(rows);
    }
  });

  // Close connection
  if (config.keepOpen !== true) {
    closeConnection(connection);
  }

};

var openConnection = function (details) {
  if (!isConnectionOpen) {
    connection  = mysql.createConnection(details);
    connection.connect();
    isConnectionOpen = true;
    // Handle disconnections
    handleDisconnect(connection);
  }
};

var closeConnection = function() {
  connection.end();
  isConnectionOpen = false;
};


// Handle disconnects if in theory the worst should happen and the server disconnects mid query
var handleDisconnect = function (connection) {
  connection.on('error', function(err) {
    if (!err.fatal) {
      return;
    }
    if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
      throw err;
    }
    console.log('Re-connecting lost connection: ' + err.stack);
    connection = mysql.createConnection(connection.config);
    handleDisconnect(connection);
    connection.connect();
  });
}