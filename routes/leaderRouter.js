const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');

const Leaders = require('../models/leaders');

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
.get((req, res, next) => {
    Leaders.find({})
    .then((leaders) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leaders);
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
        Leaders.create(req.body)
        .then((leader) => {
            console.log('Leader Created', leader);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(leader);
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
        Leaders.deleteMany({})
        .then((resp) => {
            console.log('Leaders Deleted');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
    }
});

leaderRouter.route('/:leaderId')
.get((req, res, next) => {
    Leaders.findById(req.params.leaderId)
    .then((leader) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
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
        res.end('Post operation not supported on /leaders/' + req.params.promoId);
    }
})
.put(authenticate.verifyUser, (req, res, next) => {
    var err = authenticate.verifyAdmin(req.user.admin);
    if (err){
        next(err);
    } 
    else {
        Leaders.findByIdAndUpdate(req.params.leaderId, {
            $set: req.body
        }, {new: true})
        .then((leader) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(leader);
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
        Leaders.findByIdAndDelete(req.params.leaderId)
        .then((resp) => {
            console.log('Leaders Deleted');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
    }
}); 


module.exports = leaderRouter;