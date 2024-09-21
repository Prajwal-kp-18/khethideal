"use client";
import { useForm } from "react-hook-form";
import { useEffect, useState, useTransition } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import {
  GoogleReCaptchaProvider,
  GoogleReCaptcha,
} from "react-google-recaptcha-v3";
import { getErrorMessage, fetchCsrfToken } from "@/lib/clientUtils/secure";


import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { NewPasswordSchema } from "../../../schemas";

import CardWrapper from "./card-wrapper";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { newPassword } from "../../../actions/new-password";

export const NewPasswordForm = () => {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [rtoken, setRToken] = useState("");
  const [refreshReCaptcha, setRefreshReCaptcha] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>("");

  // set reCAPTCHA token
  const setTokenFunc = (getToken: string) => {
    setRToken(getToken);
  };


  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
    },
  });


  const onSubmit = async (values: any) => {
    setError("");
    setSuccess("");
    console.log(values);
    
    grecaptcha.enterprise.ready(async () => {
      const token = await grecaptcha.enterprise.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);
      setTokenFunc(token);
    });

    const recaptcha_token = token;

    // const data = await fetchCsrfToken();
    // if (data) {
    //   const details = await data.json();
    //   const csrftoken = details?.csrfToken;
    //   setCsrfToken(csrftoken);
    // } else {
    //   // Handle the case where data is null
    //   console.error("Data is null");
    // }


    startTransition(() => {
      newPassword({...values, recaptcha_token}, token).then((data) => {
        setError(data?.error);

        setSuccess(data?.success);
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Enter a new password"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className=" space-y-4 ">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="******"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button type="submit" className="w-full" disabled={isPending}>
            Reset password
          </Button>
          {/* <GoogleReCaptchaProvider
            reCaptchaKey={
              process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
                ? process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
                : ""
            }
          >
            <GoogleReCaptcha
              onVerify={setTokenFunc}
              refreshReCaptcha={refreshReCaptcha}
            />
          </GoogleReCaptchaProvider> */}
        </form>
      </Form>
    </CardWrapper>
  );
};
