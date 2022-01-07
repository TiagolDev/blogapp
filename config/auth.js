/* [[--- MODULES CONVERTIDOS PARA ES6 ---]]

import { Strategy as localStrategy } from 'passport-local'     
import { model } from 'mongoose'   
import { compare } from 'bcryptjs' 
*/
const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

//Model de usuário
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')

module.exports = (passport)=>{
   passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'},(email, senha, done)=>{
      Usuario.findOne({email: email}).then((usuario)=>{
         if(!usuario){
            return done(null, false, {message: 'Está conta não existe!'})
         }
         bcrypt.compare(senha, usuario.senha, (erro, confere)=>{
            if(confere){
               return done(null, usuario)
            }else{ 
               return done(null, false, {message: 'Senha incorreta!'})
            }
         })
      }).catch((err)=> {
         req.flash('error_msg', 'Houve um erro interno, ao efetuar o login.')
         req.flash('/')
      })
   }))
   passport.serializeUser((usuario, done)=>{
      done(null, usuario.id)
   })
   passport.deserializeUser((id, done)=>{
      Usuario.findById(id, (err, usuario)=>{
         done(err, usuario)
      }) 
   })
}