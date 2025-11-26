import React, { useState } from 'react';
import { User } from '../types';
import { login, register } from '../services/authService';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const user = login(email, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Email ou senha inválidos.');
      }
    } else {
      if (!name || !email || !password) {
        setError('Preencha todos os campos.');
        return;
      }
      const user = register(name, email, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Este email já está cadastrado.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
      <div className="bg-white w-full max-w-4xl h-[600px] flex rounded-2xl shadow-2xl overflow-hidden m-4">
        
        {/* Left Side - Blue with Illustration */}
        <div className="hidden md:flex w-1/2 bg-[#2ba6e1] relative flex-col items-center justify-center p-8 text-white">
          <div className="absolute top-6 left-6 cursor-pointer" onClick={() => alert('Exit')}>
             {/* Fake Close Icon */}
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
             </svg>
          </div>
          
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            {/* Using a placeholder image that matches the "3D business character" vibe */}
            <img 
              src="https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg?w=740&t=st=1708450000~exp=1708450600~hmac=abc" 
              alt="Login Illustration" 
              className="object-contain max-h-[80%] drop-shadow-2xl mix-blend-multiply opacity-0"
              style={{ display: 'none'}} // Hiding external dependency to use pure CSS representation or fallbacks if needed, but let's try a safe approach
            />
            {/* Since I can't guarantee external image stability, I'll build a composition using Lucide icons and styling that mimics the vibe */}
            <div className="flex flex-col items-center">
               <div className="bg-red-500 p-4 rounded-3xl shadow-lg mb-4 w-64 h-16 flex items-center justify-center gap-2 transform -rotate-2">
                  <div className="w-3 h-3 bg-white rounded-full opacity-80"></div>
                  <div className="w-3 h-3 bg-white rounded-full opacity-80"></div>
                  <div className="w-3 h-3 bg-white rounded-full opacity-80"></div>
               </div>
               <div className="relative">
                  <img 
                    src="https://cdn3d.iconscout.com/3d/premium/thumb/man-working-on-laptop-2996952-2492523.png" 
                    alt="User Login"
                    className="w-64 h-auto drop-shadow-2xl"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden text-white flex flex-col items-center justify-center">
                      <svg className="w-48 h-48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 bg-white p-12 flex flex-col justify-center relative">
          
          <div className="absolute top-8 right-8 flex items-center gap-2">
            <span className="text-xl font-bold text-sky-500">∞</span>
            <div className="text-xs text-sky-500 font-bold leading-tight">
              Contabilidade<br/>Confiável
            </div>
          </div>

          <div className="max-w-xs mx-auto w-full">
            <h2 className="text-3xl font-bold text-black mb-8 text-center">{isLogin ? 'LOGIN' : 'CADASTRO'}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {!isLogin && (
                <div>
                   <label className="block text-sm text-gray-700 mb-1">Nome</label>
                   <input 
                      type="text" 
                      placeholder="Seu nome"
                      className="w-full bg-gray-200 border-none rounded-lg py-3 px-4 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-sky-400 focus:bg-white transition-all outline-none"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                   />
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-700 mb-1">Username</label>
                <input 
                   type="email" 
                   placeholder="@mail.com"
                   className="w-full bg-gray-200 border-none rounded-lg py-3 px-4 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-sky-400 focus:bg-white transition-all outline-none"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Password</label>
                <input 
                   type="password" 
                   placeholder="password"
                   className="w-full bg-gray-200 border-none rounded-lg py-3 px-4 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-sky-400 focus:bg-white transition-all outline-none"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                  <button type="button" className="text-xs font-bold text-blue-900 hover:underline">
                      Esqueceu a senha?
                  </button>
              </div>

              {error && <p className="text-xs text-red-500 text-center font-bold">{error}</p>}

              <button 
                type="submit" 
                className="w-full bg-[#2ba6e1] hover:bg-[#2096d1] text-white font-medium py-3 rounded-full shadow-lg transition-transform transform active:scale-95 text-lg uppercase tracking-wider"
              >
                {isLogin ? 'ENTRAR' : 'CADASTRAR'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs font-bold text-gray-800">
                {isLogin ? 'Não Tem Uma Conta?' : 'Já tem uma conta?'}
                <button onClick={() => setIsLogin(!isLogin)} className="text-blue-800 ml-1 hover:underline">
                  {isLogin ? 'Inscrever-se' : 'Entrar'}
                </button>
              </p>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm mb-4">Logar Com</p>
              <div className="flex justify-center gap-4">
                 {/* Facebook */}
                 <button className="w-8 h-8 flex items-center justify-center transition-transform hover:scale-110">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#1877F2] fill-current">
                       <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                 </button>
                 {/* Google */}
                 <button className="w-8 h-8 flex items-center justify-center transition-transform hover:scale-110">
                    <svg viewBox="0 0 48 48" className="w-8 h-8">
                       <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                       <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                       <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                       <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                 </button>
                 {/* Apple */}
                 <button className="w-8 h-8 flex items-center justify-center transition-transform hover:scale-110">
                    <svg viewBox="0 0 384 512" className="w-8 h-8 text-black fill-current">
                       <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z"/>
                    </svg>
                 </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};