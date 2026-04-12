import { Toaster } from "react-hot-toast";
import { createBrowserRouter, RouterProvider } from "react-router";
import AdminProfile from "./components/AdminProfile"; 
import ArticleByID from "./components/ArticleByID";
import Articles from "./components/Articles"; 
import AuthorArticles from "./components/AuthorArticles";
import AuthorProfile from "./components/AuthorProfile";
import EditArticle from "./components/EditArticle";
import Home from "./components/Home";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./components/Register";
import RootLayout from "./components/RootLayout";
import Unauthorized from "./components/Unauthorized";
import UserProfile from "./components/UserProfile";
import WriteArticles from "./components/WriteArticles";

function App() {
  const routerObj = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        {
          path: "",
          element: <Home />,
        },
        {
          path: "register",
          element: <Register />,
        },
        {
          path: "login",
          element: <Login />,
        },
        {
          path: "user-profile",
          element: (
            <ProtectedRoute allowedRoles={["USER"]}>
              <UserProfile />
            </ProtectedRoute>
          ),
        },
        {
          path: "author-profile",
          element: (
            <ProtectedRoute allowedRoles={["AUTHOR"]}>
              <AuthorProfile />
            </ProtectedRoute>
          ),
          children: [
            {
              index: true,
              element: <AuthorArticles />,
            },
            {
              path: "articles",
              element: <AuthorArticles />,
            },
            {
              path: "write-article",
              element: <WriteArticles />,
            },
          ],
        },
        {
          path: "admin-profile",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminProfile />
            </ProtectedRoute>
          ),
          children: [
            {
              index: true,
              element: <Articles />,
            },
            {
              path: "articles",
              element: <Articles />,
            },
          ],
        },

        {
          path: "article/:id",
          element: <ArticleByID />,
        },
        {
          path: "edit-article",
          element: <EditArticle />,
        },
        {
          path: "unauthorized",
          element: <Unauthorized />,
        },
      ],
    },
  ]);

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <RouterProvider router={routerObj} />
    </div>
  );
}

export default App;