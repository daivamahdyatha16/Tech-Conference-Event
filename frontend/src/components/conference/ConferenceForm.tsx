import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import type { FormikHelpers } from "formik";
import * as Yup from "yup";
import { Loader2, Plus } from "lucide-react";
import { useCategory } from "../../hooks/useCategory";
import { createConference } from "../../api/conference.api";
import { createTicketType } from "../../api/ticket.api";
import { getMinStartDateTime } from "../../utils/datetime";
import Button from "../ui/Button";


interface TicketTypeFormValues {
  name: string;
  description: string;
  price: number | "";
  quota: number | "";
}

interface CreateConferenceFormValues {
  title: string;
  description: string;
  categoryId: number | "";
  city: string;
  venue: string;
  startDate: string;
  endDate: string;
  isFree: boolean;
  ticketTypes: TicketTypeFormValues[];
}


const emptyTicketType: TicketTypeFormValues = {
  name: "",
  description: "",
  price: "",
  quota: "",
};


const initialValues: CreateConferenceFormValues = {
  title: "",
  description: "",
  categoryId: "",
  city: "",
  venue: "",
  startDate: "",
  endDate: "",
  isFree: false,
  ticketTypes: [{ ...emptyTicketType }],
};


const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  categoryId: Yup.number()
    .typeError("Category is required")
    .required("Category is required"),
  city: Yup.string().required("City is required"),
  venue: Yup.string().required("Venue is required"),
  startDate: Yup.string()
    .required("Start date is required")
    .test(
      "start-at-least-tomorrow",
      "Start date must be at least tomorrow",
      (value) => {
        if (!value) return true;
        return new Date(value) >= new Date(getMinStartDateTime());
      }
    ),
  endDate: Yup.string()
    .required("End date is required")
    .test(
      "end-after-start",
      "End date must be after start date",
      function (value) {
        const { startDate } = this.parent as CreateConferenceFormValues;
        if (!startDate || !value) return true;
        return new Date(value) > new Date(startDate);
      }
    ),
  ticketTypes: Yup.array()
    .of(
      Yup.object({
        name: Yup.string()
          .trim()
          .min(3, "Ticket name must be at least 3 characters")
          .required("Ticket name is required"),
        description: Yup.string()
          .trim()
          .test(
            "description-length",
            "Description must be at least 10 characters",
            (value) => !value || value.length >= 10
          ),
        price: Yup.number()
          .typeError("Price is required")
          .min(0, "Price cannot be negative")
          .required("Price is required"),
        quota: Yup.number()
          .typeError("Quota is required")
          .integer("Quota must be a whole number")
          .min(1, "Quota must be at least 1")
          .required("Quota is required"),
      })
    )
    .min(1, "Add at least one ticket type"),
});


const CreateConference = () => {
  const navigate = useNavigate();
  const categories = useCategory();

  const handleSubmit = async (
  values: CreateConferenceFormValues,
  { setSubmitting, resetForm }: FormikHelpers<CreateConferenceFormValues>
) => {
  try {
    const { data: conference } = await createConference({
      title: values.title,
      description: values.description,
      city: values.city,
      venue: values.venue,
      startDate: values.startDate,
      endDate: values.endDate,
      isFree: values.isFree,
      categoryId: values.categoryId as number,
    });

    await Promise.all(
      values.ticketTypes.map((ticketType) =>
        createTicketType(conference.id, {
          name: ticketType.name,
          description: ticketType.description || undefined,
          price: Number(ticketType.price),
          quota: Number(ticketType.quota),
        })
      )
    );

    alert("Conference created successfully!");

    resetForm();

    navigate(`/conferences/${conference.id}`);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create conference.";

    alert(message);
  } finally {
    setSubmitting(false);
  }
};


  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:text-slate-400";

  const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

  const errorClass = "mt-1.5 text-xs text-red-500";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 lg:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Create Conference
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Fill in the details below to publish a new conference.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values, errors }) => (
              <Form className="space-y-6">
                <div>
                  <label htmlFor="title" className={labelClass}>
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Field
                    id="title"
                    name="title"
                    type="text"
                    placeholder="e.g. International AI Summit 2025"
                    className={inputClass}
                  />
                  <ErrorMessage
                    name="title"
                    component="p"
                    className={errorClass}
                  />
                </div>

                <div>
                  <label htmlFor="description" className={labelClass}>
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as="textarea"
                    id="description"
                    name="description"
                    rows={4}
                    placeholder="Describe what attendees can expect from this conference..."
                    className={`${inputClass} resize-none`}
                  />
                  <ErrorMessage
                    name="description"
                    component="p"
                    className={errorClass}
                  />
                </div>

                <div>
                  <label htmlFor="categoryId" className={labelClass}>
                    Category <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as="select"
                    id="categoryId"
                    name="categoryId"
                    className={`${inputClass} cursor-pointer appearance-none`}
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="categoryId"
                    component="p"
                    className={errorClass}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="city" className={labelClass}>
                      City <span className="text-red-500">*</span>
                    </label>
                    <Field
                      id="city"
                      name="city"
                      type="text"
                      placeholder="e.g. Jakarta"
                      className={inputClass}
                    />
                    <ErrorMessage
                      name="city"
                      component="p"
                      className={errorClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="venue" className={labelClass}>
                      Venue <span className="text-red-500">*</span>
                    </label>
                    <Field
                      id="venue"
                      name="venue"
                      type="text"
                      placeholder="e.g. Jakarta Convention Center"
                      className={inputClass}
                    />
                    <ErrorMessage
                      name="venue"
                      component="p"
                      className={errorClass}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="startDate" className={labelClass}>
                      Start Date &amp; Time <span className="text-red-500">*</span>
                    </label>
                    <Field
                      id="startDate"
                      name="startDate"
                      type="datetime-local"
                      min={getMinStartDateTime()}
                      className={inputClass}
                    />
                    <ErrorMessage
                      name="startDate"
                      component="p"
                      className={errorClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="endDate" className={labelClass}>
                      End Date &amp; Time <span className="text-red-500">*</span>
                    </label>
                    <Field
                      id="endDate"
                      name="endDate"
                      type="datetime-local"
                      min={values.startDate || getMinStartDateTime()}
                      className={inputClass}
                    />
                    <ErrorMessage
                      name="endDate"
                      component="p"
                      className={errorClass}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Field
                    id="isFree"
                    name="isFree"
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-blue-600"
                  />
                  <div>
                    <label
                      htmlFor="isFree"
                      className="cursor-pointer text-sm font-medium text-slate-700"
                    >
                      Free Event
                    </label>
                    <p className="text-xs text-slate-500">
                      Check this if the conference is open to the public at no
                      cost.
                    </p>
                  </div>
                </div>

                <hr className="border-slate-100" />

                <FieldArray name="ticketTypes">
                  {({ push, remove }) => (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-sm font-semibold text-slate-900">
                            Ticket Types <span className="text-red-500">*</span>
                          </h2>
                          <p className="text-xs text-slate-500">
                            Add one or more ticket types for this conference.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => push({ ...emptyTicketType })}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-all duration-200 hover:bg-blue-100 active:scale-[0.98]"
                        >
                          <Plus size={14} />
                          Add Ticket Type
                        </button>
                      </div>

                      {typeof errors.ticketTypes === "string" && (
                        <p className={errorClass}>{errors.ticketTypes}</p>
                      )}

                      {values.ticketTypes.map((_, index) => (
                        <div
                          key={index}
                          className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">
                              Ticket #{index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              disabled={values.ticketTypes.length === 1}
                              className="text-xs font-semibold text-red-500 transition hover:text-red-700 disabled:cursor-not-allowed disabled:text-slate-300"
                            >
                              Remove
                            </button>
                          </div>

                          <div>
                            <label
                              htmlFor={`ticketTypes.${index}.name`}
                              className={labelClass}
                            >
                              Ticket Name <span className="text-red-500">*</span>
                            </label>
                            <Field
                              id={`ticketTypes.${index}.name`}
                              name={`ticketTypes.${index}.name`}
                              type="text"
                              placeholder="e.g. Early Bird, VIP, Regular"
                              className={inputClass}
                            />
                            <ErrorMessage
                              name={`ticketTypes.${index}.name`}
                              component="p"
                              className={errorClass}
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`ticketTypes.${index}.description`}
                              className={labelClass}
                            >
                              Description
                            </label>
                            <Field
                              as="textarea"
                              id={`ticketTypes.${index}.description`}
                              name={`ticketTypes.${index}.description`}
                              rows={2}
                              placeholder="What's included with this ticket..."
                              className={`${inputClass} resize-none`}
                            />
                            <ErrorMessage
                              name={`ticketTypes.${index}.description`}
                              component="p"
                              className={errorClass}
                            />
                          </div>

                          <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                              <label
                                htmlFor={`ticketTypes.${index}.price`}
                                className={labelClass}
                              >
                                Price (IDR) <span className="text-red-500">*</span>
                              </label>
                              <Field
                                id={`ticketTypes.${index}.price`}
                                name={`ticketTypes.${index}.price`}
                                type="number"
                                min="0"
                                placeholder="e.g. 150000"
                                className={inputClass}
                              />
                              <ErrorMessage
                                name={`ticketTypes.${index}.price`}
                                component="p"
                                className={errorClass}
                              />
                            </div>

                            <div>
                              <label
                                htmlFor={`ticketTypes.${index}.quota`}
                                className={labelClass}
                              >
                                Quota <span className="text-red-500">*</span>
                              </label>
                              <Field
                                id={`ticketTypes.${index}.quota`}
                                name={`ticketTypes.${index}.quota`}
                                type="number"
                                min="1"
                                placeholder="e.g. 100"
                                className={inputClass}
                              />
                              <ErrorMessage
                                name={`ticketTypes.${index}.quota`}
                                component="p"
                                className={errorClass}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </FieldArray>

                <hr className="border-slate-100" />

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Conference"
                  )}
                </Button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default CreateConference;