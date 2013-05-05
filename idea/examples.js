// Instead of having typical callbacks etc, work on a queueing mechanism
// where we add a bunch of things to the queue, and then run them all, 
// returning the results.
// Anything to get rid of the async stuff!

// Fetching array with children
var apps = corejs.get("apps");
var parameters = corejs.get("apps_parameters").where("user_id", 1);
apps.add("parameters", parameters, "id", "user_id");
corejs.run(function() {
  // the apps and parameters variables now exist with all their details
  // along with the parameters being attached to the apps.
});

// Updating an object
corejs.save("apps", app).where("id", 1);

// Saving a new object (as app.id doesn't exist, assume new)
corejs.save("apps", app);

// Updating a collection 
// `parameters` is an array
corejs.save("apps_parameters", parameters).where("app_id", [1,2,3,4]);


// Deleting one or more things
corejs.destroy("apps").where("id", 1);