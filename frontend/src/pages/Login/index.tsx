import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import type { FormikHelpers } from "formik";
import * as Yup from "yup";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

interface LoginFormValues {
  email: string;
  password: string;
}

const initialValues: LoginFormValues = {
  email: "",
  password: "",
};

const validationSchema = Yup.object({
  email: Yup.string().email("Format email tidak valid").required("Email wajib diisi"),
  password: Yup.string().required("Password wajib diisi"),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [submitError, setSubmitError] = useState("");

  const from = (location.state as { from?: Location })?.from?.pathname || "/";

  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting }: FormikHelpers<LoginFormValues>,
  ) => {
    try {
      setSubmitError("");

      await login(values);

      toast.success("Login berhasil!");
      navigate(from, { replace: true });
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Email atau password salah.";

      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
        Welcome back
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Log in to continue to TechCon.
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
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <Field as={Input} id="email" name="email" type="email" placeholder="jane@example.com" />
              <ErrorMessage name="email" component="p" className="mt-1 text-xs text-red-500" />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <Field as={Input} id="password" name="password" type="password" placeholder="••••••••" />
              <ErrorMessage name="password" component="p" className="mt-1 text-xs text-red-500" />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </Form>
        )}
      </Formik>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;
