import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import type { FormikHelpers } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { useCategory } from "../../hooks/useCategory";
import { createConference } from "../../api/conference.api";
import { createTicketType } from "../../api/ticket.api";
import { createPromotion } from "../../api/promotion.api";
import { getMinStartDateTime } from "../../utils/datetime";
import { getErrorMessage } from "../../utils/error";
import Button from "../ui/Button";


interface TicketTypeFormValues {
  name: string;
  description: string;
  price: number | "";
  quota: number | "";
}

interface PromotionFormValues {
  discountType: "PERCENTAGE" | "NOMINAL";
  discountValue: number | "";
  quota: number | "";
  startDate: string;
  endDate: string;
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
  thumbnail: File | null;
  ticketTypes: TicketTypeFormValues[];
  promotions: PromotionFormValues[];
}

const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;


const emptyTicketType: TicketTypeFormValues = {
  name: "",
  description: "",
  price: "",
  quota: "",
};

const emptyPromotion: PromotionFormValues = {
  discountType: "PERCENTAGE",
  discountValue: "",
  quota: "",
  startDate: "",
  endDate: "",
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
  thumbnail: null,
  ticketTypes: [{ ...emptyTicketType }],
  promotions: [],
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
      "End date cannot be before start date",
      function (value) {
        const { startDate } = this.parent as CreateConferenceFormValues;
        if (!startDate || !value) return true;
        return new Date(value) >= new Date(startDate);
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
  promotions: Yup.array()
    .max(1, "A conference can only have one promotion")
    .of(
    Yup.object({
      discountType: Yup.string()
        .oneOf(["PERCENTAGE", "NOMINAL"])
        .required("Discount type is required"),
      discountValue: Yup.number()
        .typeError("Discount value is required")
        .positive("Discount value must be greater than 0")
        .required("Discount value is required"),
      quota: Yup.number()
        .typeError("Quota must be a number")
        .integer("Quota must be a whole number")
        .min(1, "Quota must be at least 1"),
      startDate: Yup.string().required("Start date is required"),
      endDate: Yup.string()
        .required("End date is required")
        .test(
          "promo-end-after-start",
          "End date cannot be before start date",
          function (value) {
            const { startDate } = this.parent as PromotionFormValues;
            if (!startDate || !value) return true;
            return new Date(value) >= new Date(startDate);
          }
        ),
    })
  ),
});


const CreateConference = () => {
  const navigate = useNavigate();
  const categories = useCategory();
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    null
  );

  const handleThumbnailChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: unknown) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }

    if (file.size > MAX_THUMBNAIL_SIZE) {
      toast.error("Image must be 5MB or smaller.");
      return;
    }

    setFieldValue("thumbnail", file);
    setThumbnailPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

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
      thumbnail: values.thumbnail ?? undefined,
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

    await Promise.all(
      values.promotions.slice(0, 1).map((promotion) =>
        createPromotion({
          conferenceId: conference.id,
          promotionType: "EVENT_PROMO",
          discountType: promotion.discountType,
          discountValue: Number(promotion.discountValue),
          quota: promotion.quota === "" ? undefined : Number(promotion.quota),
          startDate: promotion.startDate,
          endDate: promotion.endDate,
        })
      )
    );

    toast.success("Conference created successfully!");

    resetForm();
    setThumbnailPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });

    navigate(`/conferences/${conference.id}`);
  } catch (error) {
    toast.error(getErrorMessage(error, "Failed to create conference."));
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
        <Button
          type="button"
          variant="outline"
          aria-label="Back to Dashboard"
          onClick={() => navigate("/dashboard")}
          className="mb-4 w-fit px-3 py-2 text-xs"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Button>

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
            {({ isSubmitting, values, errors, setFieldValue }) => (
              <Form className="space-y-6">
                <div>
                  <label htmlFor="thumbnail" className={labelClass}>
                    Cover Image
                  </label>
                  {thumbnailPreview && (
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="mb-3 h-40 w-full rounded-xl object-cover"
                    />
                  )}
                  <input
                    id="thumbnail"
                    name="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleThumbnailChange(e, setFieldValue)}
                    className={`${inputClass} cursor-pointer file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700`}
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    Optional. PNG or JPG, up to 5MB.
                  </p>
                </div>

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
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <Field
                      id="startDate"
                      name="startDate"
                      type="date"
                      min={getMinStartDateTime().split("T")[0]}
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
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <Field
                      id="endDate"
                      name="endDate"
                      type="date"
                      min={values.startDate || getMinStartDateTime().split("T")[0]}
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

                <FieldArray name="promotions">
                  {({ push, remove }) => (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-sm font-semibold text-slate-900">
                            Promotion
                          </h2>
                          <p className="text-xs text-slate-500">
                            Optionally add a discount promotion for this
                            conference (quota and active period). A
                            conference can have at most one promotion.
                          </p>
                        </div>
                        {values.promotions.length === 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (values.promotions.length >= 1) return;
                              push({ ...emptyPromotion });
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-all duration-200 hover:bg-blue-100 active:scale-[0.98]"
                          >
                            <Plus size={14} />
                            Add Promotion
                          </button>
                        )}
                      </div>

                      {values.promotions.map((_, index) => (
                        <div
                          key={index}
                          className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">
                              Event Promotion
                            </span>
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-xs font-semibold text-red-500 transition hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                              <label
                                htmlFor={`promotions.${index}.discountType`}
                                className={labelClass}
                              >
                                Discount Type{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <Field
                                as="select"
                                id={`promotions.${index}.discountType`}
                                name={`promotions.${index}.discountType`}
                                className={`${inputClass} cursor-pointer appearance-none`}
                              >
                                <option value="PERCENTAGE">Percentage (%)</option>
                                <option value="NOMINAL">Nominal (IDR)</option>
                              </Field>
                              <ErrorMessage
                                name={`promotions.${index}.discountType`}
                                component="p"
                                className={errorClass}
                              />
                            </div>

                            <div>
                              <label
                                htmlFor={`promotions.${index}.discountValue`}
                                className={labelClass}
                              >
                                Discount Value{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <Field
                                id={`promotions.${index}.discountValue`}
                                name={`promotions.${index}.discountValue`}
                                type="number"
                                min="0"
                                placeholder="e.g. 20"
                                className={inputClass}
                              />
                              <ErrorMessage
                                name={`promotions.${index}.discountValue`}
                                component="p"
                                className={errorClass}
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor={`promotions.${index}.quota`}
                              className={labelClass}
                            >
                              Quota (leave empty for unlimited)
                            </label>
                            <Field
                              id={`promotions.${index}.quota`}
                              name={`promotions.${index}.quota`}
                              type="number"
                              min="1"
                              placeholder="e.g. 50"
                              className={inputClass}
                            />
                            <ErrorMessage
                              name={`promotions.${index}.quota`}
                              component="p"
                              className={errorClass}
                            />
                          </div>

                          <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                              <label
                                htmlFor={`promotions.${index}.startDate`}
                                className={labelClass}
                              >
                                Start Date{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <Field
                                id={`promotions.${index}.startDate`}
                                name={`promotions.${index}.startDate`}
                                type="date"
                                className={inputClass}
                              />
                              <ErrorMessage
                                name={`promotions.${index}.startDate`}
                                component="p"
                                className={errorClass}
                              />
                            </div>

                            <div>
                              <label
                                htmlFor={`promotions.${index}.endDate`}
                                className={labelClass}
                              >
                                End Date <span className="text-red-500">*</span>
                              </label>
                              <Field
                                id={`promotions.${index}.endDate`}
                                name={`promotions.${index}.endDate`}
                                type="date"
                                className={inputClass}
                              />
                              <ErrorMessage
                                name={`promotions.${index}.endDate`}
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