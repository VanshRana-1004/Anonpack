'use client'
import { useEffect, useRef, useState } from "react";
import OpenEyeIcon from "../icons/openEye";
import CloseEyeIcon from "../icons/closeEye";
import { decryptMnemonics } from "../utils/decrypt-mnemonics";
import { useIntroHook } from "../store/intro";
import { useWalletHook } from "../store/wallet";
import { useMnSavedHook } from "../store/mn-saved";
import { usePassHook } from "../store/password";
import { createSolanaAcc } from "../utils/create-solana";
import { createEthereumAcc } from "../utils/create-ethereum";
import LockIcon from "../icons/lock";
import UnlockIcon from "../icons/unlock";
import { ToastContainer, toast } from 'react-toastify';
import CustomSelect from "./customSelect";
import TickIcon from "../icons/tick";
import CopyIcon from "../icons/copy";

export default function Wallets(){

    const {pass,setPass}=usePassHook();
    const {intro,setIntro}=useIntroHook();
    const {wallet,setWallet}=useWalletHook();
    const { saved, setSaved }= useMnSavedHook();
    const passRef=useRef<HTMLInputElement>(null);
    const [passSeed,setPassSeed]=useState<boolean>(false);
    const [showDone,setShowDone]=useState<boolean>(false);
    const [showPass,setShowPass]=useState<boolean>(false);
    const [mnemonics,setMnemonics]=useState<string>('');
    const [selectedCrypto, setSelectedCrypto] = useState<string>("Solana");
    const [solInd,setSolInd]=useState<number>(0);
    const [ethInd,setEthInd]=useState<number>(0);
    const [solAcc,setSolAcc]=useState<{publicKey : string, privateKey : string, show : boolean, copyPublic : boolean, copyPrivate : boolean}[]>();
    const [ethAcc,setEthAcc]=useState<{address : string, privateKey : string, show : boolean, copyPublic : boolean, copyPrivate : boolean}[]>();
    const [width,setWidth]=useState<number>(1536);

    const cryptoOptions = [
        { value: 'Solana', label: 'Solana' },
        { value: 'Ethereum', label: 'Ethereum' },
    ];

    useEffect(()=>{
        const handleScreenResize=()=>{
        const wdth=window.innerWidth;
            setWidth(wdth);
        }
        handleScreenResize();
        window.addEventListener('resize',handleScreenResize);
        return ()=>{window.removeEventListener('resize',handleScreenResize)}
    },[])

    useEffect(()=>{
        if(solAcc && solAcc.length>0){
            localStorage.setItem('solAcc',JSON.stringify(solAcc));
        } 
    },[solAcc])

    useEffect(()=>{
        if(ethAcc && ethAcc.length>0){
            localStorage.setItem('ethAcc',JSON.stringify(ethAcc));
        } 
    },[ethAcc])

    useEffect(()=>{
        const solAccString=localStorage.getItem('solAcc');
        if(solAccString){
            const solAccJSON=solAccString ? JSON.parse(solAccString) : null;
            if(solAccJSON) setSolAcc(solAccJSON);
        }
        const ethAccString=localStorage.getItem('ethAcc');
        if(ethAccString){
            const ethAccJSON=ethAccString ? JSON.parse(ethAccString) : null;
            if(ethAccJSON) setEthAcc(ethAccJSON);
        }        
    },[])

    const handleCryptoChange = (newValue : string) => {
        setSelectedCrypto(newValue);
        console.log('Selected Crypto:', newValue);
    };

    async function verify(){
        if(passRef.current?.value==''){
           toast.warn('Enter Password')
            return;
        }
        const walletDataStr = localStorage.getItem('walletData');
        const walletJson = walletDataStr ? JSON.parse(walletDataStr) : null;
        const mnemonics=await decryptMnemonics(String(passRef.current?.value),walletJson);
        if(mnemonics==null) toast.error('Wrong password');
        else {
            setMnemonics(mnemonics);
            setShowPass(false);
            setShowDone(true);
        }
    }

    async function createAccount() {
        const walletDataStr = localStorage.getItem('walletData');
        const walletJson = walletDataStr ? JSON.parse(walletDataStr) : null;
        const mnemonics=await decryptMnemonics(String(pass),walletJson);
        if(mnemonics==null){
            toast.error('unable to create account');
            return;
        } 
        if(selectedCrypto=='Solana'){
            localStorage.setItem('solInd',JSON.stringify({ind : solInd}));
            const {publicKey,privateKey}=await createSolanaAcc(mnemonics,solInd);
            if(solAcc?.length==0) setSolAcc([{publicKey, privateKey, show : false, copyPublic : false,copyPrivate : false}]);
            else{
                setSolAcc(prev => [
                    ...(prev || []),          
                    { publicKey, privateKey, show : false, copyPublic : false,copyPrivate : false }
                ]);
            } 
            setSolInd(solInd=>solInd+1);
        }
        else{
            localStorage.setItem('ethInd',JSON.stringify({ind : ethInd}));
            const {privateKey,address}=await createEthereumAcc(mnemonics,ethInd);
            if(ethAcc?.length==0) setEthAcc([{address, privateKey, show : false, copyPublic : false,copyPrivate : false}]);
            else{
                setEthAcc(prev => [
                    ...(prev || []),          
                    { address, privateKey, show : false, copyPublic : false,copyPrivate : false}
                ]);
            } 
            setEthInd(ethInd=>ethInd+1);
        }
    }

    function changeEthVisibility(ind : number){
        setEthAcc((prev) =>
            prev && prev.map((acc, i) =>
                i === ind ? { ...acc, show: !acc.show } : acc
            )
        );
    } 

    function changeSolVisibility(ind : number){
        setSolAcc((prev) =>
            prev && prev.map((acc, i) =>
                i === ind ? { ...acc, show: !acc.show } : acc
            )
        );
    } 

    async function copySol(ind : number, publicKey : boolean){
        if (!solAcc || !solAcc[ind]) {
            console.error("solAcc is undefined or index out of bounds");
            return;
        }
        let keyToCopy = publicKey ? solAcc[ind].publicKey : solAcc[ind].privateKey;
        await navigator.clipboard.writeText(keyToCopy)
        .then(() => {
            if(publicKey){
                setSolAcc((prev) =>
                    prev && prev.map((acc, i) =>
                        i === ind ? { ...acc, copyPublic: true } : acc
                    )
                );
            }
            else{
                setSolAcc((prev) =>
                    prev && prev.map((acc, i) =>
                        i === ind ? { ...acc, copyPrivate: true } : acc
                    )
                );
            }
            setTimeout(() =>{
                if(publicKey){
                    setSolAcc((prev) =>
                        prev && prev.map((acc, i) =>
                            i === ind ? { ...acc, copyPublic: false } : acc
                        )
                    );
                }
                else{
                    setSolAcc((prev) =>
                        prev && prev.map((acc, i) =>
                            i === ind ? { ...acc, copyPrivate: false } : acc
                        )
                    );
                }
            }, 1000);
        })
        .catch(err => {
            console.error("Failed to copy: ", err);
        });
    }

    async function copyEth(ind : number, publicKey : boolean){
        if (!ethAcc || !ethAcc[ind]) {
            console.error("ethAcc is undefined or index out of bounds");
            return;
        }
        let keyToCopy=publicKey ? ethAcc[ind].address : ethAcc[ind].privateKey;
        await navigator.clipboard.writeText(keyToCopy)
        .then(() => {
            if(publicKey){
                setEthAcc((prev) =>
                    prev && prev.map((acc, i) =>
                        i === ind ? { ...acc, copyPublic: true } : acc
                    )
                );
            }
            else{
                setEthAcc((prev) =>
                    prev && prev.map((acc, i) =>
                        i === ind ? { ...acc, copyPrivate: true } : acc
                    )
                );
            }
            setTimeout(() =>{
                if(publicKey){
                    setEthAcc((prev) =>
                        prev && prev.map((acc, i) =>
                            i === ind ? { ...acc, copyPublic: false } : acc
                        )
                    );
                }
                else{
                    setEthAcc((prev) =>
                        prev && prev.map((acc, i) =>
                            i === ind ? { ...acc, copyPrivate: false } : acc
                        )
                    );
                }
            }, 1000);
        })
        .catch(err => {
            console.error("Failed to copy: ", err);
        });
    }

    return <div className={`flex flex-col w-full h-full bg-black ${width>768 ? 'gap-10' : 'gap-7'} webkit-scrollbar -translate-y-5`}>
        
        <ToastContainer position="bottom-right" autoClose={3000} theme='dark'/>

        <div className="flex items-center  justify-between">
            <div className="flex gap-2 items-center self-start">
                <img src="logo.png" alt="" className="w-11 h-10"/>
                <p className={`poppins-regular ${width>768 ? 'text-[26px]' : 'text-[20px]'} tracking-[-4%] text-white`}>AnonPack </p>
            </div>

            <div onClick={()=>{
                localStorage.clear()
                setIntro(true);
                setWallet(false);
                setSaved(false);
                setPass('');
            }} className="w-fit py-2 px-5 text-[14px] rounded-md poppins-regular text-white bg-red-600 hover:bg-red-900 cursor-pointer">Clear Wallet</div>
        </div>
        
        <div className="relative flex flex-col rounded-xl items-center justify-between bg-black border border-zinc-700/50 w-full">
            <div className={`relative flex  ${width>768 ? 'p-5 px-7' : 'p-3 px-4'} rounded-xl items-center justify-between  w-full`}>

                <div className="text-[22px] font-light tracking-tight text-white poppins-regular flex gap-3 items-center">
                    Your Secret Phrases
                </div>
                {showDone 
                ? 
                    <div onClick={()=>{
                        setShowDone(false)
                        setMnemonics('');
                    }} className={`flex gap-2 items-center cursor-pointer ${showPass ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                        <UnlockIcon/>
                        <p className={`${width>768 ? 'text-[16px]' : 'text-[14px]'} font-light tracking-tight text-white poppins-regular`}>Done</p>
                    </div>
                :
                    <div onClick={()=>setShowPass(true)} className="flex gap-2 items-center cursor-pointer">
                        <LockIcon/>
                        <p className={`${width>768 ? 'text-[16px]' : 'text-[14px]'} font-light tracking-tight text-white poppins-regular`}>Unlock</p>
                    </div>
                }
                {showPass && 
                    <div className={` rounded-xl bg-black right-5 top-1/2 ${width>900 ? 'absolute w-1/3 p-5' : 'fixed top-32 left-1/2 -translate-x-1/2 w-[90%] p-3'} h-auto flex flex-col gap-5 border border-zinc-700/50 z-50`}>
                        <div className={`border border-zinc-700/40 bg-zinc-900/30 flex rounded-md items-center justify-between gap-2 py-1.5 px-3 w-full`}>
                            <input ref={passRef} type={!passSeed ? 'password' : 'text'} placeholder="Enter Password" className="focus:outline-0 text-[16px] text-zinc-400 w-full"/>
                            <div className={`cursor-pointer rounded-full p-1 hover:bg-zinc-800/50`} onClick={()=>setPassSeed(!passSeed)}>{passSeed ? <OpenEyeIcon/> : <CloseEyeIcon/>}</div>
                        </div>
                        <div className="flex items-center justify-end gap-5">
                            <div onClick={()=>setShowPass(false)} className="py-1.5 px-5 text-[14px] poppins-regular rounded-md bg-white text-black active:scale-95 transition-transform duration-300 ease-in-out cursor-pointer border border-white/30 hover:border-zinc-700/30 hover:bg-zinc-200">Cancel</div>
                            <div onClick={verify} className="py-1.5 px-5 text-[14px] poppins-regular rounded-md bg-white text-black active:scale-95 transition-transform duration-300 ease-in-out cursor-pointer border border-white/30 hover:border-zinc-700/30 hover:bg-zinc-200">Continue</div>
                        </div>
                    </div>
                }
                 
            </div>
            {showDone
                &&
                <div className={`w-full h-auto grid  ${width>768 ? 'p-7 grid-cols-4 gap-3' : 'p-3 grid-cols-3 gap-2'} z-50 border border-zinc-700/40 rounded-xl bg-black`}>
                    {mnemonics.split(" ").map((word : string,ind)=>(
                        <div key={ind} className="bg-zinc-800/50 text-white/90 text-[16px] poppins-regular tracking-normal font-normal py-2 w-full rounded-lg px-5">{word}</div>
                    ))}
                </div>
            }   
        </div>

        <div className={`relative ${width>768 ? 'flex items-center justify-between' : 'flex flex-col gap-5 '} rounded-xl  bg-black w-full`}>
            <div className={`${width>768 ? 'text-[46px]' : 'text-[32px]'} tracking-tight font-medium bg-[linear-gradient(92.22deg,rgba(255,255,255,0.4)_-6.68%,#FAF9F9_31.88%,#D1D1D1_61.39%,rgba(181,181,181,0.4)_89.88%)] bg-clip-text text-transparent`}>{selectedCrypto} Wallet</div>
            <div className="flex gap-5 items-center ">
                <CustomSelect 
                    options={cryptoOptions} 
                    initialValue={selectedCrypto} 
                    onChange={handleCryptoChange}
                />
                <div onClick={createAccount} className="py-1.5 px-5 text-[14px] poppins-medium rounded-md bg-white text-black active:scale-95 transition-transform duration-300 ease-in-out cursor-pointer border border-white/30 hover:border-zinc-700/30 hover:bg-zinc-200">Create Account</div>
            </div>
        </div>

        {selectedCrypto=='Solana'
            ?
            <div className="w-full h-auto flex flex-col gap-10 bg-black pb-5">
                {solAcc?.map((acc,ind)=>(
                    <div key={ind} className="w-full border border-zinc-700/50 bg-black flex flex-col gap-3 rounded-xl">
                        <div className="flex items-center px-5 pt-5 gap-2">
                            <img src="sol.png" alt="" className="size-12" />
                            <p className="poppins-semibold text-[22px] tracking-[-5%] text-white/80 ">Account {ind+1}</p>
                        </div>
                        <div className="flex flex-col gap-7 bg-zinc-800/60 p-10 px-7 rounded-xl">
                            <p className="text-white/80 poppins-semibold text-[32px]">0 SOL</p>
                            <div onClick={()=>{copySol(ind,true)}} className="flex flex-col gap-1 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <p className="poppins-semibold text-[18px] tracking-[-5%] text-white/70">Public Key </p>
                                    {acc.copyPublic ? <TickIcon/> : <CopyIcon/>}
                                </div>
                                <p className="poppins-light text-[17px] text-white/50 tracking-wider truncate max-w-[80%] overflow-hidden whitespace-nowrap">{acc.publicKey}</p>    
                            </div>
                            <div onClick={()=>{copySol(ind,false)}} className="flex flex-col gap-1 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <p className="poppins-semibold text-[18px] tracking-[-5%] text-white/70">Private Key </p>
                                    {acc.copyPrivate ? <TickIcon/> : <CopyIcon/>}
                                </div>
                                <div className="flex w-full justify-between items-center">
                                    <p className="poppins-light text-[17px] text-white/50 tracking-wider truncate max-w-[80%] overflow-hidden whitespace-nowrap">{acc.show ? acc.privateKey : "•".repeat(acc.privateKey.length)}</p>    
                                    <div onClick={()=>changeSolVisibility(ind)} className="cursor-pointer p-1 hover:bg-black rounded-full">{acc.show ? <CloseEyeIcon/> : <OpenEyeIcon/>}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            :
            <div className="w-full h-auto flex flex-col gap-10 bg-black pb-5">
                {ethAcc?.map((acc,ind)=>(
                    <div key={ind} className="w-full border border-zinc-700/50 bg-black flex flex-col gap-3 rounded-xl">
                        <div className="flex items-center px-5 pt-5 gap-2">
                            <img src="eth.png" alt="" className="size-12" />
                            <p className="poppins-semibold text-[22px] tracking-[-5%] text-white/80 ">Account {ind+1}</p>
                        </div>
                        <div className="flex flex-col gap-7 bg-zinc-800/60 p-10 px-7 rounded-xl">
                            <p className="text-white/80 poppins-semibold text-[32px]">0 ETH</p>
                            <div onClick={()=>{copyEth(ind,true)}} className="flex flex-col gap-1 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <p className="poppins-semibold text-[18px] tracking-[-5%] text-white/70">Public Key </p>
                                    {acc.copyPublic ? <TickIcon/> : <CopyIcon/>}
                                </div>
                                <p className="poppins-light text-[17px] text-white/50 tracking-wider truncate max-w-[80%] overflow-hidden whitespace-nowrap">{acc.address}</p>    
                            </div>
                            <div onClick={()=>{copyEth(ind,false)}} className="flex flex-col gap-1 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <p className="poppins-semibold text-[18px] tracking-[-5%] text-white/70">Private Key </p>
                                    {acc.copyPrivate ? <TickIcon/> : <CopyIcon/>}
                                </div>
                                <div className="flex w-full justify-between items-center">
                                    <p className="poppins-light text-[17px] text-white/50 tracking-wider truncate max-w-[80%] overflow-hidden whitespace-nowrap">{acc.show ? acc.privateKey : "•".repeat(acc.privateKey.length)}</p>    
                                    <div onClick={()=>changeEthVisibility(ind)} className="cursor-pointer p-1 hover:bg-black rounded-full">{acc.show ? <CloseEyeIcon/> : <OpenEyeIcon/>}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        }

    </div>
}