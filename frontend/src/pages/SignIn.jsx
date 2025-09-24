import React from "react";
import { Mail, Lock, Eye, Globe } from "lucide-react";

const SignIn = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-100 flex items-center justify-center min-h-screen">
      <div className="rounded-2xl w-full max-w-md p-8 bg-white shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Welcome Back
        </h2>
        <p className="mt-1 text-sm text-center text-gray-500">
          Sign in to your account to continue
        </p>

        <div className="mt-6">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="Enter your email"
              className="focus:outline-none focus:ring-2 focus:ring-blue-400 w-full px-4 py-2 pl-10 border rounded-lg shadow-sm"
            />
            <Mail size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>

        <div className="mt-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              placeholder="Enter your password"
              className="focus:outline-none focus:ring-2 focus:ring-blue-400 w-full px-4 py-2 pl-10 border rounded-lg shadow-sm"
            />
            <Lock size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <Eye
              size={18}
              className="absolute right-3 top-2.5 text-gray-400 cursor-pointer"
            />
          </div>
          <div className="mt-1 text-right">
            <a href="#" className="hover:underline text-sm text-blue-500">
              Forgot your password?
            </a>
          </div>
        </div>

        <button className="hover:bg-blue-600 w-full py-2 mt-6 text-white transition bg-blue-500 rounded-lg shadow">
          Sign In
        </button>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-sm text-gray-500">or continue with</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <button className="hover:bg-gray-100 flex items-center justify-center w-full py-2 transition border border-gray-300 rounded-lg">
          <Globe size={18} className="mr-2 text-gray-600" />
          Continue with Google
        </button>

        <p className="mt-6 text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <a href="#" className="hover:underline text-blue-500">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
