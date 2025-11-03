"use client";
import FormProvider from "@/components/common/FormProvider";
import RHFTextField from "@/components/common/RHFTextField";
import { Button } from "@/components/ui/button";
import useSnackbar from "@/hooks/useSnackbar";
import { useContactMutation } from "@/redux/api/auth/authApi";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as Yup from "yup";

export default function FaqForm() {
  const enqueueSnackbar = useSnackbar();
  const [contact] = useContactMutation();

  const contactSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Enter a valid email")
      .required("Email is required"),
    subject: Yup.string().required("Subject is required"),
    message: Yup.string().required("Message is required"),
  });

  const defaultValues = {
    name: "",
    email: "",
    subject: "",
    message: "",
  };

  const methods = useForm({
    resolver: yupResolver(contactSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      await contact(data).unwrap();
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
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-3">
        <h4 className="from-primary to-primary/70 bg-gradient-to-br bg-clip-text text-2xl font-bold text-transparent">
          Haven&apos;t found the right help?
        </h4>

        <RHFTextField label="Your name" name="name" />
        <RHFTextField label="Your e-mail address" name="email" />
        <RHFTextField label="Subject" name="subject" />
        <RHFTextField
          label="Enter your message here."
          name="message"
          placeholder="Enter your message here."
        />
        <Button
          type="submit"
          size="lg"
          variant="default"
          disabled={isSubmitting}
        >
          Submit Now
        </Button>
      </div>
    </FormProvider>
  );
}
