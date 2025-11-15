import React from 'react'
import { createUser } from '../api/auth';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function CreateUser() {

    const nav = useNavigate()

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const form = new FormData(e.target)
        const data = {
            username: String(form.get('username')),
            email: String(form.get('email')),
            password: String(form.get('password'))
        }

        console.log(data);

        await createUser(data)
            .then(() => {
                toast.success('Register successfull !');
                nav('/users')
            })
            .catch(err => {
                console.error(err);
                toast.error("❌ Error" + (err.response?.data?.message || err.message));
            })


    }

    return (
        <div>
            {/* <Toaster/> */}
            <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 p-4 sm:p-6 lg:p-6 transition-all duration-300">
                <div className="w-full max-w-md space-y-8">
                    <div className="bg-white dark:bg-gray-800 shadow-b-md rounded-md p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300">
                        <h2 className="my-3 text-center justify-start text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 transition-colors duration-300">
                            Create an account
                        </h2>
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Username</label>
                                <div className="mt-1">
                                    <input name="username" type="username" required className="px-2 py-3 mt-1 text-black dark:text-white bg-white dark:bg-gray-700 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none focus:ring-sky-500 dark:focus:ring-sky-400 sm:text-sm transition-all duration-300" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Email</label>
                                <div className="mt-1">
                                    <input name="email" type="email-address" autoComplete="email-address" required className="px-2 py-3 mt-1 text-black dark:text-white bg-white dark:bg-gray-700 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none focus:ring-sky-500 dark:focus:ring-sky-400 sm:text-sm transition-all duration-300" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Password</label>
                                <div className="mt-1">
                                    <input name="password" type="password" autoComplete="password" required className="px-2 py-3 mt-1 text-black dark:text-white bg-white dark:bg-gray-700 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none focus:ring-sky-500 dark:focus:ring-sky-400 sm:text-sm transition-all duration-300" />
                                </div>
                            </div>
                            <div>
                                <button type="submit" className="flex w-full cursor-pointer justify-center rounded-md border border-transparent bg-sky-400 dark:bg-sky-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-75 dark:hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-300">
                                    register
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateUser
