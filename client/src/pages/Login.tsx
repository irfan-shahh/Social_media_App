import React, {ChangeEvent,useState} from "react"
// import { userLogin,userRegistration } from "../services/api"
import { useNavigate } from "react-router-dom"
import { useDataContext } from "../context/useDataContext"


interface RegisterInfo{
    name:string,
    email:string,
    password:string,
}
interface LoginInfo{
    email:string,
    password:string,
    
}

 const registerInitialValues={
        name:'',
        email:'',
        password:'',
    }
    const loginInitialValues={
        email:'',
        password:'',
    }

    const Login :React.FC= () => {
        const [account ,setAccount]=useState<'login'| 'register'>('login')
        const[registerInfo,setRegisterInfo]=useState<RegisterInfo>(registerInitialValues)
        const[loginInfo,setLoginInfo]=useState<LoginInfo>(loginInitialValues)
        const[isLoading,setisLoading]=useState<boolean>(false)
        const[isLoadingR,setisLoadingR]=useState<boolean>(false)
        const navigate=useNavigate()
        const {loginUser,registerUser}=useDataContext()

 


      const toggleAccount=()=>{
       setAccount(prev=>prev==='login' ? 'register':'login')
    }

    const onValueChange=(e:ChangeEvent<HTMLInputElement>)=>{
        setRegisterInfo(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }
    const onInputChange=(e:ChangeEvent<HTMLInputElement>)=>{
        setLoginInfo(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }
    const register= async():Promise<void>=>{
      try {
        setisLoadingR(true)
        await registerUser(registerInfo.name,registerInfo.email,registerInfo.password)
      } catch (error) {
        console.log('error while registering',error)
      }finally{
        setisLoadingR(false)
      }
        
    }
    const login= async():Promise<void>=>{
      try {
        setisLoading(true)
        await  loginUser(loginInfo.email,loginInfo.password)     
        
      } catch (error) {
        console.log('error while registering',error)
      }finally{
        setisLoading(false)
      }
    }
    

  return (
    <div className="bg-slate-300 h-screen  ">
        <div className="pt-18 ">
        <h1 className="font-bold underline italic text-center mb-2 pt-4 ">SmashPost</h1>
        <h1 className="font-bold text-center "> Lets Connect, Share and Inspire.</h1>
        <h1 className="font-bold text-center "> Your Social Space Awaits – Sign Up or Log In</h1>
        <div className="text-center mt-2">

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition text-center" onClick={()=>navigate('/')}>Go to the App </button>
        </div>
        </div>
        {
          account==='login' ? (
            <div className="mt-10 flex justify-center">
        <div  className="mt-4 bg-slate-400 w-[500px] h-3/5 rounded-xl overflow-hidden ">
            <div className="flex flex-col  ">
                <h3 className="text-center font-semibold text-xl mt-2 mb-4">Login here</h3>
                <input placeholder="Enter email"  className="px-2 py-4 bg-slate-400 focus:outline-none
                 placeholder-gray-600 "
                onChange={(e)=>onInputChange(e)} name="email"
                value={loginInfo.email} ></input>
                <input placeholder="Enter password" type="password" className="px-2 py-4 bg-slate-400
                focus:outline-none placeholder-gray-600 "
                 onChange={(e)=>onInputChange(e)} name="password"
                 value={loginInfo.password}></input>
                <button className="w-full bg-gray-400 py-3 rounded-md mt-5 font-semibold disabled:opacity-50" 
                onClick={login} disabled={!loginInfo.email ||!loginInfo.password}>{isLoading?"Logging in... ":"Login"}</button>
                <p  className="text-center mt-5 text-slate-600">OR</p>
                <button className="text-center m-4 font-medium"
                onClick={toggleAccount}> New User ? Click to Register</button>
            </div>
            </div>
        </div>
         

          ):(
            <div className="mt-10 flex justify-center">
        <div  className="mt-4 bg-slate-400 w-[500px] h-3/5 rounded-xl overflow-hidden ">
            <div className="flex flex-col  ">
                <h3 className="text-center font-semibold text-xl mt-2 mb-2">Register here</h3>
                <input placeholder="Enter Name"  className="px-2 py-4 bg-slate-400 focus:outline-none
                 placeholder-gray-600"
                 onChange={(e)=>onValueChange(e)} name="name"
                 value={registerInfo.name}></input>
                <input placeholder="Enter email"  className="px-2 py-4 bg-slate-400 focus:outline-none
                 placeholder-gray-600"
                  onChange={(e)=>onValueChange(e)} name='email'
                  value={registerInfo.email}></input>
                <input placeholder="Enter password" type="password" className="px-2 py-4 bg-slate-400
                focus:outline-none placeholder-gray-600 "
                 onChange={(e)=>onValueChange(e)}  name="password"
                 value={registerInfo.password}></input>
                <button className="w-full bg-gray-400 py-3 rounded-md mt-5 font-semibold disabled:opacity-50" 
                onClick={register} disabled={!registerInfo.email || !registerInfo.name|| !registerInfo.password}>{isLoadingR?"Registering.... ":"Register"} </button>
                <p  className="text-center mt-5 text-slate-600">OR</p>
                <button className="text-center m-4 font-medium"
                onClick={toggleAccount}> Already have an account ? Click here to login</button>
            </div>
            </div>
        </div>

          )
        }
        
    </div>
  )
}

export default Login