var buster      = require("buster");
var _           = require("lodash");
var BuildQuery  = require("../core/build_query");


buster.testCase("Building queries", {

  "buildConditionsQuery (IN) - number input": function () {
    var query = BuildQuery.buildConditionsQuery({
      id: [2684, 2432]
    });
    assert.equals(query, "WHERE id IN (2684,2432)", 'handles numbers without adding quotes');
  },

  "buildConditionsQuery (IN) - string input": function () {
    var query = BuildQuery.buildConditionsQuery({
      id: ["i don't know", "testing 123"]
    });
    assert.equals(query, "WHERE id IN ('i don\\'t know','testing 123')", 'handles strings');
  },


  "buildMultiUpdateSetQuery - number base key": function () {
    var fields = [{
      id: 1,
      name: 'chris',
      age: 22,
      color: 'white'
    }, {
      id: 2,
      name: 'jenna',
      age: 22,
      color: 'orange from all the fake tan'
    }];
    var query = BuildQuery.buildMultiUpdateSetQuery(fields, 'id');
    var expected = "SET name = CASE id WHEN 1 THEN 'chris' WHEN 2 THEN 'jenna' END, age = CASE id WHEN 1 THEN 22 WHEN 2 THEN 22 END, color = CASE id WHEN 1 THEN 'white' WHEN 2 THEN 'orange from all the fake tan' END";
    assert.equals(query, expected);
  },

  "buildMultiUpdateSetQuery - string base key": function() {
    var fields = [ { name: 'name', type: 'text', helper: 'what\'s your name', id: '3' }, { name: 'age', type: 'text', helper: 'and your age?', id: '4' } ];
    var query = BuildQuery.buildMultiUpdateSetQuery(fields, 'id');
    var expected = "SET name = CASE id WHEN '3' THEN 'name' WHEN '4' THEN 'age' END, type = CASE id WHEN '3' THEN 'text' WHEN '4' THEN 'text' END, helper = CASE id WHEN '3' THEN 'what\\'s your name' WHEN '4' THEN 'and your age?' END";
    assert.equals(query, expected);
  }

























});