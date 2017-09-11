// Require mongoose
var mongoose = require("mongoose");
// Create a schema class
var Schema = mongoose.Schema;

// Create the Note schema
var ArticleSchema = new Schema({
  // Just a string
  title: {
    type: String
  },
  // Just a string
  link: {
    type: String
  },
  notes: {
    type: Array
  },
  status: {
    type: String,
    default: "none"
  }
});

// Remember, Mongoose will automatically save the ObjectIds of the notes
// These ids are referred to in the Article model

// Create the Note model with the ArticleSchema
var Article = mongoose.model("Article", ArticleSchema);

// Export the Note model
module.exports = Article;