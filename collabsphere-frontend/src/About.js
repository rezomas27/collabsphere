// About.js
import React from "react";
import Header from './components/Header';
import "./App.css";

function About() {
 return (
   <div className="min-h-screen bg-gray-900">
     <div className="bg-gray-900 border-b border-gray-800">
       <Header />
     </div>

     <div className="max-w-7xl mx-auto px-4 py-12">
       <div className="bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-700 hover:shadow-2xl transition-all duration-300">
         <header className="mb-16 text-center">
           <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 mb-6">
             About CollabSphere
           </h1>
           <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
             CollabSphere is a platform designed to bring creators, innovators, and
             collaborators together. Whether you have an idea that needs support or
             are looking to join a groundbreaking project, CollabSphere is your
             launchpad for success.
           </p>
         </header>

         <main className="space-y-16">
           <section className="bg-gray-800/50 p-8 rounded-lg border border-gray-700 hover:border-indigo-500/50 transition-colors duration-300">
             <div className="flex items-center mb-6">
               <div className="mr-4 text-indigo-400">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
               </div>
               <h2 className="text-3xl font-semibold text-white">Our Mission</h2>
             </div>
             <p className="text-gray-300 text-lg leading-relaxed">
               To empower individuals by providing a space where ideas meet action.
               We strive to foster innovation and collaboration across a diverse
               range of projects and disciplines.
             </p>
           </section>

           <section className="bg-gray-800/50 p-8 rounded-lg border border-gray-700 hover:border-indigo-500/50 transition-colors duration-300">
             <div className="flex items-center mb-6">
               <div className="mr-4 text-indigo-400">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                 </svg>
               </div>
               <h2 className="text-3xl font-semibold text-white">Why CollabSphere?</h2>
             </div>
             <ul className="space-y-4 text-gray-300 text-lg">
               <li className="flex items-center">
                 <svg className="w-6 h-6 mr-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                 </svg>
                 Connect with passionate individuals worldwide
               </li>
               <li className="flex items-center">
                 <svg className="w-6 h-6 mr-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                 </svg>
                 Gain hands-on experience by contributing to real projects
               </li>
               <li className="flex items-center">
                 <svg className="w-6 h-6 mr-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                 </svg>
                 Turn your ideas into reality with the help of collaborators
               </li>
             </ul>
           </section>
         </main>
       </div>
     </div>

     <footer className="bg-gray-800 text-gray-400 mt-12 border-t border-gray-700">
       <div className="max-w-7xl mx-auto px-4 py-6 text-center">
         <p>&copy; {new Date().getFullYear()} CollabSphere. All rights reserved.</p>
       </div>
     </footer>
   </div>
 );
}

export default About;