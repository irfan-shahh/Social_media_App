import React, { useState, useEffect, createContext, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

axios.defaults.withCredentials = true
const url='http://localhost:8000'

interface User {
    name: string,
    email: string,
    id:number,
    profilePic:string
}

interface DataContextType {
    name: string|null,
    user: User| null,
    setName: React.Dispatch<React.SetStateAction<string |null>>,
    setUser: React.Dispatch<React.SetStateAction<User | null>>,
    checkAuth: () => Promise<void>,
    registerUser:(name:string,email:string,password:string)=>Promise<void|null>
    loginUser:(email:string,password:string)=>Promise<void|null>
    logout: () => Promise<void>,
}



interface DataProviderProps {
    children: ReactNode
}

export const DataContext = createContext<DataContextType| null>(null);


const DataProvider = ({ children }:DataProviderProps) => {

const [name, setName] = useState<string| null>(null)
const [user, setUser] = useState<User | null>(null)
const [refresh, setRefresh] = useState<boolean>(false)
const navigate = useNavigate()

  const registerUser=async(name:string,email:string,password:string):Promise<void|null>=>{
     try {
        const response = await axios.post(`${url}/register`,{name,email,password});
        if (response.status === 200) {
            console.log("Registered Successfully");
        }
    } catch (error) {
        console.error('Error while registering user:', error);
    }
  }
  const loginUser=async(email:string,password:string):Promise<void|null>=>{
     try {
        const response = await axios.post(`${url}/login`,{email,password});
        if (response.status === 200) {
            setUser(response.data.user)
            setRefresh(prev=>!prev);
            navigate('/')
        }
    } catch (error) {
        console.error('Error while logging in :', error);
    }
  }
const checkAuth = async (): Promise<void> => {
    try {
        const response = await axios.get(`${url}/verify`);
        if (response.status === 200) {
            setName(response.data.user.name);
            setUser(response.data.user);
        }
    } catch (error) {
        console.error('Error while verifying user:', error);
    }
};

const logout = async (): Promise<void> => {
    try {
        await axios.post(`${url}/logout`);
        setName('');
        setUser(null);
        navigate('/login', { replace: true });
        setRefresh(prev=>!prev);
    } catch (error) {
        console.error('Error while logging out:', error);
    }
};

useEffect(() => {
    checkAuth();
}, [refresh]);

    return (
        <DataContext.Provider value= {{ name, setName, setUser, user, checkAuth, logout,loginUser,registerUser }}
>
    { children }
    </DataContext.Provider>
    )
}
export default DataProvider