var db         = require("./database"); // querying etc
var async      = require("async");
var _          = require("lodash");
var BuildQuery = require("./build_query");



var easydb = {};

// Set the main config details
var config = {};
easydb.setConfig = function(params) {
  config = _.extend(config, params);
};


/*
  Finds one or more things, and returns an array for them
  
  Example usage:
    find({
      table: "users",
      conditions: {
        id: 5
      },
      limit: 2
    })
*/
easydb.find = function(params, cb) {

  var _this = this;
  if (!params.table) {
    cb(false);
    return;
  }

  var query = BuildQuery.select(params);

  // See if we should keep the connection open
  config.keepOpen = params.keepOpen;

  // Run the query and callback the rows
  db.query(query, config, function(rows) {

    getChildren(rows, params.children, function() {

      if (params.type === "first") {
        cb(rows[0]);
      } else {
        cb(rows);
      }

    });
  
    
  });

};

// Find the children from the database
var getChildren = function(rows, children, cb) {

  if (!children) {
    cb();
    return;
  }

  var childQueries = {};

  _.each(children, function(child, key) {
    childQueries[key] = function(callback) {
      var options = {};
      options.table = child[0];
      options.conditions = {};
      options.conditions[child[2]] = _.pluck(rows, child[1]);
      easydb.find(options, function(childRows) {
        callback(null, childRows);
      });
    };
  });

  // Do the queries and add the children
  async.parallel(childQueries, function(err, childResults) {
    addChildren(rows, children, childResults);
    cb();
  });

};

// Take the children that have been fetched and add them to the parent rows
var addChildren = function(rows, children, childResults) {
  rows = _.map(rows, function(row) {
    _.each(children, function (child, key) {
      var whereCondition = {};
      whereCondition[child[2]] = row[child[1]];
      row[key] = _.where(childResults[key], whereCondition);
      if (child[3] === "object") row[key] = row[key][0];
    });
    return row;
  });
};


/* 
    Saves something to the database:
    
    Example usage:
      save({
        table: "users",
        fields: {
          name: "chris",
          description: "my description about this",
          code: "alert(x)"
        } 
      })

    Can also be used for saving multiple rows at once:
      save({
        table: "app_parameters",
        fields: [
          {
            app_id: 1234,
            key: "tes"
          },
          {
            // etc
          }
        ]
      })
  */
easydb.save = function(params, cb) {

  /** build the query **/

  if (!params.table || !params.fields) {
    cb(false);
    return;
  }

  // Starting up
  var query = "INSERT INTO " + params.table;

  // Add insert values
  query += " " + BuildQuery.insertValuesQuery(params.fields);

  /** run it **/

  // Run the query and callback the rows
  db.query(query, config, function(result) {
    if (result) {
      cb(result.insertId);
    } else {
      cb(result);
    }
  });

};

// Updates something
easydb.update = function(params, cb) {

  // Checks
  if (!params.table || !params.fields) {
    cb(false);
    return;
  }

  // Start up
  var query = "UPDATE " + params.table;

  // Add fields to update
  if (_.isArray(params.fields)) {
    query += " " + BuildQuery.multiUpdateSetQuery(params.fields, params.caseKey);
  } else {
    query += " " + BuildQuery.updateSetQuery(params.fields);
  }

  // Add conditions (same as in the find - see there for docs)
  query += " " + BuildQuery.conditionsQuery(params.conditions);

  /** run it **/

  // Run the query and callback the rows
  db.query(query, config, function(result) {
    if (result.affectedRows) {
      cb(true);
    } else {
      cb(false);
    }
  });

},


// Deletes something from the db
easydb.remove = function(params, cb) {

  // Checks
  if (!params.table) {
    cb(false);
    return;
  }

  // Start up
  var query = "DELETE FROM " + params.table;

  // Add conditions (same as in the find - see there for docs)
  query += " " + BuildQuery.conditionsQuery(params.conditions);

  // Run the query and callback the rows
  db.query(query, config, function(result) {
    if (result.affectedRows > 0) {
      cb(true);
    } else {
      cb(false);
    }
  });

};

module.exports = easydb;


