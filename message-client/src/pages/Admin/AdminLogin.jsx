import React, { useEffect, useState } from 'react';
import { useMyContext } from '../../utils/context';
import { useInputValidation } from '6pp';
import logo from '../../assets/image/happinessLogo.png';
import '../authenticate/login.css';
import { Navigate, useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { server } from '../../components/constants/config';
import { notifyError, notifySuccess } from '../../lib/Toasting';

const AdminLogin = () => {
   document.title = 'Admin Login';
   const navigate = useNavigate();
   const { isAdmin, setIsAdmin } = useMyContext();
   const secretKey = useInputValidation("");
   const [isVisible, setIsVisible] = useState(false);
   const [loading, setLoading] = useState(false);
   
   const getAdmin = async()=>{
        const {data} = await axios.get(`${server}/api/v1/admin`,{withCredentials: true})   
        if(data.admin){
            setIsAdmin(true)
        }else{
            setIsAdmin(false)
        }
   }
   useEffect(()=>{
    getAdmin();
   },[])

   if (isAdmin){
    navigate('/admin/dashboard')
   }
   
   

   const handleAdminLogin = async (e) => {
       e.preventDefault();
       if (secretKey.value) {
           setLoading(true);
           const toastId = toast.loading("Logging In...");

           try {
               const { data } = await axios.post(
                   `${server}/api/v1/admin/verify`,
                   { secretKey: secretKey.value },
                   { withCredentials: true }
               );

               notifySuccess(data.message, { id: toastId });

               setIsAdmin(true);
               navigate('/admin/dashboard');

           } catch (error) {
            notifyError(error?.response?.data?.message || "Something went wrong", { id: toastId });
           } finally {
               setLoading(false);
           }
       } else {
        notifyError("Please provide secret key");
       }
   }

   return (
       <div className="authenticate-con">
           <div className='login-con'>
               <img src={logo} alt="Logo" className="auth-logo" onClick={() => navigate('/')} />
               <p id="sign-up-text">Admin Login</p>

               <form onSubmit={handleAdminLogin} className='auth-form'>
                   <div className='input-div'>
                       <input
                           type={isVisible ? "text" : "password"}
                           value={secretKey.value}
                           onChange={secretKey.changeHandler}
                           className="input-field"
                           placeholder='Secret Key'
                           name='secretKey'
                           required
                       />
                       <IconButton onClick={() => setIsVisible(prev => !prev)}>
                           {isVisible ? <VisibilityOff /> : <Visibility />}
                       </IconButton>
                   </div>
                   <button type="submit" className="login-button" disabled={loading}>
                       {loading ? 'Logging In...' : 'Log In'}
                   </button>
               </form>
           </div>
       </div>
   );
};

export default AdminLogin;
