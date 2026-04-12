import  exp from 'express'
import {UserModel} from '../models/UserModel.js'
import {ArticleModel} from '../models/ArticleModel.js'
import {verifyToken} from "../middlewares/VerifyToken.js"
export const authorApp = exp.Router()

// Write article (Protected route)

authorApp.post("/article", verifyToken("AUTHOR"), async(req,res)=> {
    // Get articleObj from client
    const articleObj = req.body
    // Get user from decoded token
    let user=req.user
    // Check author
    let author=await UserModel.findById(articleObj.author)
    //checking author email
    if(author.email != user.email)
    {
        return res.status(403).json({message:"You are not authorized"})
    }
    if(!author)
    {
        return res.status(404).json({message:"Invalid author"})
    }
    // Create article document
    const articleDoc = new ArticleModel(articleObj)
    // Save to DB
    await articleDoc.save()
    // Send response
    res.status(201).json({message:"Article published successfully!"})
})

// Read own articles

authorApp.get("/articles",verifyToken("AUTHOR"),async(req,res)=> {
  // Get author id from decoded token 
  const authorIdOfToken = req.user?.id
  // Get articles by author id
  const articlesList = await ArticleModel.find({author:authorIdOfToken})
  // Send response
  res.status(200).json({message:"Articles:",payload:articlesList})
})

//Edit own articles

authorApp.put("/articles",verifyToken("AUTHOR"),async(req,res)=> {
  //Get author id from decoded token
  const authorIdOfToken = req.user?.id
//Get modified article from client
const {articleId,title,category,content} = req.body
 const modifiedArticle= await ArticleModel.findOneAndUpdate(
  { _id:articleId,author:authorIdOfToken},
  { $set : {title,category,content}},
  {new : true}
 )
 // If either article id or author is not correct
 if(!modifiedArticle) 
{
    return res.status(403).json({message:"You are not authorized to edit the article"})
}
 res.status(200).json({message:"Article modified successfully",payload:modifiedArticle})
})

//Delete (Soft delete so that author can restore again)
authorApp.patch("/articles",verifyToken('AUTHOR'),async(req,res)=>{
//Get author id from decoded token
const authorIdOfToken = req.user?.id
// Get modified article from client
const {articleId,isArticleActive} = req.body
//Get article by id 
const articleOfDB  = await ArticleModel.findOne({_id:articleId,author:authorIdOfToken})
//Check status
if(isArticleActive === articleOfDB.isArticleActive) {
  return res.status(200).json({message:"Article is already in the same state"})
}
articleOfDB.isArticleActive = isArticleActive
await articleOfDB.save() //save since its document in db
//Send response
res.status(200).json({message:"Article modified",payload:articleOfDB})
})