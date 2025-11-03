"use client";
import FormProvider from "@/components/common/FormProvider";
import RHFTextField from "@/components/common/RHFTextField";
import { Button } from "@/components/ui/button";
import useSnackbar from "@/hooks/useSnackbar";
import { useContactMutation } from "@/redux/api/auth/authApi";
import { yupResolver } from "@hookform/resolvers/yup";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import * as Yup from "yup";

export default function ContactForm() {
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
      <div className="flex flex-col gap-5">
        <motion.h3
          initial={{ y: -20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-3xl font-bold"
        >
          Feel free to contact us. We&apos;ll be glad to hear from you, buddy.
        </motion.h3>

        <motion.div
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-col gap-3"
        >
          <RHFTextField label="Your name" name="name" />
          <RHFTextField label="Your e-mail address" name="email" />
          <RHFTextField label="Subject" name="subject" />

          <RHFTextField
            label="Enter your message here."
            name="message"
            placeholder="Enter your message here."
          />
        </motion.div>

        <motion.div
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Button
            type="submit"
            size="lg"
            variant="default"
            disabled={isSubmitting}
          >
            Submit Now
          </Button>
        </motion.div>
      </div>
    </FormProvider>
  );
}
