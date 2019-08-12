const express = require('express')
const router = express.Router()

const MessageHandle = require('../messagehandle/message')
const {Users} = require('../model/sequelize')

const passport = require('passport')
const Imap =require('../Imap/imap') // for auth with kasetsart university (IMAP protocol)

router.post("/register", (req,res) => {
    const data = req.body
    
    Users.findOne({
      where : {
        username : data.username
      },
      attributes: ['username']
    })
    .then(user => {
      if(user === null){
        Users.create(data)
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

  // router.post("/login",(req, res) => {
  //   // const username = req.header('username')
  //   // const password = req.header('password')
  //   // Imap.auth(username, password)
  //   // .then(result => {
  //   //   if(result.status == true) {
  //   //     res.status(200).send(MessageHandle.ResponseText("Login Succeed", result.message))
  //   //   } else {
  //   //     res.status(200).send(MessageHandle.ResponseText("Login Failed", result.message))
  //   //   }
  //   // })
  //   // .catch(err => {
  //   //   res.status(500).send(MessageHandle.ResponseText("Login Failed", err))
  //   // })

  // })
  router.post("/login", (req, res, next) =>{
    passport.authenticate('user',(err, user, info) => {
      if(err) {
        res.status(500).send(MessageHandle.ResponseText("Login Failed", err))
      } 
      if(!user) {
        res.status(500).send(MessageHandle.ResponseText("Login Failed", info))
      } else {
        res.status(200).send(MessageHandle.ResponseText("Login Succeed", {data : user}))
      }
    })(req, res, next);
  })


  function isLoggedIn(req, res, next) {
    // passport adds this to the request object
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).send("unauthorized")
}

  router.get("/profile", isLoggedIn, (req, res) => {
    res.status(200).send(req.user)
  })

  module.exports = router