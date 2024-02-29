import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'
import axios from 'axios'
import { axiosWithAuth } from '../axios'

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'



export default function App() {
  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState()
  const [spinnerOn, setSpinnerOn] = useState(false)

  // ✨ Research `useNavigate` in React Router v.6
  const navigate = useNavigate()

  const logout = () => {
    localStorage.clear()
    setMessage('Goodbye')
    navigate('/')
  }

  const login = async ({ username, password }) => {
    setMessage('');
    const data = {username, password};
    const response = await axios.post(loginUrl, data);
    setMessage(response.data.message)
    localStorage.setItem('token', response.data.token);
    navigate('/articles')
  }

  const getArticles = async () => {
    setMessage('')
    setSpinnerOn(true)
    const response = await axiosWithAuth().get('http://localhost:9000/api/articles');
    setMessage(response.data.message)
    setArticles(response.data.articles)
    setSpinnerOn(false)
  }

  const postArticle = async article => {
   const response = await axiosWithAuth().post('http://localhost:9000/api/articles', article);
   setArticles([...articles, response.data.article]);
   setMessage(response.data.message)
   setCurrentArticleId(undefined)

  }

  const updateArticle = async ({ article_id, article }) => {
    const response = await axiosWithAuth().put(`http://localhost:9000/api/articles/${article_id}`, article)
    const articlesCopy = [...articles]
    const indexOfArticle = articlesCopy.findIndex(art => art.article_id === article_id);
    articlesCopy[indexOfArticle] = response.data.article;
    setArticles(articlesCopy)
    setMessage(response.data.message)
    setCurrentArticleId(undefined)

  }

  const deleteArticle = async article_id => {
    const response = await axiosWithAuth().delete(`http://localhost:9000/api/articles/${article_id}`);
    setMessage(response.data.message);
    setArticles(articles.filter(art => art.article_id !== article_id));

  }

  return (
    // ✨ fix the JSX: `Spinner`, `Message`, `LoginForm`, `ArticleForm` and `Articles` expect props ❗
    <>
      <Spinner on={spinnerOn}/>
      <Message message={message} />
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}> {/* <-- do not change this line */}
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login} />} />
          <Route path="articles" element={
            <>
              <ArticleForm postArticle={postArticle} updateArticle={updateArticle} setCurrentArticleId={setCurrentArticleId} currentArticle={articles.find(art => art.article_id === currentArticleId)} />
              <Articles deleteArticle={deleteArticle} setCurrentArticleId={setCurrentArticleId} currentArticleId={currentArticleId} articles={articles} getArticles={getArticles}/>
            </>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2022</footer>
      </div>
    </>
  )
}
