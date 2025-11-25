
import './App.css';
import Login from './pages/Login';
import Home from './pages/Home';
import MyPosts from './pages/MyPosts';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import Navbar from './pages/Navbar';
import EditProfile from './pages/EditProfile';
import { Routes,Route,useLocation, useNavigate } from 'react-router-dom';
import { useDataContext } from './context/useDataContext';
import { useEffect } from 'react';

function App() {
  const location=useLocation()
  const {user}=useDataContext()
  const navigate=useNavigate()
  const hideNavbar=location.pathname==='/login'
  useEffect(()=>{
    if(user && location.pathname==='/login'){
      navigate('/')
    }
  },[location.pathname,user])
  return (
    <>
    
     {!hideNavbar && <Navbar/>}  
    <div>
      
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/myposts' element={<MyPosts/>}/>
      <Route path='/createpost' element={<CreatePost/>}/>
      <Route path='/profile' element={<Profile/>}/>
      <Route path='/editProfile' element={<EditProfile/>}/>
    </Routes>
    
    </div>
     </>
  );
}

export default App;
