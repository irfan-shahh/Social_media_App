import React, { createContext, ReactNode, useEffect, useState } from "react";
import axios from "axios";
import { useDataContext } from "./useDataContext";
axios.defaults.withCredentials=true;

const url = "http://localhost:8000";
interface comment{
    id:number,
    text:string,
    userId:number,
    createdAt:string,
    user:{
      id:number,
      name:string
    }
    
}
 interface Author {
  id: number;
  name: string;
  email: string;
}

interface Post{
   id:number,
   title:string,
   content:string,
   imageUrl:string,
   authorId:number,
   createdAt:string,
   author:Author,
   likes:number,
   comments:comment[],
   likedByUser:boolean
}
interface LikedUser{
  id:number,
  user:{
    id:number,
    email:string,
    name:string
  }
}

interface PostContextType{
    allPosts:Post[]
    myPosts:Post[]
    showLikesModel:boolean,
    likedUsers:LikedUser[],
    setShowLikesModel:React.Dispatch<React.SetStateAction<boolean>>
    setLikedUsers:React.Dispatch<React.SetStateAction<LikedUser[]>>
    setAllPosts:React.Dispatch<React.SetStateAction<Post[]>>
    setMyPosts:React.Dispatch<React.SetStateAction<Post[]>>
    
    fetchAllPosts:()=>Promise<void>
    fetchMyPosts:()=>Promise<void>
    addPost:(data:FormData)=>Promise<void>
    likePost:(postId:number)=>Promise<void>
    commentPost:(postId:number,text:string)=>Promise<void>
    deletePost:(postId:number)=>Promise<void>
    deleteComment:(commentId:number,postId:number)=>Promise<void>
    getLikesUsers:(postId:number)=>Promise<void>
}


export const PostContext=createContext<PostContextType |null>(null)


interface PostProviderProps{
    children:ReactNode
}
const PostProvider =({children}:PostProviderProps)=>{
    const[allPosts,setAllPosts]=useState<Post[]>([])
    const[myPosts,setMyPosts]=useState<Post[]>([])
    const [showLikesModel,setShowLikesModel]=useState<boolean>(false)
    const [likedUsers,setLikedUsers]=useState<LikedUser[]>([])

    const {user}=useDataContext()

  const fetchAllPosts=async ()=>{

    try {
       const response= await axios.get(`${url}/posts`)
       setAllPosts(response.data.allposts)
    } catch (error) {
           console.error("Error fetching all posts:", error);
    }
  }
  const fetchMyPosts=async ()=>{
     try {
       const response= await axios.get(`${url}/posts/mine`)
       setMyPosts(response.data.myposts)
    } catch (error:any) {
           console.error("Error fetching my posts:", error);
    }

  }

  const addPost=async(data:FormData)=>{
    try {
    const response= await axios.post(`${url}/posts`,data,{
      headers:{'Content-Type':'multipart/form-data'}
    })
    setMyPosts(prev=>[...prev,response.data.post])
    setAllPosts(prev=>[...prev,response.data.post])
    } catch (error:any) {
       console.error('error while adding a post',error) 
    }
  }
  const deletePost=async(postId:number)=>{
             try {
               await axios.delete(`${url}/posts/${postId}`)
               fetchAllPosts()
             } catch (error:any) {
              console.log('error while deleting the post',error)
             }
  }
  const likePost=async(postId:number)=>{
          try {
          const response=  await axios.post(`${url}/posts/likes/${postId}`)
          setAllPosts(prev=>prev.map(p=>
            p.id===postId ? {
              ...p,
              likes:response.data.likes,
              likedByUser:response.data.likedByUser
            }:p
          ))
          setMyPosts(prev =>
             prev.map(p =>
              p.id === postId
          ? {
              ...p,
              likes: response.data.likes,
              likedByUser: response.data.likedByUser,
            }
          : p
      )
    );
          } catch (error) {
            console.log('error while liking the post',error)
          }
  }

  const commentPost=async(postId:number,text:string)=>{
       try {
         const response= await axios.post(`${url}/posts/comments/${postId}`,{text})
         const newComment=response.data.comment;
         setMyPosts(prev=>prev.map(p=>
             p.id===postId ?{...p,comments:[...p.comments,newComment]}:p
         ))

         setAllPosts(prev=>prev.map(p=>
             p.id===postId ?{...p,comments:[...p.comments,newComment]}:p
         ))
        
       } catch (error) {
        console.log('error while commenting on the post',error)
       }
  }
  const deleteComment=async(commentId:number,postId:number)=>{
        try {
          await axios.delete(`${url}/posts/comments/${commentId}`)
          setAllPosts(prev=>prev.map(p=>
            p.id===postId ?
            {...p,comments:p.comments.filter(c=>c.id!==commentId)}:p
          ))
          setMyPosts(prev=>prev.map(p=>
            p.id===postId ?
            {...p,comments:p.comments.filter(c=>c.id!==commentId)}:p
          ))
          
        } catch (error) {
          console.log('error while deleting the comment',error)
        }
  }
  const getLikesUsers=async (postId:number)=>{
        const response=await axios.get(`${url}/posts/showLikes/${postId}`)
        setShowLikesModel(true);
        setLikedUsers(response.data.likes)
  }

  useEffect(()=>{
    if(user){
    fetchAllPosts();
    fetchMyPosts()
    }else{
      setMyPosts([])
    }
  },[user])



    return (
        <PostContext.Provider value={{allPosts,myPosts, setAllPosts,setMyPosts,fetchMyPosts,fetchAllPosts,deletePost, addPost,likePost,commentPost,deleteComment,getLikesUsers,showLikesModel,setShowLikesModel,likedUsers,setLikedUsers
          
        }}>
            {children}
        </PostContext.Provider>
    )
}

export default PostProvider;