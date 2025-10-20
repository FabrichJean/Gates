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
            <div className="bg-gray-100 flex h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="bg-white shadow-md rounded-md p-6">
                        <h2 className="my-3 text-center text-3xl font-bold tracking-tight text-gray-900">
                            Create an account
                        </h2>
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                                <div className="mt-1">
                                    <input name="username" type="username" required className="px-2 py-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <div className="mt-1">
                                    <input name="email" type="email-address" autoComplete="email-address" required className="px-2 py-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <div className="mt-1">
                                    <input name="password" type="password" autoComplete="password" required className="px-2 py-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm" />
                                </div>
                            </div>
                            <div>
                                <button type="submit" className="flex w-full justify-center rounded-md border border-transparent bg-sky-400 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2">
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
