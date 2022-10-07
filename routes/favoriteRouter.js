const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200);})
.get(cors.cors, (req, res, next) => {
    Favorites.find({})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    var myDishes = [];
    counter = 0;
        Favorites.findOne({user: req.user._id})
        .then((user) => {
            if (user === null){
                req.body.forEach((dish) => {
                    myDishes[counter] = dish._id;
                    counter++;
                });
                var user = req.user._id;;
                var myFav = {
                    user: user,
                    dishes: myDishes
                }
                Favorites.create(myFav)
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err))
                .catch((err) => next(err)); 
            }
            else {
                var err = new Error('Already in list');
                err.status = 409;
                req.body.forEach((dish) => {
                    user.dishes.forEach((dishInList) => {
                        if(dish._id.str === dishInList.str){
                            console.log("Error");
                        }
                    });
                });
                next(err);
            }
        })
        .catch((err) => next(err));
});


module.exports = favoriteRouter;