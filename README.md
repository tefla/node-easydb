# Node Easy DB - Alpha

Take away the pain from writing and running SQL queries.

## Install

```
npm install easydb
```

<a href="https://github.com/chrisjhoughton/Node-EasyDB/wiki/Changelog">View the changelog</a>.


## Introduction

This plugin builds upon the <a href="https://github.com/felixge/node-mysql">node-mysql</a> plugin originally created by 
felixge, by taking things a step further and stopping you from ever having to write SQL queries again. Instead, you 
might fun a function like this:

```
easydb.find({
  table: 'apps'
}, function (rows) {
  // rows are returned
});
```

I first built this plugin as a way of abstracting messy SQL queries and database connections away from the main application.
Right now it supports the majority of standard queries, including:

* SELECT, UPDATE, DELETE
* field specification
* joins
* order, limits
* multi-row update queries (different parameters on each)


### Connecting to the database

By default, Easydb connects before each query (`find`, `update` etc) and disconnects afterwards. This is done so you 
don't have to connect/disconnect at the start/end of each request.

If you're wanting to do multiple queries however in one request, then set the parameter `keepOpen: true` in the query:

```
easydb.find({
  table: 'users',
  keepOpen: true
}
}, function (rows) {
  
});
```

When you run your regular query further down, just omit the `keepOpen: true` parameter (or set it to false) and then
Easydb will close the connection after that query.


# Usage

## Find

Find rows from the apps table.

```
easydb.find({
  table: 'apps',          // the table you're querying
  fields: ['id', 'name']  // the fields you want to get
  conditions: {           // the conditions for finding (these are AND filters)
    id: 253,
    name: 'test'
  },
  order: {
    key: 'added',         // order by the 'added' column descending
    sort: 'desc'
  },
  limit: 10               // get up to 10 rows. Defaults to 20 if not specified.
}, function(apps) {
  console.log(apps);      // an array of rows found
});
```

## Insert

Insert a row to the app_parameters table.

```
easydb.save({
  table: 'app_parameters',
  fields: {
    app_id: 1234,
    key: 'tes'
  }, {
    // etc
  }
}, function(result) {
  
});
```


## Update

Update row(s) in the apps table.

```
easydb.update({
  table: 'apps',
  fields: [{
    name: 'chris',
    age: 23
  }],
  conditions: {
    id: 123
  }
}, function(result) {
  
})
```


## Remove

Remove row from the apps table.

```
easydb.remove({
  table: 'apps',
  conditions: {
    id: 123
  }
}, function(result) {
  
})
```


