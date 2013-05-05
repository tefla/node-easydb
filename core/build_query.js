var SqlString = require("./sql_string"); // for escaping queries
var _         = require("lodash");



exports.select = function(params) {

  var query;

  // Build the query
  if (!_.isArray(params.fields)) {
    query = "SELECT * FROM " + params.table;
  } else {
    query = "SELECT " + params.fields.join(", ") + " FROM " + params.table;
  }

  // If joins are specified
  query += " " + this.joinsQuery(params.joins);

  // Add conditions. 
  query += " "+this.conditionsQuery(params.conditions);

  // Order by
  if (params.order && params.order && params.order.key && params.order.sort) {
    query += " ORDER BY " + params.order.key + " " + params.order.sort;
  }

  // Limit
  if (params.type === "first") params.limit = 1;
  if (params.limit) {
    query += " LIMIT " + params.limit;
  }

  return query;

};


// Build the conditions for a query
// Note that conditions can be a typical key: value system, or key: ["array", "of", "values"].
// The array of values corresponds to an "IN (x,y,z)" query rather than a "= "x""
// SAMPLE OUTPUTS: WHERE id="1", WHERE id IN (1,2) [but with escaping]
exports.conditionsQuery = function(conditions) {
  if (conditions && !_.isEmpty(conditions)) {
    var condition_strings = [];
    _.each(conditions, function(value, key) {
      if (_.isFunction(value)) return;
      if (!_.isArray(value)) {
        condition_strings.push(key + " = " + SqlString.escape(value));
      } else {
        value = _.map(value, function(value_item) {
          return SqlString.escape(value_item);
        });
        condition_strings.push(key + " IN (" + value.join(",") + ")");
      }
    });
    var whereQuery = "WHERE " + condition_strings.join(" AND ");
    return whereQuery;
  } else {
    return "";
  }
};

// Builds the values query for inserting. Compatible with single and many rows.
exports.insertValuesQuery = function (fields) {
  // Get the field keys
  var query = "";
  var keys;
  if (!_.isArray(fields)) {
    keys = _.keys(fields);
  } else {
    keys = _.keys(fields[0]);
  }
  query += "(" + keys.join(", ") + ")";

  // Get the values out
  query += " VALUES ";
  var values;
  if (!_.isArray(fields)) {
    values = _.values(fields);
    values = _.map(values, function(value) {
      return SqlString.escape(value);
    });
    query += "(" + values.join(", ") + ")";
  } else {
    var query_arr = [];
    _.each(fields, function(field_row, index) {
      values = _.values(field_row);
      values = _.map(values, function(value) {
        return SqlString.escape(value);
      });
      query_arr.push("(" + values.join(", ") + ")");
    });
    query += query_arr.join(", ");
  }
  return query;
};

exports.updateSetQuery = function (fields) {
  var query = "";
  var set_arr = [];
  _.each(fields, function(field, key) {
    if (_.isFunction(field)) return;
    set_arr.push(key + " = " + SqlString.escape(field));
  });
  query += " SET " + set_arr.join(", ");
  return query;
};

exports.multiUpdateSetQuery = function (fields, caseKey) {

  // Go through all the fields and ensure that functions are removed
  _.each(fields, function (field, k1) {
    _.each(field, function (parameter, k2) {
      if (_.isFunction(parameter)) {
        delete field[k2];
      }
    });
    fields[k1] = field;
  });

  var keys = _.keys(fields[0]);
  if (_.isEmpty(keys)) return "";
  var query = "SET ";
  var whenArr = [];
  _.each(keys, function (key, index) {
    if (key === caseKey) return;
    var whenSection = key + " = CASE " + caseKey;
    _.each(fields, function (field, k2) {
      whenSection += " WHEN "+SqlString.escape(field[caseKey])+" THEN "+SqlString.escape(field[key]);
    });
    whenSection += " END";
    whenArr.push(whenSection);
  });
  query += whenArr.join(", ");
  return query;
};

// Builds a joins query
exports.joinsQuery = function (joins) {
  var query = "";
  if (joins && _.isArray(joins)) {
    _.each(joins, function(join) {
      if (!join.table || !join.on) return;
      join.type = join.type || "INNER";
      query += " " + join.type + " JOIN " + join.table;
      query += " ON " + join.on;
    });
  }
  return query;
};