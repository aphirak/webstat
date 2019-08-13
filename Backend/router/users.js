const express = require('express')
const router = express.Router()

const MessageHandle = require('../middleware/message')
const {Users} = require('../model/sequelize')

const passport = require('passport')
const permission = require('../middleware/permission')

router.post("/register", (req,res) => {
    const data = req.body
    
    Users.findOne({
      where : {
        username : data.username.toLowerCase()
      },
      attributes: ['username']
    })
    .then(user => {
      if(user === null){
        Users.create({
          username : data.username.toLowerCase(),
          fullname : data.fullname.toLowerCase(),
          section : data.section.toLowerCase()
        })
        .then((newuser) => {
          res.status(200).send(MessageHandle.ResponseText("created", newuser.get()))
        })
        .catch(err => {
          res.status(500).send(MessageHandle.ResponseText("error", err))
        })
      } else {
        res.status(200).send(MessageHandle.ResponseText("username does exist", user.get()))
      }
    })
    .catch(err => {
      console.log(err)
      res.status(500).send(MessageHandle.ResponseText("error", err))
    })
  })

  router.post("/login", (req, res, next) =>{
    passport.authenticate('user',(err, user, info) => {
      if(err) {
        return res.status(500).send(MessageHandle.ResponseText("Login Failed", err))
      } 
      if(!user) {
        return res.status(500).send(MessageHandle.ResponseText("Login Failed", info))
      }
      req.logIn(user, function(err){
        if(err) {
          return res.status(500).send(MessageHandle.ResponseText("Login Failed", err))
        }
        return res.status(200).send(MessageHandle.ResponseText("Login Succeed", {data : user}))
      })
    })(req, res, next);
  })

  router.get("/profile", permission.isLogin , (req, res) => {
    res.status(200).send(req.user)
  })

  router.post("/logout", permission.isLogin, (req, res) => {
    req.logout();
    res.status(200).send(MessageHandle.ResponseText('Logout succeed'))
  })

  module.exports = router