import React from 'react'
import { Link,useNavigate } from 'react-router-dom'
import { useDataContext } from '../context/useDataContext'

const Navbar = () => {
  const {user}=useDataContext()
  const navigate=useNavigate()
  return (
     <nav className="bg-slate-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="font-bold text-lg italic underline mr-2 ml-0 px-0">SmashPost</h1>
        <ul className=" sm:flex gap-10 ">
            
          <li       
           className='hover:underline cursor-pointer font-semibold  hover:text-gray-200'>
            <Link to='/'>Home</Link>
            
          </li>
          <li className='hover:underline hover:text-gray-200 cursor-pointer font-semibold'>  
            
          <Link to='/createpost'>Create Post</Link>
          </li>
          <li className='hover:underline cursor-pointer font-semibold  hover:text-gray-200' >
            <Link to='/myposts'>My Posts</Link>
          </li>
          <li className='hover:underline cursor-pointer font-semibold  hover:text-gray-200'>
            <Link to='/profile'>Profile</Link>
          </li>
          
          {
            user ? (
  
                       <>
                   <span className='font-bold underline  cursor-pointer' onClick={()=>navigate('/profile')}> {user.name}</span> 
                   <img src={user?.profilePic} alt='dp'
                   className=' h-10 w-10 object-cover   rounded-[50%] items-center justify-center cursor-pointer ' onClick={()=>navigate('/profile')} />
                   </>
                   
      
            ) :(
                 <li className='underline cursor-pointer font-semibold  hover:text-zinc-900 text-black'>
            <Link to='/login'>Login/Register</Link>
          </li>
            )
          }
            
        </ul>
      </nav>
  )
}

export default Navbar