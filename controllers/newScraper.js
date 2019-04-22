// Dependencies
var express = require("express");
var mongoose = require("mongoose");

var logger = require("morgan");
//var path = require("path");
var router = express.Router();
var axios = require('axios');
var cheerio = require('cheerio');

// Initialize Express
var app = express();

// MODEL
var db = require('../models/Index');

// Routes
// ======
// Simple index route
router.get("/", function (req, res) {
    res.render('index');
});

//A GET route for scraping the cnn website
router.get("/scrape", function (req, res) {
    axios.get('https://www.cnn.com/')
        .then(function (response) {
            var $ = cheerio.load(response.data);

            // Now, we grab every h2 within an article tag, and do the following:
            $('article h2').each(function (i, element) {
                var result = {};

                // Add the text and href of every link, and save them as properties of the result object
                result.title = $(element)

                    //.children("a")
                    //.text();
                    .find('h2.esl82me2')
                    .text();

                result.link =
                    'https://www.cnn.com' +
                    $(element)
                         .find('a')
                        //.children("a")
                        .attr('href');

                result.description = $(element)
                    .find('p.e1n8kpyg0')
                    .text();

                // Create a new Article using the `result` object built from scraping
                db.Article.create(result)
                    .then(function (dbArticle) {
                        console.log(dbArticle);
                    })
                    .catch(function (err) {
                        console.log(err);
                        return res.json(err);
                    });
            });

            // Send a message to the client
            res.send('Done Scraping');
        });
});

// Route for getting all Articles from the db
router.get('/articles', function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({ saved: false })
        .then(function (dbArticle) {
            res.json(dbArticle);

        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route to get save articles and render into handlebars
router.get('/saved', function (req, res) {
    db.Article.find({ saved: true })
        .populate('notes')
        .exec(function (error, articles) {
            res.render('saved', { articles: articles });
        });
});

// Route to clear articles
router.get('/clear', function (req, res) {
    db.Article.remove({})
        .then(function () {
            console.log('Article Removed');
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
router.post('/articles/saved/:id', function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: true }).exec(
        function (err, note) {
            if (err) {
                console.log(err);
            } else {
                res.send(note);
            }
        }
    );
});

// Route for display the Note
router.get('/articles/:id', function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate('note')
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});
// Route for deleting a Note
router.post('/articles/delete/:id', function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: false, notes: [] }
    ).then(function (err, note) {
        if (err) {
            console.log(err);
        } else {
            res.send(note);
        }
    });
});

// Route for saving a Note
router.post('/articles/:id', function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true }
            );
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

//EXPORT ROUTER
module.exports = router;