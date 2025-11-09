import { Suspense, lazy, useEffect, useState } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MyContextProvider } from './utils/context';
import { LayoutLoader } from './components/layout/Loaders';
import {server} from './components/constants/config'
import axios from 'axios'

import Chat from './pages/Chat'
import { SocketProvider } from './utils/socketContext';
import { Toaster } from 'react-hot-toast';

import axiosInstance from './lib/axios';


const Home =lazy(()=> import("./pages/Home"))
const Groups =lazy(()=> import("./pages/Groups"))
const NotFound=lazy(()=> import("./pages/NotFound"))

const PrivateOutlet =lazy(()=> import("./components/privateRoute/PrivateOutlet"))
const Authenticate = lazy(()=> import("./pages/authenticate/Authenticate"))
const Login = lazy(()=> import("./pages/authenticate/Login"))
const SignUp = lazy(()=> import("./pages/authenticate/SignUp"))

const AdminLogin =lazy(()=> import("./pages/Admin/AdminLogin"))
const Dashboard = lazy(()=> import('./pages/Admin/Dashboard'))
const UserManagement = lazy(()=> import('./pages/Admin/UserManagement'))
const ChatsManagement = lazy(()=> import('./pages/Admin/ChatsManagement'))
const MessagesManagement = lazy(()=> import('./pages/Admin/MessagesManagement'))

function App() {
  return (
    <MyContextProvider>
          <div className="app">
          <Toaster
            position="top-left"
            reverseOrder={true}
          />
            <BrowserRouter>
          <Suspense fallback={<LayoutLoader />}>
              <Routes>
                <Route path='/' element={
                      <SocketProvider>
                        <PrivateOutlet/>
                      </SocketProvider>
                    }>
                  <Route path='/' element={<Home />}/>
                  <Route path='/chat/:chatId' element={<Chat />}/>
                  <Route path='/groups' element={<Groups />}/>
                </Route>

                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<Dashboard/>} />
                <Route path="/admin/messages" element={<MessagesManagement/>} />
                <Route path="/admin/chats" element={<ChatsManagement/>} />
                <Route path="/admin/users" element={<UserManagement/>} />

                <Route path='/auth/*' element={<Authenticate></Authenticate>}>
                    <Route path='signUp' element={<SignUp></SignUp>} />
                    <Route path='login' element={<Login></Login>} />
                    <Route path='' element={<Login></Login>} />
                </Route>
                <Route path='*' element={<NotFound />} />
              </Routes>
            </Suspense>
            </BrowserRouter>
          </div>
    </MyContextProvider>

  )
}

export default App
