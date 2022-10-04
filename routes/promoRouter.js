const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');

const Promos = require('../models/promotions');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter.route('/')
.get((req, res, next) => {
    Promos.find({})
    .then((promos) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promos);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    //only the Admins can perform POST, PUT and DELETE operations. Same for other operations and routes
    var err = authenticate.verifyAdmin(req.user.admin);
    if (err){
        next(err);
    } 
    else {
        Promos.create(req.body)
        .then((promo) => {
            console.log('Promo Created', promo);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promo);
        }, (err) => next(err))
        .catch((err) => next(err));
    }
})
.put(authenticate.verifyUser, (req, res, next) => {
    var err = authenticate.verifyAdmin(req.user.admin);
    if (err){
        next(err);
    } 
    else {
        res.statusCode = 403;
        res.end('Put operation not supported');
    }
})
.delete(authenticate.verifyUser, (req, res, next) => {
    var err = authenticate.verifyAdmin(req.user.admin);
    if (err){
        next(err);
    } 
    else {
        Promos.deleteMany({})
        .then((resp) => {
            console.log('Promos Deleted');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
    }
});

promoRouter.route('/:promoId')
.get((req, res, next) => {
    Promos.findById(req.params.promoId)
    .then((promo) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    var err = authenticate.verifyAdmin(req.user.admin);
    if (err){
        next(err);
    } 
    else {
        res.statusCode = 403;
        res.end('Post operation not supported on /promotions/' + req.params.promoId);
    }
})
.put(authenticate.verifyUser, (req, res, next) => {
    var err = authenticate.verifyAdmin(req.user.admin);
    if (err){
        next(err);
    } 
    else {
        Promos.findByIdAndUpdate(req.params.promoId, {
            $set: req.body
        }, {new: true})
        .then((promo) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promo);
        }, (err) => next(err))
        .catch((err) => next(err));
    }
})
.delete(authenticate.verifyUser, (req, res, next) => {
    var err = authenticate.verifyAdmin(req.user.admin);
    if (err){
        next(err);
    } 
    else {
        Promos.findByIdAndDelete(req.params.promoId)
        .then((resp) => {
            console.log('Promos Deleted');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
    }
});


module.exports = promoRouter;