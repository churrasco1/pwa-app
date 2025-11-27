import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import styles from "./App.module.scss";
import HomePage from "./components/HomePage/index.jsx";
import AdminPage from "./components/AdminPage/index.jsx";
import Header from "./components/Header/index.jsx";
import ProtectedRoute from "./components/ProtectRoute/index.jsx";
import UserPage from "./components/UserPage/index.jsx";

function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <HomePage />
    },
    {
      path: "/admin",
      element: <ProtectedRoute><AdminPage /></ProtectedRoute>
    },
    {
      path: "/user",
      element: <ProtectedRoute><UserPage /></ProtectedRoute>
    },
  ]);

  return (
    <div className={styles.App}>
      <Header />
      <main>
        <RouterProvider router={router} />
      </main>
    </div>
  );
}

export default App;
