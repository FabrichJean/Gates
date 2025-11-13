import toast, { Toaster } from "react-hot-toast"
import randomPassword from "../utils/randomPassword"
import { updatePassword } from "../api/auth"
import type { User } from "../hooks/useVideos"

function UpdatePassword({ u, self = false }: { u: User, self?: boolean }) {

    const submit: React.FormEventHandler<HTMLFormElement> | undefined = async (e) => {
        e.preventDefault()
        const formdata = new FormData(e.currentTarget)
        const pass = formdata.get('new_pass')?.toString().trim()
        const confirm = formdata.get('confirm_pass')?.toString().trim()
        const old = self ? formdata.get('old_pass')?.toString().trim() : undefined

        if (pass !== confirm) {
            toast.error("Password doesn't match")
            e.currentTarget.reset()
            return
        }

        try {
            await updatePassword(u.id, pass!, confirm!, old)
            toast.success('Updated!')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || 'Error')
        } finally {
            const dialog = document.getElementById('modal_' + u.username)
            // close dialog if exists and has close method
            if (dialog && 'closest' in dialog) {
                const d = (dialog as HTMLElement).closest('dialog') as HTMLDialogElement | null
                if (d && typeof d.close === 'function') d.close()
            }
            e.currentTarget.reset()
        }
    }

    const datalistId = `pw_suggestions_${u.username}`

    return (
        <dialog id={'modal_' + u.username} className="modal modal-bottom sm:modal-middle inset-0 backdrop-blur-md bg-black/70 dark:bg-black/80" aria-labelledby={`update_pw_${u.username}`}>
            {/* <Toaster /> */}
            <form onSubmit={submit} className="modal-box bg-white dark:bg-gray-800 text-start w-full max-w-lg mx-4 sm:mx-auto p-6 relative border border-gray-200 dark:border-gray-700 transition-all duration-300" role="dialog" aria-modal="true">
                <button type="button" aria-label="Close dialog" className="absolute right-3 top-3 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-300" onClick={() => {
                    const dialog = document.getElementById('modal_' + u.username)
                    if (dialog && 'closest' in dialog) {
                        const d = (dialog as HTMLElement).closest('dialog') as HTMLDialogElement | null
                        if (d && typeof d.close === 'function') d.close()
                    }
                }}>
                    ✕
                </button>

                <h3 id={`update_pw_${u.username}`} className="font-bold text-lg text-gray-800 dark:text-gray-200 transition-colors duration-300">Update password <code className="underline text-blue-600 dark:text-blue-400">{u.username}</code></h3>

                {self && (
                    <label className="block mt-4">
                        <span className="sr-only">Old password</span>
                        <input type="password" name="old_pass" className="input w-full outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300" placeholder="Old password" aria-label="Old password" required />
                    </label>
                )}

                <label className="block mt-4">
                    <span className="sr-only">New password</span>
                    <input type="password" name="new_pass" className="input w-full outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400" placeholder="Enter new password" list={datalistId} aria-label="New password" required />
                </label>

                <datalist id={datalistId}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <option key={i} value={randomPassword()} />
                    ))}
                </datalist>

                <label className="block mt-4">
                    <span className="sr-only">Confirm password</span>
                    <input type="password" name="confirm_pass" className="input w-full outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400" placeholder="Confirm password" aria-label="Confirm password" required />
                </label>

                <button className="btn block mt-6 w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white border-blue-600 dark:border-blue-500 transition-all duration-300" type="submit">Submit</button>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 transition-colors duration-300">
                    Must be more than 8 characters, include a number, a lowercase and an uppercase letter.
                </p>
            </form>
        </dialog>
    )
}

export default UpdatePassword
