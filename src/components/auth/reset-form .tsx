"use client";
import { useForm } from "react-hook-form";
import { useEffect, useState, useTransition } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { ResetSchema } from "../../../schemas";

import CardWrapper from "./card-wrapper";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { reset } from "../../../actions/reset";

export const ResetForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [token, setToken] = useState("");
  const [refreshReCaptcha, setRefreshReCaptcha] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>("");

  

  // set reCAPTCHA token
  const setTokenFunc = (getToken: string) => {
    setToken(getToken);
  };


  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
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
      reset({...values, recaptcha_token}).then((data) => {
        setError(data?.error);

        setSuccess(data?.success);
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Forgot your password"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className=" space-y-4 ">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="abcd.18@example.com"
                      type="email"
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
            Send reset email
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
