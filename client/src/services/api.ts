import axios, { AxiosResponse } from "axios";

const url='http://localhost:8000'
axios.defaults.withCredentials=true;

interface RegisterData{
    name:string,
    email:string,
    password:string
}
interface LoginData{
    email:string,
    password:string
}

interface UserResponse {
  msg: string;
  user: {
    name: string;
    email: string;
    id:number
  };
}

 export const userRegistration=async(data:RegisterData):Promise<AxiosResponse<UserResponse> | undefined>=>{
  try {
    const response=axios.post<UserResponse>(`${url}/register`,data)
    return response;
  } catch (error) {
    console.log('error while registering',error)
  }
}
export const userLogin=async(data:LoginData):Promise<AxiosResponse<UserResponse> | undefined>=>{
  try {
    const response=axios.post<UserResponse>(`${url}/login`,data)
    return response;
  } catch (error) {
    console.log('error while registering',error)
  }
}


