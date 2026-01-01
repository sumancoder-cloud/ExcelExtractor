import React from 'react';
import {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { FaHamburger } from "react-icons/fa";
import {faUpload, faFilePdf,faFileExcel,faCalendarCheck}  from '@fortawesome/free-solid-svg-icons';
const LandingPage=()=>{
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const handleChange=(e)=>{
        const file=e.target.files[0];
        if(!file) return;
        
        if(file.size > MAX_FILE_SIZE){
            alert("Please Upload file Size below 5MB");
            e.target.value="";
            return;
        }
        else{
            alert("File Uploaded Successfuly",file.name); 
        }
    }
const [showMenu,setShowMenu]=useState(false);

const showCard=()=>{
    setShowMenu(!showMenu);
}
    return ( 
        <>
        
        <div className=" flex bg-orange-500 w-full h-[80px] justify-between items-center shadow-lg top-0 left-0 fixed z-50">
            <div  className="flex justify-between text-white text-3xl font-semibold items-center m-5">
                <h1 className="text-white font-new">ExcelExtractor</h1>
                
            </div>
            <div className="flex justify-center items-center">
                <ul className="hidden md:flex gap-5 font-semibold text-white ">
                <li className="cursor-pointer">Features</li>
                    <select className="cursor-pointer">
                        <option className="text-black ">PDF To Excel</option>
                        <option className="text-black ">Image To Excel</option>
                    </select>
                    <li className="cursor-pointer">Contact Us</li>
                </ul>
            </div>
            <div className="flex justify-between gap-10 m-10">
                <button className=" hidden md:flex  bg-white px-5 py-2 rounded-lg hover:bg-gray-300 cursor-pointer">Login</button>
                <button className="hidden md:flex  bg-white px-5 py-2 rounded-lg hover:bg-gray-300 cursor-pointer">SignUp</button>
        <div>
            <button className="md:hidden text-white w-[30px] text-2xl cursor-pointer hover:text-gray-300 "onClick={()=>setShowMenu(!showMenu)}><FaHamburger /></button>
        </div>
            </div>

        </div>

        {/* Mobile Menu Card */}
{showMenu && (
  <div className="fixed top-20 right-4 bg-white w-[200px] h-[350px] rounded-lg shadow-lg z-50 md:hidden p-5">
    <div className="flex flex-col gap-5 ">
        <ul className="flex flex-col gap-5 justify-center items-center">
            <li className="cursor-pointer border-2 w-full px-5 py-2">Features</li>
            <li className="cursor-pointer border-2 w-full px-5 py-2">PDF To Excel</li>
            <li className="cursor-pointer border-2 w-full px-5 py-2">Image To Excel</li>
           <button className="bg-orange-500 w-full px-5 py-2 text-white hover:bg-orange-200 cursor-pointer ">Login</button>
           <button className="bg-orange-500 w-full px-5 py-2 text-white hover:bg-orange-200 cursor-pointer">SignUp</button>
        </ul>
    </div>
  </div>
)}

        

        <div className="flex justify-center mt-[100px]">
            <h1 className="font-bold max-text-4xl md:text-4xl">PDF TO EXCEL CONVERTER</h1>
        </div>
        <div className="flex justify-center px-4 mt-10">
                <div className="flex justify-center items-center bg-orange-500 w-full max-w-[800px] h-[200px] md:h-[300px] border-dashed border-white border-10 outline outline-orange rounded-4xl">
                    <div className=" flex flex-col bg-white w-full max-w-md py-8 sm:px-6 sm:py-2  justify-center">
<div className="flex justify-center mb-2">
<FontAwesomeIcon 
    icon={faFilePdf} 
    className="text-3xl text-red-400 justify-center "
/> to 
<FontAwesomeIcon icon={faFileExcel} 
className="text-3xl text-green-400 justify-center "
/>

</div>
<div className="flex justify-center items-center ">
<label className="
    flex flex-col justify-center items-center
    w-[220px] h-[80px]
    border-2  border-gray-400
    rounded-lg
    cursor-pointer
    hover:bg-gray-100
    transition">
   
    <span className="text-sm font-semibold text-gray-600">
    Drag & drop files
    </span>
    <span className="text-xs text-gray-500 mt-1">
    or click to choose
    </span>

    <input
    type="file"
    className="hidden"
    accept=".pdf"
    onChange={handleChange}
    />
</label>
</div>
</div>
</div>
</div>
<div className="flex m-10 justify-center items-center  gap-30">
    <div>
    <p>
        Easily convert your PDFs into editable Excel files online for free. 
        <p></p>Extract data and make it easy to edit in a spreadsheet
        <p></p>—no signups or downloads necessary.
    </p>
    </div>
    <div className="flex flex-col justify-center items-center ">
        <ul >
            <li className=""><FontAwesomeIcon icon={faCalendarCheck} className="text-orange-500"/>Convert PDFs to Excel instantly</li>
            <li className=""><FontAwesomeIcon icon={faCalendarCheck} className="text-orange-500"/>Easily extract text from scanned PDFs using optical character recognition (OCR)</li>
            <li className=""><FontAwesomeIcon icon={faCalendarCheck} className="text-orange-500"/>No Necessary Downloads or SignUps ,Preview Directly here itself</li>

            
        </ul>
    </div>
</div>
<div className="flex flex-col justify-center m-30 items-center">
    <h1 className="text-4xl flex justify-center font-semibold ">Convert PDF to Excel in Seconds</h1>
    <div className="m-5">
    <p>Need to turn your PDFs into fully editable Excel spreadsheets? Maybe you have a</p>
    <p>scanned receipt you want to add to an Excel document? No need to copy and</p>
    <p>paste. Our tool accurately exacts tables, numbers, and formatting, making it</p>
    <p>easy to edit however you want.</p>
    </div>
</div>

<div className="flex flex-col justify-center items-center m-30 ">
    <div className="flex flex-col justify-center items-center">
        <img src="./assets/img3.webp" className=" h-[300px] text-orange-400"></img>
        <h1 className="text-4xl font-semibold mb-6">Work With Scanned Documents</h1>
        <p>Easily extract text from scanned PDFs using optical character recognition (OCR).</p>
        <p>Snap a photo of receipts, invoices, or other documents, convert them to PDFs,</p>
        <p>and transform them into editable Excel files.</p>
    </div>
</div>
<div className="flex flex-col justify-center items-center m-30">
    <div className="flex flex-col justify-center items-center">
        <img src="./assets/img4.svg" className=" h-[300px] text-orange-400"></img>
        <h1 className="text-4xl font-semibold mb-6">Teamwork Made Easy</h1>
        <p>After converting, easily share your Excel files with teammates. Generate a</p>
        <p>shareable link, email it directly, or save it to cloud storage like Google Drive,Dropbox, or Smallpdf.</p>
        
    </div>
</div>
<div className="flex flex-col justify-center items-center m-30">
    <div className="flex flex-col justify-center items-center">
        <img src="./assets/img1.svg" className=" h-[300px] text-orange-400"></img>
        <h1 className="text-4xl font-semibold mb-6">Quick and Effortless Conversion</h1>
        <p>Skip the downloads and registrations. Simply upload your</p>
        <p>PDF, convert it to Excel in seconds, and continue your work Dropbox, or Smallpdf.</p>
        
    </div>
</div>
<div className="max-w-6xl mx-auto px-4 py-12">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

    
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
      <h3 className="text-xl font-semibold mb-2">
        Fast Conversion
      </h3>
      <p className="text-gray-600 text-sm">
        Convert PDF files to Excel instantly without delays or extra steps.
      </p>
    </div>

 
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
      <h3 className="text-xl font-semibold mb-2">
        No Installation
      </h3>
      <p className="text-gray-600 text-sm">
        No software downloads or sign-ups required. Everything works online.
      </p>
    </div>

  
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
      <h3 className="text-xl font-semibold mb-2">
        Secure Files
      </h3>
      <p className="text-gray-600 text-sm">
        Your documents are processed securely and deleted automatically.
      </p>
    </div>

  </div>
</div>
<div className="flex flex-col justify-center items-center">
    <div className="flex flex-col bg-gray-300 w-max-auto h-max-auto w-100 h-150 px-5 rounded-lg py-10 ">
          <h1 className="text-3xl font-semibold">How To Convert PDF to Excel for Free</h1><br></br>
          <div className="text-lg">
            <ol type="1">
                <li>1.Import or drag & drop your PDF file to our converter.</li><br></br>
                <li>2.Apply OCR to PDFs without editable text .</li><br></br>
                <li>3.Click “Convert” and wait just a few seconds.</li><br></br>
                <li>4.Download or share your converted XLSX file—easy!</li>
            </ol>
          </div>
          <img src="./public/assets/img1.svg"></img>
    </div>

</div>
<footer className="bg-orange-500 w-full mt-40">
  <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center text-white">

   
    <ul className="flex flex-col md:flex-row gap-6 md:gap-10 cursor-pointer mb-6 md:mb-0">
      <li><a href="/">Privacy Notice</a></li>
      <li><a href="/">Terms and Conditions</a></li>
      <li><a href="/">Imprint</a></li>
      <li><a href="/">Contact Us</a></li>
    </ul>

    
    <p className="text-sm text-center">
      &copy; 2026 ExcelExtractor. All rights reserved.
    </p>

  </div>
</footer>

        </>
    )
}

export default LandingPage;
