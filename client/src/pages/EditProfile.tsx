import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDataContext } from "../context/useDataContext";


const EditProfile:React.FC = () => {
  const { user, setUser } = useDataContext();
  const[sizeerror,setsizeError]=useState<boolean>(false)
  const[typeerror,settypeError]=useState<boolean>(false)
  const[loading,setLoading]=useState<boolean>(false)
  const [imagePreview,setImagePreview]=useState<string>('')
  const [imageFile,setImageFile]=useState<File|null>(null)
  const navigate=useNavigate()

  const handleFileChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
    if(e.target.files && e.target.files[0]){
      const file=e.target.files[0];
      const MAX_FILE_SIZE = 5 * 1024 * 1024;
      if(file.size>MAX_FILE_SIZE){
        setsizeError(true);
        setImagePreview('');
        setImageFile(null)
        return 
      }else{
        setsizeError(false)
      }
      if(!file.type.startsWith('image/')){
          settypeError(true);
          setImagePreview('')
          setImageFile(null)
          return
      }else{
        settypeError(false)
      }
      if(!sizeerror && !typeerror){
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file))
      }
    }
  }
  useEffect(()=>{
    return()=>{
      if(imagePreview){

        URL.revokeObjectURL(imagePreview)
      }
    }
  },[imagePreview])

  const handleSubmit= async():Promise<void>=>{
         try {
          setLoading(true)
          const formData=new FormData();
          if(imageFile){

            formData.append('profilePic',imageFile)
          }
         const response= await axios.post('http://localhost:8000/user/updateProfilePic',formData,
            {withCredentials:true,
            headers:
            {'Content-Type':'Multipart/form-data'}},
           
          )
          setUser(prev=>
            prev ?{...prev,profilePic:response.data.profilePic}:prev
          )
          navigate('/profile')
          
         } catch (error) {
          console.log('error while uploading the profile pic',error)
         }finally{
          setLoading(false)
         }
  }

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-xl font-bold">Edit Profile</h1>
           {
              imagePreview &&
               <img
              src={imagePreview}
              alt="preview"
              className="h-[300px] w-[300px] object-cover rounded mt-2 border"
            />
            }

      <input 
        type="file"
        className="mt-4"
        onChange={handleFileChange}
      />
      {
            sizeerror && <span  className='text-[14px] text-red-800'>You can upload file less than 5 MB !</span>
          }
          {
            typeerror && <span  className='text-[14px] text-red-800'>You can upload  images only !</span>
          }

      <button 
       
        className="bg-blue-600 text-white px-4 py-2 mt-4 rounded-lg disabled:opacity-50"
        onClick={handleSubmit}
        disabled={sizeerror || typeerror || !imageFile}>
       {loading?"Uploading ..." :"Upload Image"}
      </button>
    </div>
  );
};

export default EditProfile;
