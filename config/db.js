if(process.env.NODE_ENV == 'production'){
  module.exports = {mongoURI: "mongodb+srv://<username>:<password>@cluster0.jphny.mongodb.net/blogapp?retryWrites=true&w=majority"} 
}else{
  module.exports ={mongoURI: "mongodb://localhost/blogapp"}
}