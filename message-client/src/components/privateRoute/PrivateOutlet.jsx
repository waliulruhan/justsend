import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useCookies } from 'react-cookie';

const PrivateOutlet = () => {
    const happinessCookie = Cookies.get("happiness-cookie");
    const cook = useCookies()
return happinessCookie ? <Outlet /> : <Navigate to="/auth" />;

};

export default PrivateOutlet;