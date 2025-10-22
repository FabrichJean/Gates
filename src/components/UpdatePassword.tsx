import toast, { Toaster } from "react-hot-toast"
import randomPassword from "../utils/randomPassword"
import { updatePassword } from "../api/auth"

function UpdatePassword({ u, self = false }: { u: any, self?: boolean }) {

    const submit: React.FormEventHandler<HTMLFormElement> | undefined = async (e) => {
        e.preventDefault()
        const formdata = new FormData(e.currentTarget)
        const [pass, confirm, old] = [
            formdata.get('new_pass')?.toString().trim(),
            formdata.get('confirm_pass')?.toString().trim(),
            self ? formdata.get('old_pass')?.toString().trim() : undefined,
        ]

        if (pass !== confirm) {
            toast.error("Password doesn't match");
            e.currentTarget.reset();
            return;
        }

        await updatePassword(u.id, pass!, confirm!, old)
            .then(() => {
                toast.success('updated !')
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || err?.message || 'Error');
            })
            .finally(() => {
                document.getElementById('modal_' + u.username)!.close()
            })
    }

    return (
        <dialog id={'modal_' + u.username} className="modal modal-bottom sm:modal-middle inset-0 backdrop-blur-md bg-black/70">
            <Toaster />
            <form onSubmit={submit} className="modal-box text-start w-max">
                <h3 className="font-bold text-lg">Update password <code className="underline">{u.username}</code></h3>

                <input type="text" name="old_pass" className="input mt-8 w-full" placeholder="OLD PASSWORD" required />

                <input type="text" name="new_pass" className="input mt-8 w-full" placeholder="ENTER NEW PASSWORD" list="browsers" required />
                <datalist id="browsers">
                    {Array.from({ length: 10 }).map(() => <option value={randomPassword()}></option>)}
                </datalist>
                <input type="text" name="confirm_pass" className="input mt-8 w-full" placeholder="CONFIRM PASSWORD" required />
                <button className="btn block mt-4 w-full" type="submit">submit</button>
                <p className="validator-hint hidden">
                    Must be more than 8 characters, including
                    <br />At least one number <br />At least one lowercase letter <br />At least one uppercase letter
                </p>
            </form>
        </dialog>
    )
}

export default UpdatePassword
