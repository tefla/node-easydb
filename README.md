# Node Easy DB

Take away the pain from writing and running SQL queries.


## Find

Find rows from the apps table.

```
EasyDB.find({
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

## Update

Coming soon.


## Insert

Coming soon.


## Delete

Coming soon.