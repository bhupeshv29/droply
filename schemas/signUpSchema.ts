import z from "zod";


export const signUpSchema = z.object({
    email: z.string().min(1, { message: "Email is required" }).email({ message: "Please enter a valid email address" }),
    password: z.string().min(1, { message: "password is required" }).min(8, { message: "password should be atleast 8 character" }),
    passwordConfirmation: z.string().min(1, { message: "please confirm your password" })
})
.refine((data) => data.password === data.passwordConfirmation, {
    message: "Password do not match",
    path: ["passwordConfirmation"]
})

