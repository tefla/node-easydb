var db         = require('./database'); // querying etc
var _          = require('lodash');
var BuildQuery = require('./build_query');



// Set the main config details
var config = {};
exports.setConfig = function(params) {
  config = _.extend(config, params);
};


/*
  Finds one or more things, and returns an array for them
  
  Example usage:
    find({
      table: 'users',
      conditions: {
        id: 5
      },
      limit: 2
    })
*/
exports.find = function(params, cb) {

  var _this = this;
  if (!params.table) {
    cb(false);
    return;
  }

  // Build the query
  if (!_.isArray(params.fields)) {
    query = 'SELECT * FROM ' + params.table;
  } else {
    query = 'SELECT ' + params.fields.join(', ') + ' FROM ' + params.table;
  }

  // If joins are specified
  query += ' ' + BuildQuery.buildJoinsQuery(params.joins);

  // Add conditions. 
  query += ' '+BuildQuery.buildConditionsQuery(params.conditions);

  // Order by
  if (params.order && params.order && params.order.key && params.order.sort) {
    query += ' ORDER BY ' + params.order.key + ' ' + params.order.sort;
  }

  // Limit
  if (params.limit) {
    query += ' LIMIT ' + params.limit;
  }

  // See if we should keep the connection open
  config.keepOpen = params.keepOpen;

  // Run the query and callback the rows
  db.query(query, config, function(result) {
    cb(result);
  });

};



/* 
    Saves something to the database:
    
    Example usage:
      save({
        table: 'users',
        fields: {
          name: 'chris',
          description: 'my description about this',
          code: 'alert(x)'
        } 
      })

    Can also be used for saving multiple rows at once:
      save({
        table: 'app_parameters',
        fields: [
          {
            app_id: 1234,
            key: 'tes'
          },
          {
            // etc
          }
        ]
      })
  */
exports.save = function(params, cb) {

  /** build the query **/

  if (!params.table || !params.fields) {
    cb(false);
    return;
  }

  // Starting up
  var query = 'INSERT INTO ' + params.table;

  // Add insert values
  query += ' ' + BuildQuery.buildInsertValuesQuery(params.fields);

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
exports.update = function(params, cb) {

  // Checks
  if (!params.table || !params.fields) {
    cb(false);
    return;
  }

  // Start up
  var query = 'UPDATE ' + params.table;

  // Add fields to update
  if (_.isArray(params.fields)) {
    query += ' ' + BuildQuery.buildMultiUpdateSetQuery(params.fields, params.caseKey);
  } else {
    query += ' ' + BuildQuery.buildUpdateSetQuery(params.fields);
  }

  // Add conditions (same as in the find - see there for docs)
  query += ' ' + BuildQuery.buildConditionsQuery(params.conditions);

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
exports.remove = function(params, cb) {

  // Checks
  if (!params.table) {
    cb(false);
    return;
  }

  // Start up
  var query = 'DELETE FROM ' + params.table;

  // Add conditions (same as in the find - see there for docs)
  query += ' ' + BuildQuery.buildConditionsQuery(params.conditions);

  // Run the query and callback the rows
  db.query(query, config, function(result) {
    if (result.affectedRows > 0) {
      cb(true);
    } else {
      cb(false);
    }
  });

};
