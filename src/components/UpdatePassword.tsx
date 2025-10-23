import toast, { Toaster } from "react-hot-toast"
import randomPassword from "../utils/randomPassword"
import { updatePassword } from "../api/auth"

function UpdatePassword({ u, self = false }: { u: any, self?: boolean }) {

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

    // unique datalist id to avoid collisions when multiple modals are on the page
    const datalistId = `pw_suggestions_${u.username}`

    return (
        <dialog id={'modal_' + u.username} className="modal modal-bottom sm:modal-middle inset-0 backdrop-blur-md bg-black/70" aria-labelledby={`update_pw_${u.username}`}>
            <Toaster />
            <form onSubmit={submit} className="modal-box text-start w-full max-w-lg mx-4 sm:mx-auto p-6 relative" role="dialog" aria-modal="true">
                <button type="button" aria-label="Close dialog" className="absolute right-3 top-3 btn btn-ghost btn-sm" onClick={() => {
                    const dialog = document.getElementById('modal_' + u.username)
                    if (dialog && 'closest' in dialog) {
                        const d = (dialog as HTMLElement).closest('dialog') as HTMLDialogElement | null
                        if (d && typeof d.close === 'function') d.close()
                    }
                }}>
                    ✕
                </button>

                <h3 id={`update_pw_${u.username}`} className="font-bold text-lg text-gray-600">Update password <code className="underline">{u.username}</code></h3>

                {self && (
                    <label className="block mt-4">
                        <span className="sr-only">Old password</span>
                        <input type="password" name="old_pass" className="input w-full outline-none" placeholder="Old password" aria-label="Old password" required />
                    </label>
                )}

                <label className="block mt-4">
                    <span className="sr-only">New password</span>
                    <input type="password" name="new_pass" className="input w-full outline-none" placeholder="Enter new password" list={datalistId} aria-label="New password" required />
                </label>

                <datalist id={datalistId}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <option key={i} value={randomPassword()} />
                    ))}
                </datalist>

                <label className="block mt-4">
                    <span className="sr-only">Confirm password</span>
                    <input type="password" name="confirm_pass" className="input w-full outline-none" placeholder="Confirm password" aria-label="Confirm password" required />
                </label>

                <button className="btn block mt-6 w-full" type="submit">Submit</button>

                <p className="text-sm text-gray-500 mt-3">
                    Must be more than 8 characters, include a number, a lowercase and an uppercase letter.
                </p>
            </form>
        </dialog>
    )
}

export default UpdatePassword
