import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";


import {
  formCard,
  formTitle,
  formGroup,
  labelClass,
  inputClass,
  submitBtn,
  errorClass,
  articlePageWrapper,
} from "../styles/common";

function EditArticle() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [fetchedArticle, setFetchedArticle] = useState(null);

const article = location.state

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // prefill form
  useEffect(() => {

  const loadArticle = async () => {

    // article came from navigate state
    if (article) {
      setValue("title", article.title);
      setValue("category", article.category);
      setValue("content", article.content);
      setFetchedArticle(article);
      return;
    }

    // refresh case
    try {
      let res = await axios.get(
        `https://blog-backend-5afx.onrender.com/user-api/article/${id}`,
        { withCredentials: true }
      );

      const data = res.data.payload;

      setFetchedArticle(data);

      setValue("title", data.title);
      setValue("category", data.category);
      setValue("content", data.content);

    } catch (err) {
      console.log(err);
    }
  };

  loadArticle();

}, [article, id]);

  const updateArticle = async (modifiedArticle) => {
  
    //add articleId to modified article
  modifiedArticle.articleId = fetchedArticle._id;
    //make PUT req to update article
    let res=await axios.put("https://blog-backend-5afx.onrender.com/author-api/articles",
      modifiedArticle,
      {withCredentials:true})
    //naviagte to articleById component
    if(res.status===200){
   navigate(`/article/${fetchedArticle._id}`, {
  state: res.data.payload
})
   }
  };

  return (
    <div className={`${formCard} mt-10`}>
      <h2 className={formTitle}>Edit Article</h2>

      <form onSubmit={handleSubmit(updateArticle)}>
        {/* Title */}
        <div className={formGroup}>
          <label className={labelClass}>Title</label>

          <input className={inputClass} {...register("title", { required: "Title is required" })} />

          {errors.title && <p className={errorClass}>{errors.title.message}</p>}
        </div>

        {/* Category */}
        <div className={formGroup}>
          <label className={labelClass}>Category</label>

          <select className={inputClass} {...register("category", { required: "Category is required" })}>
            <option value="">Select category</option>
            <option value="technology">Technology</option>
            <option value="programming">Programming</option>
            <option value="ai">AI</option>
            <option value="web-development">Web Development</option>
          </select>

          {errors.category && <p className={errorClass}>{errors.category.message}</p>}
        </div>

        {/* Content */}
        <div className={formGroup}>
          <label className={labelClass}>Content</label>

          <textarea rows="14" className={inputClass} {...register("content", { required: "Content required" })} />

          {errors.content && <p className={errorClass}>{errors.content.message}</p>}
        </div>

        <button className={submitBtn}>Update Article</button>
      </form>
    </div>
  );
}

export default EditArticle;