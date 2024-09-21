"use server";
import * as z from "zod";
import bcrypt from "bcryptjs";
import { NewPasswordSchema } from "../schemas";
import { getPasswordResetTokenByToken } from "../data/password-reset-token";
import { getUserByEmail } from "../data/user";
import { db } from "@/lib/db";

export const newPassword = async (

  
  values: any,
  token?: string | null
) => {
  if (!token) {
    return { error: "Missing token" };
  }
  const { recaptcha_token, ...value } = values;
  const validatedFields = NewPasswordSchema.safeParse(value);

  if (!validatedFields.success) {
    return { error: "Invalid Fields" };
  }
  
 
  // if (!recaptcha_token) {
  //   return { error: "reCAPTCHA token not found! Try again" };
  // }

  // const data = {
  //   "event": {
  //     "token": recaptcha_token,
  //     "siteKey": process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  //   }
  // }

  // const recaptchaResponse = await fetch(
  //      `https://recaptchaenterprise.googleapis.com/v1/projects/${process.env.RECAPTCHA_PROJECT}/assessments?key=${process.env.RECAPTCHA_API_KEY}`,
  //      {
  //       method: "POST",
  //       body: JSON.stringify(data),
  //      }
  //  );

  // // const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;

  // // // Verify reCAPTCHA token
  // // const recaptchaResponse = await fetch(
  // //   `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${recaptcha_token}`,
  // //   { method: "POST" }
  // // );

  // const recaptchaResult = await recaptchaResponse.json();

  // console.log(recaptchaResult.riskAnalysis.score);
  // if (recaptchaResult.riskAnalysis.score < 0.7) {
  //   return { error: recaptchaResult["error-codes"] };
  // }

  const { password } = validatedFields.data;

  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return { error: "Invalid or expired token" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    return { error: "Token has expired" };
  }

  const existingUser = await getUserByEmail(existingToken.email);
  if (!existingUser) {
    return { error: "Email does not exist" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  });

  await db.passwordResetToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Password updated successfully" };
};
