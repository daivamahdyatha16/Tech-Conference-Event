import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import type { FormikHelpers } from "formik";
import * as Yup from "yup";
import { ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { getErrorMessage } from "../../utils/error";
import logoFull from "../../assets/logo/logo.png";

interface RegisterFormValues {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: "ATTENDEE" | "ORGANIZER";
  referredByCode: string;
}

const initialValues: RegisterFormValues = {
  fullName: "",
  email: "",
  phoneNumber: "",
  password: "",
  role: "ATTENDEE",
  referredByCode: "",
};

const validationSchema = Yup.object({
  fullName: Yup.string().min(2, "Full name must be at least 2 characters").required("Full name is required"),
  email: Yup.string().email("Invalid email format").required("Email is required"),
  phoneNumber: Yup.string().min(10, "Phone number must be at least 10 digits").required("Phone number is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  role: Yup.mixed<"ATTENDEE" | "ORGANIZER">().oneOf(["ATTENDEE", "ORGANIZER"]).required(),
  referredByCode: Yup.string(),
});

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const [submitError, setSubmitError] = useState("");

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  const handleSubmit = async (
    values: RegisterFormValues,
    { setSubmitting }: FormikHelpers<RegisterFormValues>,
  ) => {
    try {
      setSubmitError("");

      await register({
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        password: values.password,
        role: values.role,
        referredByCode: values.referredByCode || undefined,
      });

      toast.success("Registration successful! Please log in.");
      navigate("/login", { state: location.state });
    } catch (err) {
      setSubmitError(getErrorMessage(err, "Failed to register."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-12">
      <Button
        type="button"
        variant="outline"
        aria-label="Back"
        onClick={() => navigate(from)}
        className="mb-4 w-fit px-3 py-2 text-xs"
      >
        <ArrowLeft size={14} />
        Back
      </Button>

      <img
        src={logoFull}
        alt="TechCon Logo"
        className="mx-auto h-16 w-auto object-contain"
      />

      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">
        Create your account
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Join TechCon to discover and manage conferences.
      </p>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="mt-8 space-y-4">
            {submitError && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {submitError}
              </p>
            )}

            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <Field as={Input} id="fullName" name="fullName" placeholder="Jane Doe" />
              <ErrorMessage name="fullName" component="p" className="mt-1 text-xs text-red-500" />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <Field as={Input} id="email" name="email" type="email" placeholder="jane@example.com" />
              <ErrorMessage name="email" component="p" className="mt-1 text-xs text-red-500" />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="mb-1.5 block text-sm font-medium text-slate-700">
                Phone Number
              </label>
              <Field as={Input} id="phoneNumber" name="phoneNumber" placeholder="08123456789" />
              <ErrorMessage name="phoneNumber" component="p" className="mt-1 text-xs text-red-500" />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <Field as={Input} id="password" name="password" type="password" placeholder="••••••••" />
              <ErrorMessage name="password" component="p" className="mt-1 text-xs text-red-500" />
            </div>

            <div>
              <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-slate-700">
                I want to
              </label>
              <Field
                as="select"
                id="role"
                name="role"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="ATTENDEE">Attend conferences</option>
                <option value="ORGANIZER">Organize conferences</option>
              </Field>
            </div>

            <div>
              <label htmlFor="referredByCode" className="mb-1.5 block text-sm font-medium text-slate-700">
                Referral Code (optional)
              </label>
              <Field as={Input} id="referredByCode" name="referredByCode" placeholder="REF-XXXXXX" />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </Form>
        )}
      </Formik>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to="/login"
          state={location.state}
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          Log in
        </Link>
      </p>
    </div>
  );
};

export default Register;
