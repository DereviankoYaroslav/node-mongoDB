const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

//Express router() for the '/favorites' 

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200);})
//GET operation on '/favorites' with population
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
//POST operation to add dishes to Favorites.dishes
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    var myDishes = [];
    var counter;
        Favorites.findOne({user: req.user._id})
        .then((user) => {
            if (user === null){
                counter = 0;
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
                counter = 0;
                req.body.forEach((dish) => {
                    myDishes[counter] = dish._id;
                    counter++;
                });
                user.dishes = myDishes;
                console.log(user.dishes);
                user.save();
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(user);
            }
        })
        .catch((err) => next(err));
})
//DELETE operation to delete favorite of corresponding user
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.deleteOne({user: req.user._id})
    .then((resp) => {
        console.log(resp);
        if (resp.n !== 0){
            console.log('Favorites of User Deleted');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }
        else {
            var err = new Error ('Nothing to delete for you')
            err.status = 404;
            next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200);})
//GET operation to get info about the dish from request if it is in user's favorites
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    console.log(req.user);
    var seachedDish = 404;
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((fav) => {
        fav.dishes.forEach((dish) => {
            if(dish._id.equals(req.params.dishId)){
                console.log("IS HERE")
                seachedDish = dish;
            }
        });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(seachedDish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
//POST operation to add dish from req.params.dishId to Favorites.dishes if not already in list
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
        .then((user) => {
            if (user !== null){
                if(user.dishes.includes(req.params.dishId)){
                    var err = new Error ('Already in list');
                    err.status = 409;
                    next(err);
                }
                else {
                    user.dishes.push(req.params.dishId);
                    console.log(user.dishes);
                    user.save();
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(user);
                }
            }
            else {
                var err = new Error ('Nothing to delete for you')
                err.status = 404;
                next(err);
            }
        })
        .catch((err) => next(err));
})
//DELETE operation to delete dish from Favorites.dishes according to the req.params.dishId if it is in list
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
        .then((user) => {
            if (user !== null){
                if(user.dishes.includes(req.params.dishId)){
                    user.dishes.pop(req.params.dishId);
                    console.log(user.dishes);
                    user.save();
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(user);
                }
                else {
                    var err = new Error ('Not in list');
                    err.status = 404;
                    next(err);
                }
            }
            else {
                var err = new Error ('Nothing to delete for you')
                err.status = 404;
                next(err);
            }
        })
        .catch((err) => next(err));
});


module.exports = favoriteRouter;