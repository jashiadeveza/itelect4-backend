export interface Applicant {
  id: number;
  name: string;
  email: string;
  role: "student" | "admin" | "instructor";
  isActive: boolean;
  createdAt: string;
}

export interface Internship {
  id: number;
  company: string;
  position: string;
  location: string;
  availableSlots: number;
  createdAt: string;
}

export interface Application {
  id: number;
  applicantId: number;
  internshipId: number;
  status: ApplicationStatusValue;
  createdAt: string;
}

export type ApplicantCreateInput = Omit<Applicant, "id" | "createdAt"> & {
  createdAt?: string;
};

export type InternshipCreateInput = Omit<Internship, "id" | "createdAt"> & {
  createdAt?: string;
};

export const ApplicationStatus = {
  Pending: "Pending",
  UnderReview: "Under Review",
  InterviewScheduled: "Interview Scheduled",
  Accepted: "Accepted",
  Rejected: "Rejected",
} as const;

export type ApplicationStatusValue =
  (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export const Role = {
  Student: "student",
  Admin: "admin",
  Instructor: "instructor",
} as const;

export type ApplicationCreateInput = Omit<
  Application,
  "id" | "createdAt" | "status"
> & {
  status: ApplicationStatusValue;
  createdAt?: string;
};

export type ApplicationUpdate = Partial<ApplicationCreateInput>;

export type ApplicantUpdate = Partial<Applicant>;
export type ApplicantPreview = Pick<Applicant, "id" | "name" | "role">;
export type PublicApplicant = Omit<Applicant, "email" | "isActive">;
export type StatusLabels = Record<string, string>;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
