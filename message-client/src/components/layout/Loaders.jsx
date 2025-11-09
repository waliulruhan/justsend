import React from "react";
import logo from'../../assets/image/happinessLogo.png';
import './loaderCss/loaders.css'
import { ScaleLoader } from "react-spinners";




const LayoutLoader= ()=>{
    return <div className="layout-loader">
        <div className="layout-loader-border"/>
        <div className="layout-loader-main">
            <p  style={{fontWeight:"700" , fontSize:"40px"}}> DEMOGORGAN</p>
        </div>
    </div>

}
const TypingLoader=({name})=>{
    return `User is typing...`
}
const CommonLoader=()=>{
    return <div style={{with:"100%" , display:'flex' , justifyContent:"center"}}>
        <ScaleLoader speedMultiplier={2} color="#c2f09d" />
    </div>

}
export {LayoutLoader , TypingLoader , CommonLoader}