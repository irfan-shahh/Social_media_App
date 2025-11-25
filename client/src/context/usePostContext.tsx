import { useContext } from "react";
import {PostContext} from "./PostProvider";

export const usePostContext=()=>{
    const context=useContext(PostContext)
    if(!context){
        throw new Error('error in the post context')
    }
    return context
}
