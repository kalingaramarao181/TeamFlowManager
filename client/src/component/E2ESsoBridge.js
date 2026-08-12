import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import axiosInstance from '../api/axiosInstance';

export default function E2ESsoBridge(){
 const [params]=useSearchParams();const navigate=useNavigate();const [error,setError]=useState('');
 useEffect(()=>{
  const assertion=params.get('assertion');
  if(!assertion){setError('The E2E sign-in link is missing.');return;}
  axiosInstance.post('/sso/e2e',{assertion}).then(({data})=>{
   Cookies.set('teamflowToken',data.token,{expires:1,sameSite:'Lax ',secure:window.location.protocol==='https:'});
   localStorage.setItem('userData',JSON.stringify(data.user));
   navigate('/dashboard',{replace:true});
  }).catch(err=>setError(err?.response?.data?.message||'Unable to open TeamFlow.'));
 },[params,navigate]);
 return <main className='sso-bridge'><h2>Opening your TeamFlow workspace...</h2>{error&&<p role='alert'>{error}</p>}</main>;
}
