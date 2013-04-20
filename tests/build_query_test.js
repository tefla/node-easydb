var buster      = require("buster");
var _           = require("lodash");
var BuildQuery  = require("../core/build_query");


buster.testCase("Building queries", {

  "buildMultiUpdateSetQuery": function () {
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
    var expected = " SET name = CASE id WHEN '1' THEN 'chris' WHEN '2' THEN 'jenna' END, age = CASE id WHEN '1' THEN 22 WHEN '2' THEN 22 END, color = CASE id WHEN '1' THEN 'white' WHEN '2' THEN 'orange from all the fake tan' END";
    assert.equals(query, expected);
  }

});