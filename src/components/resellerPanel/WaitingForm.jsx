"use client";
import RHFTextField from "@/components/common/RHFTextField";
import { Button } from "@/components/ui/button";
import useSnackbar from "@/hooks/useSnackbar";
import { useAffiliateMutation } from "@/redux/api/auth/authApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

export default function WaitlistForm({ userType }) {
  const enqueueSnackbar = useSnackbar();
  const [affiliate] = useAffiliateMutation();

  const schema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
  });

  const defaultValues = {
    name: "",
    email: "",
  };

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        userType,
      };

      await affiliate(payload).unwrap();

      enqueueSnackbar(`Submitted successfully!`);
      reset();
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Sorry, an unexpected error occurred.";
      enqueueSnackbar(errorMessage, { variant: "error" });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mx-auto w-full max-w-full sm:max-w-[450px]">
          <RHFTextField
            name="name"
            placeholder="Full Name"
            startAdornment={
              <div className="mr-1 flex items-center justify-center">
                <User className="text-muted-foreground h-5 w-5" />
              </div>
            }
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            className="mb-2 w-full"
          />
          <RHFTextField
            name="email"
            placeholder="Email"
            startAdornment={
              <div className="mr-1 flex items-center justify-center">
                <Mail className="text-muted-foreground h-5 w-5" />
              </div>
            }
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            className="mb-2 w-full"
          />
          <Button
            // data-umami-event="Form: Join the waitlist"
            data-rybbit-event="Form: Join the waitlist"
            variant="default"
            size="lg"
            type="submit"
            disabled={isSubmitting}
            className="w-full text-sm sm:text-base"
          >
            Join the waitlist
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
