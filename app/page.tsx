'use client'
import { useState,useRef, useEffect } from "react";
import { generateMnemonic } from "bip39";
import OpenEyeIcon from "./icons/openEye";
import CloseEyeIcon from "./icons/closeEye";
import Wallets from "./components/wallets";
import { encryptMnemonics } from "./utils/encrypt-mnemonics";
import { useIntroHook } from "./store/intro";
import { useWalletHook } from "./store/wallet";
import { useMnSavedHook } from "./store/mn-saved";
import { usePassHook } from "./store/password";
import { decryptMnemonics } from "./utils/decrypt-mnemonics";
import { BackgroundLines } from "@/components/ui/background-lines";
import CopyIcon from "./icons/copy";
import TickIcon from "./icons/tick";
import { ToastContainer, toast } from 'react-toastify';

export default function Home() {

  const {pass,setPass}=usePassHook();
  const { intro, setIntro } = useIntroHook();
  const { wallet, setWallet } = useWalletHook();
  const { saved, setSaved }= useMnSavedHook();
  const [showMn,setShowMn]=useState<boolean>(false);
  const mnemonicsRef=useRef<string>("");
  const [mnemonics,setMnemonics] = useState<string>("");
  const [lock,setLock]=useState<boolean>(false);
  const [mainPass,setMainPass]=useState<boolean>(false);
  const [pass1,setPass1]=useState<boolean>(false);
  const [pass2,setPass2]=useState<boolean>(false);
  const passRef = useRef<HTMLInputElement>(null);
  const pass1Ref = useRef<HTMLInputElement>(null);
  const pass2Ref = useRef<HTMLInputElement>(null);
  const [copied,setCopied]=useState<boolean>(false);
  const [width,setWidth]=useState<number>(1536);

  useEffect(()=>{
    const walletDataStr=localStorage.getItem('walletData');
    if(walletDataStr){
      const walletJson = walletDataStr ? JSON.parse(walletDataStr) : null;
      if(walletJson) setLock(true);
      else setIntro(true)
    }
    else setIntro(true);
  },[])

  useEffect(()=>{
    const handleScreenResize=()=>{
    const wdth=window.innerWidth;
      setWidth(wdth);
    }
    handleScreenResize();
    window.addEventListener('resize',handleScreenResize);
    return ()=>{window.removeEventListener('resize',handleScreenResize)}
  },[])
  
  async function verify(){
    if(passRef.current?.value==''){
       toast.warn('Enter Password')
      return;
    }
    const walletDataStr = localStorage.getItem('walletData');
    const walletJson = walletDataStr ? JSON.parse(walletDataStr) : null;
    try{
      const mnemonics=await decryptMnemonics(String(passRef.current?.value),walletJson);
      if(mnemonics==null) toast.error(`Wrong Password`);
      else {
        setLock(false);
        setWallet(true);
        setPass(passRef.current?.value!);
      }
    }catch(e){
      toast.error('Wrong Password')
    }
    
  }

  async function createWallet(){
    const mn=await generateMnemonic();
    mnemonicsRef.current=mn;
    setMnemonics(mnemonicsRef.current);
    setIntro(false);
    setShowMn(true);
  }

  async function encrytPhrase(){
    const password=pass1Ref.current?.value.trim();
    if(password===''){
      toast.warn('Enter password');
      return;
    }
    if(pass1Ref.current?.value!=pass2Ref.current?.value){
      toast.error(`Wrong Password`);
      return;
    }
    const {cipherText,iv,salt}=await encryptMnemonics(String(pass1Ref.current?.value),mnemonicsRef.current)
    mnemonicsRef.current=cipherText;
    setPass(pass1Ref.current?.value ?? '');
    if(pass1Ref.current) pass1Ref.current.value='';
    if(pass2Ref.current) pass2Ref.current.value='';
    localStorage.setItem(
      'walletData',
      JSON.stringify({
        cipherText,
        iv,
        salt
      })
    )
    setMnemonics('');
    setShowMn(false);
    setWallet(true);
  }

  function copy(){
    navigator.clipboard.writeText(mnemonicsRef.current)
    .then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    })
    .catch(err => {
      console.error("Failed to copy: ", err);
    });
  }

  return (
    <div className={`font-sans flex flex-col items-center h-screen ${width>768 ? 'px-32 py-2' : 'px-2 py-0'} gap-7 black bg-black overflow-y-auto`}>
      
      <ToastContainer position="top-center" autoClose={3000} theme='dark'/>

      {!wallet && <div className="flex gap-2 items-center self-start">
        <img src="logo.png" alt="" className="w-11 h-10"/>
        <p className={`poppins-regular ${width>768 ? 'text-[26px]' : 'text-[20px]'} tracking-[-4%] text-white`}>AnonPack </p>
      </div>}

      {showMn 
        && 
          <div className={`flex flex-col gap-7 items-center justify-center ${width>768 ? 'p-7' : 'py-5 px-3'} w-full border border-zinc-700/40 bg-zinc-900/20 rounded-xl`}>
            
            <div className="flex flex-col gap-5 w-full">
              <div className="flex items-center justify-between px-3">
                <p className={`${width>768 ? 'text-[22px]' : 'text-[18px]'} font-light tracking-tight text-white poppins-regular self-start`}>Your Secret Phrases</p>
                <div onClick={copy} className="flex gap-2 items-center cursor-pointer">
                  {width>768 && <p className="text-[16px] font-light tracking-tight text-white/80 poppins-regular">{copied ? 'Copied' : 'Copy Phrases'}</p>}
                  {copied ? <TickIcon/> : <CopyIcon/>}
                </div>
              </div>
              <div className={`w-full h-auto grid  ${width>768 ? 'p-7 grid-cols-4 gap-3' : 'p-3 grid-cols-3 gap-2'} z-50 border border-zinc-700/40 rounded-xl bg-black`}>
                {mnemonics.split(" ").map((word : string,ind)=>(
                  <div key={ind} className="bg-zinc-800/50 text-white/90 text-[16px] poppins-regular tracking-normal font-normal py-2 w-full rounded-lg px-5">{word}</div>
                ))}
              </div>
            </div>

            <div className={`flex items-center w-full ${width>768 ? 'px-10 gap-5' : 'px-2 justify-between'} `}>
              <p className="text-zinc-300 text-[16px] tracking-tight poppins-regular">Have you saved these secret phrases?</p>
              <input
                onClick={()=>setSaved(!saved)}
                type="checkbox"
                className="
                  w-7 h-7 
                  bg-zinc-800 
                  accent-zinc-500 
                  border border-zinc-600 
                  rounded-lg 
                  cursor-pointer 
                  transition-all duration-200 ease-in-out
                  focus:ring-0 
                "
              />
            </div>

            <div className={`flex w-full  ${width<=768 ? 'flex-col px-2 gap-3' : 'px-10 gap-10 items-center'} ${saved ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
              <p className={`text-zinc-300 text-[16px] tracking-tight poppins-regular ${width<=768 && 'self-start'}`}>Setup password :</p>
              <div className="flex flex-col gap-3">
                <div className="border border-zinc-700/50 flex rounded-md items-center justify-between gap-2 py-1.5 px-5 w-full bg-zinc-900/30">
                  <input ref={pass1Ref} placeholder="Enter Password" type={!pass1 ? 'password' : 'text'} className="w-full focus:outline-0 text-[16px] poppins-light tracking-wider text-zinc-400"/>
                  <div className={`cursor-pointer rounded-full p-1 hover:bg-zinc-800/50`} onClick={()=>setPass1(!pass1)}>{pass1 ? <OpenEyeIcon/> : <CloseEyeIcon/>}</div>
                </div>
                <div className="border border-zinc-700/50 flex rounded-md items-center justify-between gap-2 py-1.5 px-5 w-full bg-zinc-900/30">
                  <input ref={pass2Ref} placeholder="Confirm Password" type={!pass2 ? 'password' : 'text'} className="w-full focus:outline-0 text-[16px] poppins-light tracking-wider text-zinc-400"/>   
                  <div className={`cursor-pointer rounded-full p-1 hover:bg-zinc-800/50`} onClick={()=>setPass2(!pass2)}>{pass2 ? <OpenEyeIcon/> : <CloseEyeIcon/>}</div>
                </div>
              </div> 
            </div>
            
            <div onClick={encrytPhrase} className={`self-end py-1.5 px-5 poppins-medium text-center text-[17px] tracking-tight rounded-lg bg-white text-black active:scale-95 transition-transform duration-300 ease-in-out cursor-pointer  hover:bg-white/80 ${saved ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>Continue</div>
              
          </div>
      }

      {intro 
        && 
        <BackgroundLines className="flex items-center justify-center w-full h-full flex-col px-4 bg-black ">
          <div className="flex flex-col w-auto items-center justify-around p-5  rounded-xl absolute top-1/2 -translate-y-1/2">
            <p className={`self-center ${width>768 ? 'text-[48px]' : 'text-[28px]'}  tracking-[-5%] flex flex-col poppins-semibold items-center justify-center bg-[linear-gradient(92.22deg,rgba(255,255,255,0.4)_-6.68%,#FAF9F9_31.88%,#D1D1D1_61.39%,rgba(181,181,181,0.4)_89.88%)] bg-clip-text text-transparent`}>Welcome to AnonPack!</p>
            <p className={`self-center ${width>768 ? 'poppins-thin' : 'poppins-light'} text-[17px] tracking-[-5%] text-wrap text-center text-white/90`}>A browser-based demo wallet built to understand how real crypto wallets manage keys and accounts.</p>
            <div onClick={createWallet} className="py-1.5 px-8 mt-7 poppins-medium text-center text-[17px] tracking-tight rounded-lg bg-white text-black active:scale-95 transition-transform duration-300 ease-in-out cursor-pointer  hover:bg-white/80">Create Wallet</div>
          </div> 
        </BackgroundLines>
      }   

      {lock 
        &&
        <BackgroundLines className="flex items-center justify-center w-full h-full flex-col px-4 bg-black ">
          <div className="flex flex-col w-auto gap-7 items-center justify-around p-5  rounded-xl absolute top-1/2 -translate-y-1/2">
            <p className={`self-center ${width>768 ? 'text-[48px]' : 'text-[28px]'}  tracking-[-5%] flex flex-col poppins-semibold items-center justify-center bg-[linear-gradient(92.22deg,rgba(255,255,255,0.4)_-6.68%,#FAF9F9_31.88%,#D1D1D1_61.39%,rgba(181,181,181,0.4)_89.88%)] bg-clip-text text-transparent`}>Welcome Back!</p>
            <div className="flex flex-col items-center justify-center gap-5 ">
              <div className="border border-zinc-700/50 flex rounded-md items-center justify-between gap-2 py-2 px-5 w-full bg-zinc-900/50">
                  <input ref={passRef} placeholder="Enter Password" type={!mainPass ? 'password' : 'text'} className="w-full focus:outline-0 text-[17px] poppins-light tracking-wider text-zinc-400 "/>
                  <div className={`cursor-pointer rounded-full p-1 hover:bg-zinc-800/50`} onClick={()=>setMainPass(!mainPass)}>{pass ? <OpenEyeIcon/> : <CloseEyeIcon/>}</div>
              </div>
              <div onClick={verify} className="py-1.5 px-16 poppins-medium text-center text-[17px] tracking-tight rounded-lg bg-white text-black active:scale-95 transition-transform duration-300 ease-in-out cursor-pointer  hover:bg-white/80">Unlock</div>
            </div>
            
          </div>
        </BackgroundLines>
      }

      {wallet
        && 
        <Wallets/>
      }
      
    </div>
  );
}