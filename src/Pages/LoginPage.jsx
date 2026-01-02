import React, { useState } from "react";
import { FaUserAstronaut } from "react-icons/fa";
import { FaEyeSlash, FaEye } from "react-icons/fa6";
import { PiSignIn } from "react-icons/pi";
import { FcGoogle } from "react-icons/fc";

const LoginPage = () => {
  const [hidePassword, setHidePassword] = useState(true);

  return (
    <div className="flex min-h-screen justify-center items-center bg-gray-100">
      <div className="relative w-[400px] bg-white h-[520px] shadow-orange-500 shadow-lg rounded-lg border-4 border-dashed border-orange-500 flex flex-col items-center pt-16">

        <FaUserAstronaut className="text-7xl text-white bg-orange-400 rounded-full absolute -top-10 p-3" />

        <h1 className="text-3xl font-semibold text-orange-500 mb-6">
          LOGIN
        </h1>

        <form className="w-full px-8 space-y-5">
          <div>
            <label htmlFor="email" className="text-orange-500 font-bold text-xl">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="example@gmail.com"
              className="w-full border-2 rounded-lg px-4 py-2 mt-2"
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="text-orange-500 font-bold text-xl">
              Password
            </label>
            <input
              id="password"
              type={hidePassword ? "password" : "text"}
              className="w-full border-2 rounded-lg px-4 py-2 mt-2"
            />
            <button
              type="button"
              onClick={() => setHidePassword(!hidePassword)}
              className="absolute right-4 top-15 -translate-y-1/2 text-xl cursor-pointer"
            >
              {hidePassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="submit"
            className="flex justify-center items-center gap-3 w-full bg-orange-500 py-3 rounded-lg text-xl text-white hover:bg-orange-400 cursor-pointer"
          >
            Login <PiSignIn />
          </button>
        </form>

        <p className="mt-4">
          Account not created yet?{" "}
          <a href="/signup" className="text-blue-500 font-semibold">
            Sign Up
          </a>
        </p>

        <button
          type="button"
          className="flex items-center justify-center gap-3 border-2 w-[85%] py-2 rounded-lg mt-4 hover:bg-gray-100"
        >
          <FcGoogle className="text-2xl" />
          <span className="font-semibold cursor-pointer">Continue with Google</span>
        </button>

      </div>
    </div>
  );
};

export default LoginPage;
