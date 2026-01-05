import {useNavigate} from 'react-router-dom'
const PageNotFound=()=>{
    const navigate=useNavigate();
    return (
        <> 
          <div className=" relative flex justify-center items-center h-screen w-screen  ">
            <img src='./public/assets/Error.jpeg' 
            alt="invalid image" 
            className="max-h-screen max-w-screen object-contain"
            />
            <button className="absolute top-180 bg-orange-500 rounded-lg p-4 text-white font-semibold cursor-pointer hover:bg-orange-300" onClick={()=>navigate('/')}>Back To Home</button>
          </div>

        </>

    )
}

export default PageNotFound;