import React, { useState } from "react";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
} from "react-icons/fa";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex w-[850px] h-[550px] bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex flex-col items-center justify-center w-1/2 p-10">
          <h2 className="mb-6 text-2xl font-bold">Sign in</h2>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="focus-within:ring-2 focus-within:ring-blue-400 flex items-center w-full px-3 py-2 mb-4 border rounded-md">
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

            <div className="focus-within:ring-2 focus-within:ring-blue-400 flex items-center w-full px-3 py-2 mb-2 border rounded-md">
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
              className="hover:underline self-start mb-4 text-sm text-blue-500"
            >
              Forgot your password?
            </a>

            <button
              type="submit"
              className="hover:bg-blue-600 w-full px-8 py-2 mb-4 text-white transition bg-blue-500 rounded-full"
            >
              SIGN IN
            </button>
          </form>

          <div className="flex items-center w-full my-2">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-2 text-sm text-gray-500">or continue with</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button className="hover:bg-gray-100 flex items-center justify-center w-full gap-2 px-6 py-2 transition border rounded-full">
            <FaGoogle className="text-red-500" />
            Continue with Google
          </button>
        </div>

        <div className="bg-gradient-to-r from-blue-400 to-blue-600 flex flex-col items-center justify-center w-1/2 p-10 text-white">
          <h2 className="mb-4 text-2xl font-bold">Hello, Friend!</h2>
          <p className="mb-6 text-center">
            Enter your personal details and start your journey with us
          </p>
          <button className="hover:bg-white hover:text-blue-600 px-8 py-2 transition border-2 border-white rounded-full">
            SIGN UP
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
