const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')               //É assim que se usa o model de forma externa dentro do mongoose
require('../models/Categoria')                     //Você exporta o mongoose
const Categoria = mongoose.model('categorias')     //Chama o arquivo model
require('../models/Postagem')                      //E depois vocẽ chama a função que faz passar a referecia do seu model para uma variavel
const Postagem = mongoose.model('postagens')
const {isAdmin} = require('../helpers/isAdmin')

   router.get('/', (req, res)=>{
      res.render('admin/index')
   })
   router.get('/categorias', isAdmin, (req, res)=>{
      Categoria.find().sort({date: 'DESC'}).then((categorias)=>{
         res.render('admin/categorias', {categorias: categorias})
      }).catch((err)=>{
         req.flash('error_msg', 'Houve um erro ao listar as categorias!')
         res.redirect('/routes/admin')
         })
      })
   router.get('/categorias/add', isAdmin, (req, res)=>{
      res.render('admin/addcategorias')
   })
   router.post('/categorias/nova', isAdmin, (req, res)=>{
      let erros = []
         if(!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null){
            erros.push({texto: 'Nome inválido!'})
         }
         if(!req.body.slug || typeof req.body.slug === undefined || req.body.slug === null){
            erros.push({texto: 'Slug inválido!'})
         }
         if(req.body.nome.length < 2){
            erros.push({texto: 'Nome da categoria é muito curto!'})
         }
         if(erros.length > 0){
            res.render('admin/addcategorias', {erros: erros})
         }else{
            const novaCategoria = {
               nome: req.body.nome,
               slug: req.body.slug
            }   
            new Categoria(novaCategoria).save().then(()=>{
               req.flash('success_msg', 'Categoria criada com sucesso!')
               res.redirect('/routes/admin/categorias')
            }).catch((err)=>{
               req.flash('error_msg', 'Houve um erro, ao salvar a categoria, tente novamente!')
               res.redirect('/routes/admin')
            }) 
         }
      })
   router.get('/categorias/edit/:id', isAdmin, (req, res)=>{
      Categoria.findOne({_id:req.params.id}).then((categoria)=>{
         res.render('admin/editcategorias', {categoria: categoria})
      }).catch((err)=>{
         req.flash('error_msg', 'Esta categoria não existe')
         res.redirect('/routes/admin/categorias')
      })
   })
   router.post('/categorias/edit', isAdmin, (req, res)=>{
      Categoria.findOne({_id:req.body.id}).then((categoria)=>{
         let erros = []
         if(!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null){
            erros.push({texto: 'Nome inválido!'})
         }else if(!req.body.slug || typeof req.body.slug === undefined || req.body.slug === null){
            erros.push({texto: 'Slug inválido!'})
         }else if(req.body.nome.length < 2){
            erros.push({texto: 'Nome da categoria é muito curto!'})
         }else{
            const editCategoria = {  
               nome: req.body.nome,
               slug: req.body.slug
            }
            new Categoria(editCategoria).save().then(()=>{
               req.flash('success_msg', 'Categoria editada e salva, com sucesso.')
               res.redirect('/routes/admin/categorias')
            }).catch((err)=>{
               req.flash('error_msg', 'Houve um erro interno, ao salvar a edição da categoria.')
               res.redirect('/routes/admin/categorias')
            })
         }
      }).catch((err)=>{
         req.flash('error_msg', 'Houve um erro, ao editar a categoria.')
         res.redirect('/routes/admin/categorias')
      })
   })
   router.post('/categorias/deletar', isAdmin, (req, res)=>{
      Categoria.deleteOne({_id:req.body.id}).then(()=>{
         req.flash('success_msg', 'Categoria deletada, com sucesso!')
         res.redirect('/routes/admin/categorias')
      }).catch((err)=>{
         req.flash('error_msg', 'Houve um erro, ao deletar a categoria!')
         res.redirect('/routes/admin/categorias')
      })
   })
   router.get('/postagens', isAdmin, (req, res)=>{
      Postagem.find().populate('categoria').sort({data:'DESC'}).then((postagens)=>{
         res.render('admin/postagens', {postagens: postagens})       
      }).catch((err)=>{
         req.flash('error_msg', 'Houve um erro ao listar as postagens!')
         res.redirect('/routes/admin')
      })
   })
   router.get('/postagens/add', isAdmin, (req, res)=>{
      Categoria.find().then((categorias)=>{
         return res.render('admin/addpostagens', {categorias: categorias})
         console.log(err);
      }).catch((err)=>{
         req.flash('error_msg', 'Houve um erro interno, ao carregar o formulário!')
         res.redirect('/routes/admin/postagens')
      })
   })
   router.post('/postagens/nova', isAdmin, (req, res)=>{
      let erros = []
         if(!req.body.titulo || typeof req.body.titulo === undefined || req.body.titulo === null){
            erros.push({texto: 'Titulo inválido!'})
         }if(!req.body.slug || typeof req.body.slug === undefined || req.body.slug === null){
            erros.push({texto: 'Slug inválido!'})
         }if(req.body.categorias === "0"){
            erros.push({texto: "Categoria inválida, registre uma categoria"})
         }else if(erros.length > 0){
            res.render('admin/addpostagens', {erros: erros})
         }else{
            const novaPostagem = {
               titulo: req.body.titulo,
               slug: req.body.slug,
               descricao: req.body.descricao,
               conteudo: req.body.conteudo,
               categoria: req.body.categoria
            }
            new Postagem(novaPostagem).save().then(()=>{
               req.flash('success_msg', 'Postagem criada com sucesso!')
               res.redirect('/routes/admin/postagens')
            }).catch((err)=>{
               req.flash('error_msg', 'Houve um erro interno, ao salvar a postagem!')
               res.redirect('/routes/admin/postagens')
            })
         }
      })
   router.get('/postagens/edit/:id', isAdmin, (req, res)=>{
      Postagem.findOne({_id: req.params.id }).then((postagem)=>{
         Categoria.find().then((categorias)=>{ //Fazendo busca sequêncial no banco de dados
            res.render('admin/editpostagens', {categorias: categorias, postagem: postagem})   
         }).catch((err)=>{
            req.flash('error_msg', 'Esta postagem não existe')
            res.redirect('/routes/admin/postagens')
         })
      }).catch((err)=>{ 
         req.flash('error_msg', 'houve um erro ao carregar o formulário de edição')
         res.redirect('/routes/admin/postagens')
      })
   })
   router.post('/postagens/edit', isAdmin, (req, res)=>{
      Postagem.findOne({_id: req.body.id}).then((postagem)=>{
      let erros = []
         if(!req.body.titulo || typeof req.body.titulo === undefined || req.body.titulo === null) {
            erros.push({texto: 'Titulo inválido!'})
         }if(!req.body.slug || typeof req.body.slug === undefined || req.body.slug === null){
            erros.push({texto: 'Slug inválido!'})
         }else if(erros.length > 0){
            res.render('admin/addpostagens', {erros: erros})
         }else{
            const editPostagem = {
               titulo: req.body.titulo,
               slug: req.body.slug,
               descricao: req.body.descricao,
               conteudo: req.body.conteudo,
               categoria: req.body.categoria
            }
            new Postagem(editPostagem).save().then(()=>{
               req.flash('success_msg', 'Postagem editada, com sucesso.')
               res.redirect('/routes/admin/postagens')
            }).catch((err)=>{
               req.flash('error_msg', 'Houve um erro interno, ao salvar a edição da postagem.')
               res.redirect('/routes/admin/postagens')
            })
         }
      }).catch((err)=>{
         req.flash('error_msg', 'Houve um erro, ao salvar a edição.')
         res.redirect('/routes/admin/postagens')
      })
   })
   router.post('/postagens/deletar', isAdmin, (req, res)=>{
      Postagem.deleteOne({_id:req.body.id}).then(()=>{
         req.flash('success_msg', 'Postagem deletada, com sucesso!')
         res.redirect('/routes/admin/postagens')
      }).catch((err)=>{
         req.flash('error_msg', 'Houve um erro interno, ao deletar a postagem!')
         res.redirect('/routes/admin/postagens')
      }) 
   })
module.exports = router