import React, { useState } from 'react';
import logo from '../../assets/image/happinessLogo.png';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { server } from '../../components/constants/config';
import { IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { notifyError, notifySuccess } from '../../lib/Toasting';
import Cookies from 'js-cookie';
const Login = () => {
    const navigate = useNavigate()
    const [password,setPassword] = useState('');
    const [username,setUsername] = useState('');
    const [loading , setLoading] = useState(false)

    const [isVisible , setIsVisible] = useState(false)

    const handleLogin = async (e) =>{
      e.preventDefault();
        if (username && password ) {
            setLoading(true)
                const toastId = toast.loading("Logging In...");
                const config = {
                  withCredentials: true,
                  headers: {
                    "Content-Type": "application/json",
                  },
                };
                  try {
                    const { data } = await axios.post(
                      `${server}/api/v1/user/login`,
                      {
                        username,
                        password,
                      },
                      config
                    );
                    notifySuccess(data.message, {
                      id: toastId,
                    });
                    if(data){
                      localStorage.setItem("token" , data.token);
                      const expirationDate = new Date();
                      expirationDate.setDate(expirationDate.getDate() + 16);
                      const expires = expirationDate.toUTCString();
                      document.cookie = `happiness-cookie=${data.token}; expires=${expires}; path=/;  secure`;
                      navigate('/')
                    }
                  } catch (error) {
                    notifyError(error?.response?.data?.message || "Something Went Wrong", {
                      id: toastId,
                    });
                  } finally {
                    setLoading(false);
                  }
        }else{
          notifyError("Please add all the fields properly")
        }
    }
    // <img src={logo} alt="" className="auth-logo" />
    // <p id="sign-up-text">Login with your account</p>
    // <input  onChange={(e)=> setUsername(e.target.value)}  type="username" className="input-field" placeholder='username' name='username' required/>
    // <input  onChange={(e)=> setPassword(e.target.value)}  type="password" className="input-field" placeholder='password' name='password' required/>

    // <input onClick={()=> handleLogin()} type="submit" value="Log In" className="login-button"/>
    return (
        <div className='login-con'>
            <img src={logo} alt="" className="auth-logo" />
            <p id="sign-up-text">Login with your account</p>
          <form onSubmit={handleLogin} className='auth-form'>
            <div className='input-div'>
              <input  onChange={(e)=> setUsername(e.target.value)}  type="text" className="input-field" placeholder='username' name='username' required/>
            </div>

            <div className='input-div'>
              <input type={isVisible ? "text" : "password"}   onChange={(e)=> setPassword(e.target.value)} className="input-field" placeholder='password' name='password' required />
        
                <IconButton onClick={()=> setIsVisible(prev => !prev)} >
                  {isVisible ?  <VisibilityOff/> : <Visibility/>}
                </IconButton>

            </div>
            
            <input type="submit" value="Log In" className="login-button"/> 
          </form>
        </div>
    );
};

export default Login;