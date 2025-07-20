import { useState } from "react";
import { Link } from "react-router-dom";

import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";
import XSvg from "../components/svg/XSvg";
import { FaApple, FaEye, FaGoogle } from "react-icons/fa";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isError = false;

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen">
      <div className="flex-1 hidden lg:flex items-center  justify-center">
        <XSvg className="lg:w-2/3 fill-white" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form className="flex gap-4 flex-col" onSubmit={handleSubmit}>
          <XSvg className="w-24 lg:hidden fill-white" />
          <h1 className="text-3xl font-extrabold text-white">
            {"Let's"} Sign in to X.
          </h1>
          <div className="btn rounded-full bg-white text-black btn-outline w-full">
            <FaGoogle className="" size={20} /> Sign with Google
          </div>
          <div className="btn rounded-full bg-white text-black btn-outline w-full">
            {" "}
            <FaApple size={20} /> Sign with Apple
          </div>
          <div className="divider">OR</div>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdOutlineMail />
            <input
              type="text"
              className="grow bg-transparent text-white placeholder:text-gray-400 focus:outline-none"
              placeholder="username"
              name="username"
              onChange={handleInputChange}
              value={formData.username}
            />
          </label>

          <label className="input input-bordered rounded flex items-center gap-2">
            <MdPassword />
            <input
              type={passwordVisible ? "text" : "password"}
              className="grow bg-transparent text-white placeholder:text-gray-400 focus:outline-none"
              placeholder="Password"
              name="password"
              onChange={handleInputChange}
              value={formData.password}
            />
            <span onClick={() => setPasswordVisible(!passwordVisible)}>
              <FaEye className="text-white" />
            </span>
          </label>
          <button className="btn rounded-full btn-primary text-white">
            Login
          </button>
          <button className="btn rounded-full btn-black text-white">
            forgot password
          </button>

          {isError && <p className="text-red-500">Something went wrong</p>}
        </form>
        <div className="flex flex-col gap-2 mt-4">
          <p className="text-white text-lg">{"Don't"} have an account?</p>
          <Link to="/signup">
            <button className="btn rounded-full btn-primary text-white btn-outline w-full">
              Sign up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
