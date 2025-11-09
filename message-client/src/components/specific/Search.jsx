import React, { useEffect, useState } from 'react';
import { useMyContext } from '../../utils/context';
import { Dialog, Stack } from '@mui/material';
import { SearchOutlined } from '@mui/icons-material';
import './specific.css'
import UserItem from '../shared/UserItem';
import { useInputValidation } from '6pp';
import axios, { Axios } from 'axios';
import { server } from '../constants/config';
import { notifyError } from '../../lib/Toasting';
const Search = () => {
    const {isSearch , setIsSearch }= useMyContext()
    const search = useInputValidation("");
    const [searchedUsers , setSearchedUsers] = useState([])
    const [isRequestLoading , setIsRequestLoading] = useState(false);
    const addFriendHandler= async(id)=>{
        setIsRequestLoading(true)
        try {
            const {data} = await axios.put(`${server}/api/v1/user/request` , {userId: id} , {withCredentials: true});
          } catch (error) {
            notifyError(error.response.data.message || "Something went wrong")
          } finally{
            setIsRequestLoading(false)
          }
    }

  const searchHandler = async (query)=> {
    try {
      const {data} = await axios.get(`${server}/api/v1/user/search?name=${query}` , {withCredentials: true});
      setSearchedUsers(data.users)
    } catch (error) {
      notifyError(error.response.data.message || "Something went wrong")
    }    
  }

    useEffect(()=>{
        const timeOutId = setTimeout(()=>{
            searchHandler(search.value)
        },1000)
        return ()=>{
            clearTimeout(timeOutId)
        }
    },[search.value])

  const dialogStyle = {
    maxHeight: "90vh",
    maxWidth: '100vw',
    };
    return (
        <Dialog 
         PaperProps={{ sx: dialogStyle }} 
         open={isSearch}
         onClose={()=> setIsSearch(false)}
        >
            <Stack overflow={"hidden"} bgcolor='#eff9e8' textAlign={'center'} justifyContent={'start'} alignItems={'center'} p={'1rem'} direction={'column'}>
                <p className="dialog-header">Find New Friend</p>
                <div className="input-div flex-con">
                    <input 
                        className="input-field"
                        placeholder='search with name'
                        type="text" 
                        value={search.value}
                        onChange={search.changeHandler}
                        />
                        <SearchOutlined/>
                </div>
                <div className="dialog-user-list">
                    { !searchedUsers.length ?  <p style={{textAlign:"center"}}>No user</p>  :
                        searchedUsers.map((i)=>{
                            return <UserItem
                                user={i}
                                key={i._id}
                                handler={addFriendHandler}
                                handlerIsLoading={isRequestLoading}
                             />
                        })
                    }
                </div>
            </Stack>
        </Dialog>
    );
};

export default Search;