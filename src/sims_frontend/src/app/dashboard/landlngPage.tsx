// components/LandingPage.tsx (assuming this is where it's located)

import React from 'react';
// No need for <link> or <script> tags for Tailwind or Google Fonts here
// These should be handled globally by Next.js and Tailwind setup.

export default function LandingPage() {
    return (
        // Ensure your main layout/global CSS handles the body background and font.
        // For demonstration, I'm keeping the body styles as comments,
        // but they should ideally be in your global CSS file (e.g., globals.css).
        <div className="text-gray-800 dark:text-gray-200 min-h-screen bg-[#f0f4f8] dark:bg-gray-900">
            {/* The following styles should be in your global CSS file (e.g., globals.css)
                and compiled by PostCSS/Tailwind.
                If they are already there, you can remove the <style> block.
            */}
            {/*
            <style jsx global>{`
                body {
                    font-family: 'Inter', sans-serif;
                    background-color: #f0f4f8; // Light blue-gray background
                }
                ::-webkit-scrollbar {
                    width: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: #cbd5e1; // Light gray-blue track
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb {
                    background: #3b82f6; // Blue thumb
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #2563eb; // Darker blue on hover
                }

                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down {
                    animation: fadeInDown 0.8s ease-out forwards;
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s ease-out forwards;
                }
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
            `}</style>
            */}

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-700 to-purple-800 text-white py-20 md:py-32 text-center rounded-b-xl shadow-lg">
                <div className="container mx-auto px-6 md:px-10 lg:px-16">
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-up">
                        Efficiently Manage School Assets with <span className="text-teal-300">SIMS</span>
                    </h1>
                    <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto opacity-90 animate-fade-in-up delay-100">
                        Streamline inventory tracking, asset allocation, and resource management for educational institutions.
                    </p>
                    <div className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row justify-center animate-fade-in-up delay-200">
                        <a href="#demo" className="bg-teal-400 text-blue-900 px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-teal-300 transition duration-300 transform hover:scale-105">
                            Request a Demo
                        </a>
                        <a href="#features" className="border border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-700 transition duration-300 transform hover:scale-105">
                            Learn More
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-16 md:py-24 bg-white dark:bg-gray-800 rounded-xl shadow-md mx-4 md:mx-auto max-w-6xl -mt-16 relative z-10">
                <div className="container mx-auto px-6 md:px-10 lg:px-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">Key Features for Schools</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1: Asset Tracking */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
                            <div className="text-blue-600 dark:text-blue-400 mb-4">
                                {/* Icon for Tracking/Inventory */}
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Comprehensive Asset Tracking</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Keep a real-time record of all school property, from IT equipment to classroom supplies.
                            </p>
                        </div>
                        {/* Feature 2: Loan Management */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
                            <div className="text-green-600 dark:text-green-400 mb-4">
                                {/* Icon for Loan/Borrowing */}
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Loan & Return Management</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Effortlessly manage the lending and return of books, devices, and other school resources.
                            </p>
                        </div>
                        {/* Feature 3: Maintenance Scheduling */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
                            <div className="text-purple-600 dark:text-purple-400 mb-4">
                                {/* Icon for Maintenance/Repair */}
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Assets condition tracking</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Track condition of school facilities and equipment to ensure longevity.
                            </p>
                        </div>
                        {/* Feature 4: Reporting & Analytics */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
                            <div className="text-red-600 dark:text-red-400 mb-4">
                                {/* Icon for Reporting/Charts */}
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Detailed Reporting & Analytics</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Generate insightful reports on inventory levels, usage patterns, and asset depreciation.
                            </p>
                        </div>
                        {/* Feature 5: Multi-User Access & Roles */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
                            <div className="text-yellow-600 dark:text-yellow-400 mb-4">
                                {/* Icon for Users/Roles */}
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H2v-2a3 3 0 015.356-1.857M17 20v-2c0-.134-.009-.267-.026-.4A6.974 6.974 0 0112 15a6.974 6.974 0 01-4.974 2.596C7.009 17.733 7 17.866 7 18v2m0 0H2a2 2 0 01-2-2v-2a2 2 0 012-2h15a2 2 0 012 2v2a2 2 0 01-2 2zM9 9a4 4 0 100-8 4 4 0 000 8zm0 0v-2"></path></svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Multi-User Access & Roles</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Assign different access levels for teachers, administrators, and inventory staff.
                            </p>
                        </div>
                        {/* Feature 6: Barcode & QR Code Support */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
                            <div className="text-teal-600 dark:text-teal-400 mb-4">
                                {/* Icon for Barcode/Scan */}
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10m0 0h16m0 0V7m0 10H4m4 0V7m4 0v10m4-10v10"></path></svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">QR Code Support</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Quickly add and track items using integrated QR code scanning capabilities.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="bg-indigo-700 text-white py-16 md:py-20 text-center mt-12 rounded-xl shadow-lg mx-4 md:mx-auto max-w-6xl">
                <div className="container mx-auto px-6 md:px-10 lg:px-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Optimize Your School's Resources</h2>
                    <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto opacity-90">
                        Take control of your school's inventory with SIMS and focus more on education.
                    </p>
                    <a href="#contact-us" className="bg-teal-400 text-indigo-900 px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-teal-300 transition duration-300 transform hover:scale-105">
                        Contact Us for a Quote
                    </a>
                </div>
            </section>

            {/* Footer Section */}
            <footer className="bg-gray-900 text-white py-10 mt-16 rounded-t-lg">
                <div className="container mx-auto px-6 md:px-10 lg:px-16 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                    <div className="mb-6 md:mb-0">
                        <h3 className="text-xl font-bold mb-2">SIMS Project</h3>
                        <p className="text-gray-400">&copy; 2025 All rights reserved.</p>
                    </div>
                    <div className="flex space-x-6">
                        <a href="#" className="text-gray-400 hover:text-white transition duration-300">Privacy Policy</a>
                        <a href="#" className="text-gray-400 hover:text-white transition duration-300">Terms of Service</a>
                        <a href="#" className="text-gray-400 hover:text-white transition duration-300">FAQ</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}