import z from "zod";


export const signInSchema = z.object({
    identifier: z.string().min(1, { message: "Email or username is required" }).email({ message: "Please enter a valid email address" }),
    password: z.string().min(1, { message: "password is required" }).min(8, { message: "password should be atleast 8 character" }),
})
  