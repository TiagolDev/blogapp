//Carregando módulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const morganBody = require('morgan-body')
const fs = require('fs')
const admin = require('./routes/admin')
const path = require('path')        //trabalha com diretórios e serve para manipular pastas
const app = express()
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
require('./models/Postagem')
const Postagem = mongoose.model('postagens')
require('./models/Categoria')
const Categoria = mongoose.model('categorias')
const usuarios = require('./routes/usuario')
const passport = require('passport')
require('./config/auth')(passport)
const db = require('./config/db')
//Configurações  -->  app.use serve para criação e configuração de MIDDLEWARES
   //Sessão
      app.use(session({
         secret: 'JornadaWorkover',
         resave: true,
         saveUninitialized: true
      }))
      app.use(passport.initialize())
      app.use(passport.session())
      app.use(flash())
   //Middleware
      app.use((req, res, next)=>{
         res.locals.success_msg = req.flash('success_msg')
         res.locals.error_msg = req.flash('error_msg')
         res.locals.error = req.flash('error')
         res.locals.user = req.user || null
      next()
      })
   //Body Parser
      app.use(bodyParser.urlencoded({extended: true}))
      app.use(bodyParser.json())
      
      const log = fs.createWriteStream(
         path.join(__dirname, "./logs", "express.log"), {flags: "a"}
      )
      morganBody(app,{
         noColors: true,
         stream: log
      })
   //Handlebars
      app.engine('handlebars', handlebars({
         defautLayout: 'main', runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefaut: true,
         },
      }))
      app.set('view engine', 'handlebars')
      app.set("views", "views")
   //Mongoose
      mongoose.Promise = global.Promise
      mongoose.connect(db.mongoURI).then(()=>{
         console.log("Conectado ao mongo.")
      }).catch((err)=>{
         console.log(`Erro ao se conectar: ${err}`);
      })
   //Public
      app.use(express.static(path.join(__dirname, 'public')))//Dessa forma pega o caminho completo do diretório/pasta e minimiza os erros
//Rotas
   app.get('/', (req, res)=>{
      Postagem.find().populate('categoria').sort({data:'DESC'}).then((postagens)=>{
         res.render('index', {postagens: postagens})          
      }).catch((err)=>{
         req.flash('error_msg', 'Houve um erro interno!')
         res.redirect('/404')
      })
   })
   app.get('/404', (req, res)=>{
      res.send('Erro 404!')
   })
   app.get('/postagem/:slug', (req, res)=>{
      Postagem.findOne({slug: req.params.slug}).then((postagem)=>{
         if(postagem){
            res.render('postagem/index', {postagem: postagem})
         }else{
            req.flash('error_msg', 'Esta postagem não existe')
            res.redirect('/')
         }
         }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro interno!')
            res.redirect('/')
         })
      })
   app.get('/categorias', (req, res)=>{ 
      Categoria.find().then((categorias)=>{
         res.render('categorias/index', {categorias: categorias})
      }).catch((err)=>{
         req.flash('error_msg', 'Houve um erro interno, ao listar as categorias!')
         res.redirect('/')
      })
   })
   app.get('/categorias/:slug', (req, res)=>{
      Categoria.findOne({slug:req.params.slug}).then((categoria)=>{
         if(categoria){
            Postagem.find({categoria: categoria._id}).then((postagens)=>{
               res.render('categorias/postagens', {postagens: postagens, categoria: categoria})
            }).catch((err)=>{
               req.flash('error_msg', 'Houve um erro ao listar os posts!')
               res.redirect('/')
            })
         }else{
            req.flash('error_msg', 'Esta categoria não exite!')
            res.redirect('/')
         }
      }).catch((err)=>{
         req.flash('error_msg', 'Houve um erro interno, ao tentar carregar a página desta categoria!')
         res.redirect('/')
      })
   })
   app.use('/routes/admin', admin)
   app.use('/usuarios', usuarios)

//Conexão aberta com a porta
const PORT = process.env.PORT || 8055
app.listen(PORT,()=>{
   console.log('O servidor está rodando...')
})