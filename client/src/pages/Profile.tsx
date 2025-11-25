import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDataContext } from "../context/useDataContext";
import axios from "axios";

interface Profilestatus{
    totalPosts:number,
    totalLikes:number,
    totalComments:number,
    details:{
      id:number,
      title:string,
      likes:{user:{id:number,name:string}}[]
      comments:{text:string,user:{name:string}}[]
    }[]

}

const Profile :React.FC= () => {
  const {user,logout}=useDataContext()
  const [openLikesDetails,setOpenLikesDetails]=useState<boolean>(false)
  const [openCommentsDetails,setOpenCommentsDetails]=useState<boolean>(false)
  const [profileDetails,setProfileDetails]=useState<Profilestatus|null>(null)
  const navigate=useNavigate()
  

  const handleLogout=async():Promise<void>=>{
       await logout();
  }
  const getDetailsProfile=async()=>{
       const response= await axios.get('http://localhost:8000/user/profile',{withCredentials:true})
       setProfileDetails(response.data)
  }
  useEffect(()=>{
    if(user){

      getDetailsProfile()
    }
  },[user])

  return (
    
    <div className="min-h-[85vh] bg-gray-100 flex justify-center py-10 px-4">
      {
  !user && (
    <div className="">
        <p className="text-center mt-10 text-2xl text-zinc-500">Profile access requires an account. Log in or sign up to continue</p>;
        <div className="text-center text-black">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition"
          onClick={()=>navigate('/login')}>Login or SignUp</button>
        </div>
    </div>
  )
}

      {user && (
      

      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6">

       
        <div className="flex flex-col items-center">
        <img src={user?.profilePic} alt="Profile" className="w-32 h-32 rounded-full object-cover shadow-md" />
          

          <h1 className="text-2xl font-semibold text-gray-800 mt-3">{user?.name}</h1>
          <p className="text-gray-500 text-sm">{user?.email}</p>

  
          <div className="flex gap-3 mt-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition"
            onClick={()=>navigate('/editProfile')} >
              Edit Profile
            </button>

            <button className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg shadow-md transition"
            onClick={()=>handleLogout()} >
              Logout
            </button>
          </div>
        </div>

        {openLikesDetails && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white p-5 rounded-xl shadow-lg w-96">
      <h2 className="text-lg font-semibold mb-3">Likes Received</h2>

      {profileDetails?.details.map(post => (
        <div key={post.id} className="mb-3 border-b pb-2">
          <p className="font-semibold text-gray-700">{post.title}</p>

          {post.likes.length ? (
            post.likes.map(like => (
              <p key={like.user.id} className="text-sm ml-3">
                 {like.user.name}
              </p>
            ))
          ) : (
            <p className="text-sm ml-3 text-gray-500">No likes</p>
          )}
        </div>
      ))}

      <button onClick={() => setOpenLikesDetails(false)}
        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg w-full">
        Close
      </button>
    </div>
  </div>
)}
{
  !user && (
    <div>
        <p className="text-center mt-10 text-2xl text-zinc-500">Profile access requires an account. Log in or sign up to continue</p>;
    </div>
  )
}


{openCommentsDetails && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white p-5 rounded-xl shadow-lg w-96">
      <h2 className="text-lg font-semibold mb-3">Comments Received</h2>

      {profileDetails?.details.map(post => (
        <div key={post.id} className="mb-3 border-b pb-2">
          <p className="font-semibold text-gray-700">{post.title}</p>

          {post.comments.length ? (
            post.comments.map((c, index) => (
              <p key={index} className="text-sm ml-3">
                 {c.user.name}: "{c.text}"
              </p>
            ))
          ) : (
            <p className="text-sm ml-3 text-gray-500">No comments</p>
          )}
        </div>
      ))}

      <button onClick={() => setOpenCommentsDetails(false)}
        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg w-full">
        Close
      </button>
    </div>
  </div>
)}



        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <button className="bg-gray-50 py-4 rounded-lg shadow" onClick={()=>navigate('/myPosts')} >
            <p className="text-xl font-bold text-gray-800">{profileDetails?.totalPosts}</p>
            <p className="text-gray-500 text-sm">Posts</p>
          </button>

          <button className="bg-gray-50 py-4 rounded-lg shadow " onClick={()=>setOpenLikesDetails(true)}>
            <p className="text-xl font-bold text-gray-800">{profileDetails?.totalLikes}</p>
            <p className="text-gray-500 text-sm" >Likes</p>
          </button>

          <button className="bg-gray-50 py-4 rounded-lg shadow" onClick={()=>setOpenCommentsDetails(true)} >
            <p className="text-xl font-bold text-gray-800">{profileDetails?.totalComments}</p>
            <p className="text-gray-500 text-sm">Comments</p>
          </button>
        </div>

      </div>

      )}
    </div>
  );

};

export default Profile;
