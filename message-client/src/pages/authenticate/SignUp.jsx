import React, { useState } from 'react';
import './login.css'
import { useNavigate } from 'react-router-dom';
import { Avatar, IconButton, Stack } from '@mui/material';
import { CameraAlt, Visibility, VisibilityOff } from "@mui/icons-material";
import { useFileHandler } from"6pp"
import { server } from '../../components/constants/config';
import axios from 'axios';
import { notifyError, notifySuccess } from '../../lib/Toasting';
import { toast } from 'react-hot-toast';

const SignUp = () => {
    const navigate = useNavigate()

    const [loading , setLoading] = useState(false)
    
    const [name,setName] = useState('');
    const [username,setUsername] = useState('');
    const [password,setPassword] = useState('');
    const [bio,setBio] = useState('');
    const [isVisible , setIsVisible] = useState(false)

    const avatar = useFileHandler("single");


    const handleSignUp = async(e) =>{
      e.preventDefault()
        if (bio && name && username && password ) {
          setLoading(true)
          const formData = new FormData();
          formData.append('username', username);
          formData.append('password', password);
          formData.append('bio', bio);
          formData.append('name', name);
          formData.append('avatar', avatar.file);
          const toastId = toast.loading("Signing In...");
          const config = {
              withCredentials: true,
              headers: {
                "Content-Type": "multipart/form-data",
              },
            };

            try {
              const { data } = await axios.post(
                `${server}/api/v1/user/register`,
                formData,
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
                
                navigate('/');
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

    return (
        <div className='login-con'>
          <form onSubmit={handleSignUp}>
              <Stack position={"relative"} width={"90px"} margin={"auto"}>
                  <Avatar
                    sx={{
                      width: "90px",
                      height: "90px",
                      objectFit: "contain",
                    }}
                    src={avatar.preview}
                  />

                  <IconButton
                    sx={{
                      position: "absolute",
                      bottom: "0",
                      right: "0",
                      color: "white",
                      bgcolor: "rgba(0,0,0,0.5)",
                      ":hover": {
                        bgcolor: "rgba(0,0,0,0.7)",
                      },
                    }}
                    component="label"
                  >
                    <>
                      <CameraAlt sx={{fontSize:'15px'}} />
                      <input
                       style={{display:'none'}}
                       accept='image/png, image/jpeg'
                        type="file"
                        onChange={avatar.changeHandler}
                      />
                    </>
                  </IconButton>
                </Stack>
            <div className='input-div'>
              <input onChange={(e)=> setName(e.target.value)} type="text" className="input-field" placeholder='name' name='name' required />
            </div>

            <div className='input-div'>
              <input  onChange={(e)=> setBio(e.target.value)}  type="text" className="input-field" placeholder='bio' name='bio' required/>
            </div>

            <div className='input-div'>
              <input  onChange={(e)=> setUsername(e.target.value)}  type="text" className="input-field" placeholder='username' name='username' required/>
            </div>

            <div className='input-div'>
              <input type={isVisible ? "text" : "password"}   onChange={(e)=> setPassword(e.target.value)} className="input-field" placeholder='password' name='password' required />      
                <IconButton onClick={()=> setIsVisible(prev => !prev)} >
                  {isVisible ?  <VisibilityOff /> : <Visibility/>}
                </IconButton>
            </div>
            <input disabled={loading} type="submit" value="Sign up" className="login-button"/>
          </form>


            <p id="sign-up-text" style={{margin: "5px 0" ,fontSize:'.7rem', fontWeight:'400' , textAlign:"center"}}>By signing up, you agree to our Terms, Privacy, Policy and Cookies Policy .</p>
        </div>
    );
};

export default SignUp;