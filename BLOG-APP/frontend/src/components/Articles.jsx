import { useEffect, useState } from "react";
import axios from "axios";

import {
  articleCardClass,
  articleTitle,
  articleExcerpt,
  articleMeta,
  loadingClass,
  errorClass,
} from "../styles/common";

function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getArticles = async () => {
    try {
      setLoading(true);
      let res = await axios.get(
        "http://localhost:4000/admin-api/articles",
        { withCredentials: true }
      );

      if (res.status === 200) {
        setArticles(res.data.payload);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getArticles();
  }, []);

  const toggleArticleStatus = async (articleObj) => {
    try {
      let res = await axios.patch(
        "http://localhost:4000/admin-api/article-status",
        {
          articleId: articleObj._id,
          isArticleActive: !articleObj.isArticleActive,
        },
        { withCredentials: true }
      );

      if (res.status === 200) {
        getArticles();
      }
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) return <p className={loadingClass}>Loading articles...</p>;
  if (error) return <p className={errorClass}>{error}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {articles.map((article) => (
        <div key={article._id} className={articleCardClass}>
          <p className={articleMeta}>{article.category}</p>

          <p className={articleTitle}>{article.title}</p>

          <p className={articleExcerpt}>
            {article.content.slice(0, 80)}...
          </p>

          <button
            onClick={() => toggleArticleStatus(article)}
            className={`mt-4 px-4 py-2 rounded-full text-sm text-white ${
              article.isArticleActive
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {article.isArticleActive ? "Block" : "Unblock"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default Articles;