// Require all the necessary modules for the web scraper
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var Article = require("./models/articles.js");
var request = require("request");
var cheerio = require("cheerio");
var path = require("path")

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/redditscraper");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


// Routes
// ======
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname + '/public/html/index.html'));
})


// A GET request to scrape the reddit website
app.get("/scrape", function(req, res) {

  var counter = 0;
  var articles = [];


  request("https://www.reddit.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    var countdown = $("p.title").length
 
    $("p.title").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      if (result.link[0] === "/"){
        result.link = "https://www.reddit.com" + result.link
      }

      articles.push(result)

      });     
      
      res.send(articles)
  
   
    })    


  


    });
  // Tell the browser that we finished scraping the text









// This will get the articles we scraped from the mongoDB
app.get("/showarticles", function(req, res) {
  // Grab every doc in the Article array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});


// Create a new note or replace an existing note
app.post("/savearticle", function(req, res) {
  // Create a new note and pass the req.body to the entry
  console.log(req.body.title)
  var result = {};

  // Add the text and href of every link, and save them as properties of the result object
  result.title = req.body.title;
  result.link = req.body.link;
  result.status = "saved"
  result.notes = []
  result.status = "saved"
  
  var entry = new Article(result);

  // And save the new note the db
  entry.save(function(err, document) {
    // Log any errors
    if (err) {
      console.log(err);
    }
    else{
      res.send("success")
    }
  });
})

app.delete("/deletearticle", function(req, res) {
  // Create a new note and pass the req.body to the entry
  Article.findOne({ "_id": req.body.id })
  .remove()
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.send("removed document");
    }
  });

})



app.delete("/deletenote", function(req, res) {
  // Create a new note and pass the req.body to the entry
  console.log(req.body.name)
  console.log(req.body.comment)
  console.log(req.body.id)
  Article.update(
    { "_id": req.body.id},
    { $pull: { notes: { name: req.body.name , comment: req.body.comment } } },
    { multi: true }
    )
  // Execute the above query
  .exec(function(err, doc) {
    // Log any errors
    if (err) {
      console.log(err);
    }
      res.json(doc)
  });

})


app.post("/addnote", function(req, res) {
  // Create a new note and pass the req.body to the entry
  Article.findOneAndUpdate({ "_id": req.body.id }, {$push: {"notes": {name: req.body.name, comment: req.body.comment}}})
  // Execute the above query
  .exec(function(err, doc) {
    // Log any errors
    if (err) {
      console.log(err);
    }
      res.json(doc)
  });
})


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});

// mongodb://heroku_8h7bq78n:9lhr1s2sdn9klgf4858k5dru6h@ds163053.mlab.com:63053/heroku_8h7bq78n