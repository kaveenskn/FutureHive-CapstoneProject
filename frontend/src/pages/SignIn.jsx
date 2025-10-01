import React, { useState } from "react";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaUser,
} from "react-icons/fa";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUp, setShowSignUp] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="bg-gradient-to-b from-blue-100 to-blue-50 flex items-center justify-center min-h-screen">
      <div className="flex w-[850px] h-[550px] bg-white rounded-2xl shadow-lg overflow-hidden">
        {showSignUp ? (
          <>
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 flex flex-col items-center justify-center w-1/2 p-10 text-white">
              <h2 className="mb-4 text-2xl font-bold">Welcome Back!</h2>
              <p className="mb-6 text-center">
                If you already have an account, please login with your personal info. 
              </p>
              <button
                onClick={() => setShowSignUp(false)}
                className="hover:bg-white hover:text-blue-600 px-8 py-2 transition border-2 border-white rounded-full"
              >
                SIGN IN
              </button>
            </div>

            <div className="flex flex-col items-center justify-center w-1/2 p-10">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                Create Account
              </h2>

              <form onSubmit={handleSubmit} className="w-full">
                <div className="focus-within:ring-2 focus-within:ring-blue-500 flex items-center w-full px-3 py-2 mb-4 border border-gray-300 rounded-md">
                  <FaUser className="mr-2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="flex-1 outline-none"
                    required
                  />
                </div>

                <div className="focus-within:ring-2 focus-within:ring-blue-500 flex items-center w-full px-3 py-2 mb-4 border border-gray-300 rounded-md">
                  <FaEnvelope className="mr-2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="flex-1 outline-none"
                    required
                  />
                </div>

                <div className="focus-within:ring-2 focus-within:ring-blue-500 flex items-center w-full px-3 py-2 mb-2 border border-gray-300 rounded-md">
                  <FaLock className="mr-2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="flex-1 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-gray-500" />
                    ) : (
                      <FaEye className="text-gray-500" />
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  className="hover:bg-blue-700 w-full px-8 py-2 mb-6 text-white transition bg-blue-600 rounded-full shadow-md"
                >
                  SIGN UP
                </button>
              </form>

              <div className="flex items-center w-full my-2">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-2 text-sm text-gray-500">
                  or use your email for registration
                </span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <button className="hover:bg-gray-100 flex items-center justify-center w-full gap-2 px-6 py-2 transition border border-gray-300 rounded-full">
                <FaGoogle className="text-blue-600" />
                Continue with Google
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center w-1/2 p-10">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Sign In</h2>

              <form onSubmit={handleSubmit} className="w-full">
                <div className="focus-within:ring-2 focus-within:ring-blue-500 flex items-center w-full px-3 py-2 mb-4 border border-gray-300 rounded-md">
                  <FaEnvelope className="mr-2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="flex-1 outline-none"
                    required
                  />
                </div>

                <div className="focus-within:ring-2 focus-within:ring-blue-500 flex items-center w-full px-3 py-2 mb-2 border border-gray-300 rounded-md">
                  <FaLock className="mr-2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="flex-1 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-gray-500" />
                    ) : (
                      <FaEye className="text-gray-500" />
                    )}
                  </button>
                </div>

                <a
                  href="#"
                  className="hover:underline self-start mb-10 text-sm text-blue-600"
                >
                  Forgot your password?
                </a>

                <button
                  type="submit"
                  className="hover:bg-blue-700 w-full px-8 py-2 mb-4 text-white transition bg-blue-600 rounded-full shadow-md"
                >
                  SIGN IN
                </button>
              </form>

              <div className="flex items-center w-full my-2">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-2 text-sm text-gray-500">
                  or continue with
                </span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <button className="hover:bg-gray-100 flex items-center justify-center w-full gap-2 px-6 py-2 transition border border-gray-300 rounded-full">
                <FaGoogle className="text-blue-600" />
                Continue with Google
              </button>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-700 flex flex-col items-center justify-center w-1/2 p-10 text-white">
              <h2 className="mb-4 text-2xl font-bold">Hello, Friend!</h2>
              <p className="mb-6 text-center">
                Enter your personal details and start your journey with us
              </p>
              <button
                onClick={() => setShowSignUp(true)}
                className="hover:bg-white hover:text-blue-600 px-8 py-2 transition border-2 border-white rounded-full"
              >
                SIGN UP
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SignIn;
