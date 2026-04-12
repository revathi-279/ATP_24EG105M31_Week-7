import exp from "express";
import { UserModel } from "../models/UserModel.js";
import { ArticleModel } from "../models/ArticleModel.js";
import { verifyToken } from "../middlewares/VerifyToken.js";

export const adminApp = exp.Router();


// GET all users
adminApp.get("/users", verifyToken("ADMIN"), async (req, res) => {
  const usersList = await UserModel.find();
  res.status(200).json({
    message: "Users fetched successfully",
    payload: usersList,
  });
});


// GET all articles
adminApp.get("/articles", verifyToken("ADMIN"), async (req, res) => {
  const articlesList = await ArticleModel.find().populate("author", "firstName email role");

  res.status(200).json({
    message: "Articles fetched successfully",
    payload: articlesList,
  });
});


// Block / Unblock User
adminApp.patch("/user-status", verifyToken("ADMIN"), async (req, res) => {
  const { userId, isUserActive } = req.body;

  const user = await UserModel.findById(userId);
 
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
 // Replace user's active state
  user.isUserActive = isUserActive;
  await user.save();
  //Send response
  res.status(200).json({message: "User status updated successfully",payload: user,
  });
});


// Block / Unblock Article
adminApp.patch("/article-status", verifyToken("ADMIN"), async (req, res) => {
  const { articleId, isArticleActive } = req.body;
 
  const article = await ArticleModel.findById(articleId);

  if (!article) {
    return res.status(404).json({ error: "Article not found" });
  }

  article.isArticleActive = isArticleActive;
  await article.save();

  res.status(200).json({message: "Article status updated successfully",payload: article,
  });
});