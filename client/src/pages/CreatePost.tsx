import React, { useState ,useEffect} from 'react'
import { usePostContext } from '../context/usePostContext'
import { useNavigate } from 'react-router-dom'
import { useDataContext } from '../context/useDataContext'
const CreatePost:React.FC = () => {
   const[title,setTitle]=useState<string>('')
    const [content,setContent]=useState<string>('')
    const [imageFile,setImageFile]=useState<File|null>(null)
    const [imagePreview,setImagePreview]=useState<string>('')
    const[sizeerror,setsizeError]=useState<boolean>(false)
    const[typeerror,settypeError]=useState<boolean>(false)
    const[loading,setLoading]=useState<boolean>(false)
      
    const navigate=useNavigate()
    const {addPost}=usePostContext()
    const {user}=useDataContext()

    const handleFileChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
      if(e.target.files && e.target.files[0]){
        const file=e.target.files[0]
       const MAX_FILE_SIZE = 5 * 1024 * 1024;
       if(file.size>MAX_FILE_SIZE){
          setsizeError(true)
          setImageFile(null);
         setImagePreview(""); 
          return  
       }else{
        setsizeError(false)
       }

       if(!file.type.startsWith('image/')){
        settypeError(true)
        setImageFile(null);
        setImagePreview("");
        return 
       }else{
        settypeError(false)
       }
        if (!sizeerror && !typeerror) {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }
      }
    }

    useEffect(()=>{
      return ()=>{
        if(imagePreview){
          URL.revokeObjectURL(imagePreview)
        }
      }
    },[imagePreview])

    const handleSubmit= async():Promise<void>=>{
      try {
        setLoading(true)
        const formData=new FormData()
        formData.append('title',title)
        formData.append('content',content)
        if(imageFile){
          formData.append('image',imageFile)
        }
        await addPost(formData)
        navigate('/myposts')
        
      } catch (error) {
        console.log('error while submitting the post',error)
      }
      finally{
        setLoading(false)
      }

    }



  return (
   <div className="max-w-[900px] mx-auto p-4 border rounded-lg shadow">
    {!user && (
      <div>
        <p className="text-center mt-10 text-xl text-zinc-500">Creating post  requires an account. Log in or sign up to continue</p>;
    </div>
    )}
      <h2 className="text-xl font-bold mb-4">Create Post</h2>

      <input
        type="text"
        placeholder="Enter Title"
        value={title}
        onChange={(e)=>setTitle(e.target.value)}
        className="w-full border p-2 rounded mb-2 outline-none overflow-scroll"
      />

      <textarea
        placeholder="Enter description"
        value={content}
        onChange={(e)=>setContent(e.target.value)}
        className="w-full h-[40vh] border p-2 rounded mb-2  outline-none overflow-scroll"
      />

    
      <div className="flex items-center justify-between  mt-2">
        <div>
          <input type="file" placeholder='upload image'   accept="image/*" onChange={handleFileChange}/>
          {
            sizeerror && <span  className='text-[14px] text-red-800'>You can upload file less than 5 MB !</span>
          }
          {
            typeerror && <span  className='text-[14px] text-red-800'>You can upload  images only !</span>
          }
            {
              imagePreview &&
               <img
              src={imagePreview}
              alt="preview"
              className="h-20 w-20 object-cover rounded mt-2 border"
            />
            }
           
          
        </div>

        <button onClick={handleSubmit}
          disabled={!content || !title || typeerror || sizeerror || loading || !user}
          className="bg-slate-600 text-white font-semibold px-4 py-2 rounded hover:bg-slate-500 self-start w-[150px]  mt-16
          disabled:opacity-50"
        >
          {
            loading ? 'Posting...' :'Post'
          }
       
       
        </button>
      </div>
    </div>
  )
}

export default CreatePost