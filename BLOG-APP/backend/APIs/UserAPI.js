import  exp from 'express'
import {verifyToken} from '../middlewares/VerifyToken.js'
import {ArticleModel} from '../models/ArticleModel.js'
export const userApp = exp.Router()

//Read articles of all authors
userApp.get('/articles',verifyToken("USER"),async(req,res)=>{
 //Read articles which are only active 
 const articlesList = await ArticleModel.find({isArticleActive:true}) //To filter only active articles
//Send response
res.status(200).json({message:"Articles are:",payload:articlesList})
})

//Add comment to an article
userApp.put('/articles',verifyToken("USER"),async(req,res)=>{
    //Get body from request
    const {articleId,comment} = req.body
    //Check if article exists with articleId & active otherwise we cant add comment
    const articleDocument = await ArticleModel
                        .findOne({_id:articleId,isArticleActive:true})
                        .populate("comments.user")
    //If article not found
    if(!articleDocument) {
        return res.status(404).json({message:"Article not found"})
    }
    //If article found get user id 
    const userId = req.user?.id
    //Add comment to comments array of article document
    articleDocument.comments.push({user:userId,comment:comment})
    // Save
    await articleDocument.save()
    // Send response
    res.status(200).json({message:"Comment added successfully",payload:articleDocument})
})

//Get article by id
userApp.get('/article/:articleId',verifyToken("USER","AUTHOR"),async(req,res)=>{
    const {articleId} = req.params

    const article = await ArticleModel.findById(articleId)
        .populate("author","firstName lastName email")
        .populate("comments.user","email")

    if(!article){
        return res.status(404).json({message:"Article not found"})
    }

    res.status(200).json({message:"Article found",payload:article})
})