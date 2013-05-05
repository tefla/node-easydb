var async = require("async");
var _     = require("lodash");

var buildQuery = require("../core/build_query");
var db         = require("../core/database");

var config     = {
  host: '127.0.0.1',
  user: 'root',
  password: 'password',
  database: 'easydb-test',
  port: 3306,
  logQueries: true
};


var easydb = {

  queue: [],

  attributes: {},

  // Adds a new item to the queue
  get: function(table) {
    var query = {
      type: "get",
      table: table
    };
    this.queue.push(query);
    return this;
  },

  // Adds a condition on the last item in the queue
  where: function(key, value) {
    var last = this.queue[this.queue.length - 1];
    last.conditions = {};
    last.conditions[key] = value;
    return this;
  },

  children: function(table, joinParentKey, joinChildKey) {
    var query = {
      type: "get_children",
      table: table,
      on: [joinParentKey, joinChildKey]
    };
    this.queue.push(query);
    return this;
  },

  // Go through the queue in series
  run: function() {

    // var query = 
   

    var queryFunctions = _.map(this.queue, function(item) {

      if (item.type === "get") {
        return function(callback) {
          var query;
          query = "SELECT * FROM "+item.table;
          query += ' '+buildQuery.buildConditionsQuery(item.conditions);
          db.query(query, config, function(result) {
            easydb.attributes[item.table] = result;
            easydb.parent = easydb.attributes[item.table];
            callback();
          });
        };
      }

      else if (item.type === "get_children") {
        return function(callback) {
          var parentKeys = _.pluck(easydb.parent, item.on[0]);
          query = "SELECT * FROM "+item.table;
          var conditions = {};
          conditions[item.on[1]] = parentKeys;
          query += ' '+buildQuery.buildConditionsQuery(conditions);
          db.query(query, config, function(childRows) {

            // Add children to parents
            easydb.parent = _.map(easydb.parent, function(parentObj) {
              parentObj[item.table] = [];

              _.each(childRows, function (child) {
                if (child[item.on[1]] === parentObj[item.on[0]]) {
                  parentObj[item.table].push(child);
                }
              });

              return parentObj;
            });

            callback();
          });
        };
      }

    });

    // var query;
    // if (first.type === "get") {
    //   query = "SELECT * FROM "+first.table;
    //   query += ' '+buildQuery.buildConditionsQuery(first.conditions);
    // }

    // Run the query and callback the rows
    async.series(queryFunctions, function(err, results) {
      console.log(easydb.attributes);
      // results is now equal to: {one: 1, two: 2}
    });


    

  }

};


easydb
  .get("users")
  .where("id", 2)
  .children("apps", "id", "user_id");



console.log(easydb.queue);
easydb.run();