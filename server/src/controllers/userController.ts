const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const prisma = require('../prisma')
require('dotenv').config()

import type { Request, Response } from 'express';

interface registerRequest extends Request {
    body: {
        name: string,
        email: string,
        password: string
    }
}

interface loginRequest extends Request {
    body: {
        email: string,
        password: string
    }
}
interface authenticateRequest extends Request{
    cookies:{
        token?:string,
    }
}
interface jwtPayload {
  userId: string;
  email: string;
}

const registerUser = async (req: registerRequest, res: Response): Promise<Response> => {
    try {
        const { name, email, password } = req.body;
        const exist = await prisma.user.findUnique({ where: { email } })
        if (exist) {
            return res.status(401).json({ msg: 'the user already exists' })
        }
        const hashedPassword: string =  await bcrypt.hash(password, 10)
        const newData = { ...req.body, password: hashedPassword }
        const newUser = await prisma.user.create({ data: newData })
        return res.status(200).json({ msg: 'new user created', newUser });
    } catch (error) {
        console.log('error while creating a new user', error);
        return res.status(500).json({ msg: 'Internal server error' });
    }

}

const loginUser = async (req: loginRequest, res: Response): Promise<Response> => {
    try {
        const exist = await prisma.user.findUnique({ where: { email: req.body.email } })
        if (!exist) {
            return res.status(500).json({ msg: 'user does not exist' });
        }
        const isPasswordValid: boolean = await bcrypt.compare(req.body.password, exist.password)
        if (!isPasswordValid) {
            return res.status(401).json({ msg: 'invalid login' });
        }
        const token = jwt.sign({ userId: exist.id, email: exist.email }, process.env.JWT_SECRET_KEY as string, { expiresIn: '30d' })
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.status(200).json({
            msg: 'Login successful',
            user: {
                name: exist.name,
                email: exist.email,
                id:exist.id
            }
        })

    } catch (error) {
        console.log('error while logging in', error);
        return res.status(500).json({ msg: 'Internal server error' });
    }
}

const logoutUser=(req:Request,res:Response):Response=>{
  res.clearCookie('token',{
    httpOnly:true
  })
  return res.status(200).json({msg:'Logout successfully'})
}

const verifyUser= async (req:authenticateRequest,res:Response):Promise<Response>=>{
    try {
        const token=req.cookies.token;
        if (!token) {
      return res.status(401).json({ msg: 'no token provided' });
    }
    const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY as string) as  jwtPayload
    const userData = await prisma.user.findUnique({
     where: { id: decoded.userId }
    })
       
    return res.status(200).json({
      user: {
        name: userData.name,
        email: userData.email, 
        id: userData.id,
        profilePic:userData.profilePic
      }
      })

    } catch (error) {
        console.log('error while verifying user', error);
        return res.status(401).json({ msg: 'Invalid token' });
    }
}

module.exports = { loginUser, registerUser ,logoutUser,verifyUser}
