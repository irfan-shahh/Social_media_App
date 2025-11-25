import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import { ThumbsUp, MessageCircle ,Trash} from "lucide-react";
import { usePostContext } from "../context/usePostContext";
import { useDataContext } from "../context/useDataContext";
import { useNavigate } from "react-router-dom";

axios.defaults.withCredentials=true;

const MyPosts: React.FC = () => {
  
  const {fetchMyPosts,myPosts,deletePost,setMyPosts,likePost,commentPost,deleteComment,
    setShowLikesModel,likedUsers,showLikesModel,getLikesUsers
  }=usePostContext()

  const {user}=useDataContext()
  const [openComment,setOpenComment]=useState<number|null>(null)
  const [commentText,setCommentText]=useState<string>('')
  const navigate=useNavigate()
  useEffect( ()=>{
    const fetch=async()=>{
        await fetchMyPosts();
    }
    fetch()
  },[])


  const formatDateTime=(dateString:string)=>{
    const date=new Date(dateString);
    return date.toLocaleString('en-US',{
      year:'numeric',
      month:'short',
      day:'numeric',
      hour:'2-digit',
      minute:'2-digit'
    })
  }
  const timeAgo=(dateString:string)=>{
   const date=new Date(dateString);
   const now=new Date();
   const seconds=Math.floor((now.getTime()-date.getTime())/1000)
   if (seconds < 60)
    return `${seconds} sec${seconds === 1 ? "" : "s"} ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return `${hours} hr${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30)
    return `${days} day${days === 1 ? "" : "s"} ago`;

  const months = Math.floor(days / 30);
  if (months < 12)
    return `${months} month${months === 1 ? "" : "s"} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
  }
  
  if (!user) {
    return (
      <div className="p-4">
    <p className="text-center mt-10 text-2xl text-zinc-500">Login to Post something</p>
    <div className="text-center text-black">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg  mt-2 shadow-md transition"
          onClick={()=>navigate('/login')}>Login or SignUp</button>
        </div>
        </div>
    )
  }
  
  if (!myPosts?.length) {
    return <p className="text-center mt-10 text-2xl text-zinc-500">You have not posted anything yet !</p>;
  }
  
  const handleDelete=async(id:number)=>{
         await deletePost(id)
         setMyPosts((prev)=>prev.filter((p)=>p.id!==id))
  }


  const handleLike=async (postId:number)=>{
        await likePost(postId)
  }
  
   const handleComment= async (postId:number)=>{
       await commentPost(postId,commentText)
       setCommentText("");
   }
   const handleDeleteComment=async(commentId:number,postId:number)=>{
             await deleteComment(commentId,postId)
   }
   const handleShowLikes= async (postId:number)=>{
         setShowLikesModel(true);
         await getLikesUsers(postId)
  }
  return (
    
    <div className="min-h-[90vh] bg-gray-100 p-4 ">

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          

    
      {myPosts.map((post)=>(
         
        

      <div className="w-full max-w-md bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
     
        <img
          src={post.imageUrl}
          alt="Postimage"
          className="w-full h-[250px] object-cover"
        />

        <div className="p-5">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {post.title}
          </h2>
          <p className="text-gray-600 mb-4">
              {post.content}
          </p>

        
          <div className="flex items-center justify-between">
            <button className={`flex items-center gap-2 transition
                        ${post.likedByUser? "text-blue-600":"text-gray-700  hover:text-blue-600"}
                        `}
            
                        onClick={()=>handleLike(post.id)}>
                          <ThumbsUp size={20} /> <span>Like</span> 
                          <button>{post.likes}</button>
                        </button>
                  <button onClick={()=>handleShowLikes(post.id)} className="text-blue-500">see who liked</button>

            <button className="flex items-center gap-2 hover:text-blue-600 transition"
            onClick={()=>setOpenComment(openComment===post.id ? null:post.id)}>
              
              <MessageCircle size={20} /> <span>Comment</span><span>{post.comments.length}</span>
            </button>
          </div>
          {openComment === post.id && (
                <div className="mt-4 bg-gray-100 p-3 rounded-lg">
                  <textarea
                    className="w-full p-2 rounded-lg border"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />

                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-2 disabled:opacity-50"   
                    onClick={()=>handleComment(post.id)} disabled={!commentText}>
                    Post Comment
                  </button>
                   <div className="mt-3">
                   {post.comments?.length ? (
                      post.comments.map((c) => (
                        <div className="flex">
                        <p key={c.id} className="text-sm bg-white p-2 rounded-md my-1">
                          {c.text} 
                        <span className="text-[10px] text-gray-500 mt-4 ml-2 mr-2">@{c.user?.name}
                        </span>
                        
                        </p>
                        <span className="text-[9px] text-gray-400 mt-4 ml-2"> {timeAgo(c?.createdAt)}</span>
                        {
                          (c.userId === user?.id || post.authorId === user?.id) && (
                          <button
                            className="text-red-500 ml-auto"
                            onClick={() => handleDeleteComment(c.id, post.id)}
                          >
                            <Trash size={10}/>
                          </button>
                        )
                        }
                        </div>
                    ))
                    ) : (
                      <p className="text-gray-500 text-sm">No comments yet</p>
                    )}
                  </div>
                  </div>

                  )}
                  {showLikesModel && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white p-5 rounded-xl shadow-lg w-80">
      <h2 className="text-lg font-semibold mb-3">Liked by</h2>

      {likedUsers?.length ? (
        likedUsers.map(like => (
          <p key={like.id} className="p-2 border-b">
            {like.user.name}
          </p>
        ))
      ) : (
        <p>No likes yet</p>
      )}

      <button
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg w-full"
       onClick={()=>setShowLikesModel(false)}
      >
        Close
      </button>
    </div>
  </div>
)}
                  
                  
          <div className="flex items-center justify-between gap-2 mt-4 cursor-pointer">
          <div>
          <p className="text-sm text-gray-500 mt-2">{post.author.name}</p>
          <p className="text-sm text-gray-500 mt-2">{formatDateTime(post.createdAt)}</p>
            </div>
            {
              user?.id===post?.authorId && (
            <button onClick={()=>handleDelete(post.id)}>
              <Trash size={20}  color="red"/> <span className="text-red-500">Delete</span>
            </button>
              )
            }
            </div>

        </div>
      </div>
 
  
      
      ))}
      
      </div>
      </div>

  )}

export default MyPosts;
