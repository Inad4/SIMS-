'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login, getSchoolDisplayString } from '@/utils/utils';
import { School } from '@/types';

export default function SignUpPage() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [allSchools, setAllSchools] = useState<School[]>([]);
    const [schoolMenuSearchTerm, setSchoolMenuSearchTerm] = useState<string>('');
    const [schoolMenuSelectedSchool, setSchoolMenuSelectedSchool] = useState<School | null>(null);
    const [schoolMenuShowDropdown, setSchoolMenuShowDropdown] = useState<boolean>(false);
    const comboboxRef = useRef<HTMLDivElement>(null);

    const router = useRouter();

    const filteredSchools = useMemo(() => {
        if (!schoolMenuSearchTerm) {
            return allSchools; // Show all if no search term
        }
        const lowerCaseSearchTerm = schoolMenuSearchTerm.toLowerCase();
        return allSchools.filter(school =>
            getSchoolDisplayString(school).toLowerCase().includes(lowerCaseSearchTerm)
        );
    }, [schoolMenuSearchTerm, allSchools]);


    useEffect(() => {
        const fetchSchools = async () => {
            const us = await login();
            if (us){
                router.replace("/dashboard");
                return;
            }
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE}/api/School`);
                if (!res.ok){
                    setErrorMessage("Failed to fetch schools data");
                }
                const obj = await res.json();
                setAllSchools(obj);
            } catch (err) {
                console.error("Failed to fetch schools:", err);
                setErrorMessage("Failed to load schools data. Please try again.");
            }
        }
        fetchSchools();
    }, [])

    const handleSignUp = async () => {
        setErrorMessage('');
        setSuccessMessage('');

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setErrorMessage("Password must be at least 6 characters long.");
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_BASE}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            
            if (data.status == 409) {
                setErrorMessage("An account with this email already exists.");
                return;
            }

            if (!response.ok) {
                setErrorMessage(data.message || "Signup failed.");
                return;
            }

            localStorage.setItem("jwt", data.data.jwt);
            localStorage.setItem("refresh_token", data.data.refresh_token);
            setSuccessMessage("Account created successfully!");
            router.replace("/dashboard");
        } catch (error) {
            console.error('Signup error:', error);
            setErrorMessage("An unexpected error occurred. Please try again.");
        }
    };


    // Handle selection of a school from the dropdown
    const handleSelectSchool = (school: School) => {
        setSchoolMenuSelectedSchool(school);
        setSchoolMenuSearchTerm(getSchoolDisplayString(school)); // Set input value to selected school's display string
        setSchoolMenuShowDropdown(false); // Hide dropdown after selection
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSchoolMenuSearchTerm(e.target.value);
        setSchoolMenuSelectedSchool(null); // Clear selected school if input changes
        setSchoolMenuShowDropdown(true); // Show dropdown when typing
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
            setSchoolMenuShowDropdown(false);
        }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    return (
        <section className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center py-8">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto w-full max-w-md">
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Create an account
                        </h1>
                        <form className="space-y-4 md:space-y-6" onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}>
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your username</label>
                                <input
                                    name="email"
                                    id="email"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder="name@company.com"
                                    value={username}
                                    onChange={(e) => { setUsername(e.target.value); }}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    placeholder="••••••••"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); }}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="confirm-password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirm password</label>
                                <input
                                    type="password"
                                    name="confirm-password"
                                    id="confirm-password"
                                    placeholder="••••••••"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); }}
                                    required
                                />
                            </div>
                            <div className="relative" ref={comboboxRef}>
                                <label htmlFor="school-search" className="block text-sm font-medium text-gray-700 mb-2">
                                    Search for a School
                                </label>
                                <input
                                    id="school-search"
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                                    placeholder="Type to search..."
                                    value={schoolMenuSearchTerm}
                                    onChange={handleInputChange}
                                    onFocus={() => setSchoolMenuShowDropdown(true)}
                                    autoComplete="off" // Prevent browser autocomplete
                                />

                                {schoolMenuShowDropdown && filteredSchools.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-2 max-h-60 overflow-y-auto">
                                    {filteredSchools.map(school => (
                                        <li
                                        key={school.id}
                                        className="px-4 py-3 cursor-pointer hover:bg-blue-50 hover:text-blue-700 text-gray-800 transition duration-150 ease-in-out border-b border-gray-100 last:border-b-0"
                                        onClick={() => handleSelectSchool(school)}
                                        >
                                        {getSchoolDisplayString(school)}
                                        </li>
                                    ))}
                                    </ul>
                                )}

                                {schoolMenuShowDropdown && filteredSchools.length === 0 && schoolMenuSearchTerm && (
                                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-2 px-4 py-3 text-gray-500">
                                    No schools found for &quot;{schoolMenuSearchTerm}&quot;
                                    </div>
                                )}
                                </div>

                                {schoolMenuSelectedSchool && (
                                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl shadow-md">
                                    <h2 className="text-xl font-semibold text-blue-800 mb-3">Selected School Details:</h2>
                                    <p className="text-gray-700 mb-1">
                                    <span className="font-medium">Name:</span> {schoolMenuSelectedSchool.name}
                                    </p>
                                    {schoolMenuSelectedSchool.city && (
                                    <p className="text-gray-700 mb-1">
                                        <span className="font-medium">City:</span> {schoolMenuSelectedSchool.city}
                                    </p>
                                    )}
                                    {schoolMenuSelectedSchool.address && (
                                    <p className="text-gray-700 mb-1">
                                        <span className="font-medium">Address:</span> {schoolMenuSelectedSchool.address}
                                    </p>
                                    )}
                                    <p className="text-gray-700 text-sm mt-3">
                                    <span className="font-medium">ID:</span> {schoolMenuSelectedSchool.id}
                                    </p>
                                </div>
                                )}
                            {errorMessage && (
                                <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
                                    {errorMessage}
                                </div>
                            )}
                            {successMessage && (
                                <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800" role="alert">
                                    {successMessage}
                                </div>
                            )}
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="terms"
                                        aria-describedby="terms"
                                        type="checkbox"
                                        className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                                        required
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms" className="font-light text-gray-500 dark:text-gray-300">
                                        I accept the <Link href="/terms" className="font-medium text-blue-600 hover:underline dark:text-blue-500">Terms and Conditions</Link>
                                    </label>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 transition-colors duration-200"
                            >
                                Create an account
                            </button>
                            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                Already have an account? <Link href="/auth/login" className="font-medium text-blue-600 hover:underline dark:text-blue-500">Login here</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}