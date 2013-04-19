var SqlString = require('./sql_string'); // for escaping queries
var _         = require('lodash');

// Build the conditions for a query
// Note that conditions can be a typical key: value system, or key: ['array', 'of', 'values'].
// The array of values corresponds to an 'IN (x,y,z)' query rather than a "= 'x'"
// SAMPLE OUTPUTS: WHERE id='1', WHERE id IN (1,2) [but with escaping]
exports.buildConditionsQuery = function(conditions) {
  if (conditions && !_.isEmpty(conditions)) {
    var condition_strings = [];
    _.each(conditions, function(value, key) {
      if (!_.isArray(value)) {
        condition_strings.push(key + ' = ' + SqlString.escape(value));
      } else {
        value = _.map(value, function(value_item) {
          return "'"+SqlString.escape(value_item)+"'";
        });
        condition_strings.push(key + ' IN (' + value.join(',') + ')');
      }
    });
    var whereQuery = ' WHERE ' + condition_strings.join(' AND ');
    return whereQuery;
  } else {
    return '';
  }
};

// Builds the values query for inserting. Compatible with single and many rows.
exports.buildInsertValuesQuery = function (fields) {
  // Get the field keys
  var query = '';
  var keys;
  if (!_.isArray(fields)) {
    keys = _.keys(fields);
  } else {
    keys = _.keys(fields[0]);
  }
  query += ' (' + keys.join(', ') + ')';

  // Get the values out
  query += ' VALUES ';
  var values;
  if (!_.isArray(fields)) {
    values = _.values(fields);
    values = _.map(values, function(value) {
      return SqlString.escape(value);
    });
    query += '(' + values.join(', ') + ')';
  } else {
    var query_arr = [];
    _.each(fields, function(field_row, index) {
      values = _.values(field_row);
      values = _.map(values, function(value) {
        return SqlString.escape(value);
      });
      query_arr.push('(' + values.join(', ') + ')');
    });
    query += query_arr.join(', ');
  }
  return query;
};

exports.buildUpdateSetQuery = function (fields) {
  var query = '';
  var set_arr = [];
  _.each(fields, function(field, key) {
    set_arr.push(key + ' = ' + SqlString.escape(field));
  });
  query += ' SET ' + set_arr.join(', ');
  return query;
};

exports.buildMultiUpdateSetQuery = function (fields, caseKey) {
  var keys = _.keys(fields[0]);
  if (_.isEmpty(keys)) return '';
  var query = ' SET';
  _.each(keys, function (key, index) {
    if (key === caseKey) return;
    query += ' '+ key + ' = CASE ' + caseKey;
    _.each(fields, function (field, k2) {
      query += " WHEN '"+field[caseKey]+"' THEN "+SqlString.escape(field[key]);
    });
    query += ' END';
    if (index !== keys.length - 1) {
      query += ',';
    }
  });
  return query;
};

// Builds a joins query
exports.buildJoinsQuery = function (joins) {
  var query = '';
  if (joins && _.isArray(joins)) {
    _.each(joins, function(join) {
      if (!join.table || !join.on) return;
      join.type = join.type || 'INNER';
      query += ' ' + join.type + ' JOIN ' + join.table;
      query += ' ON ' + join.on;
    });
  }
  return query;
};