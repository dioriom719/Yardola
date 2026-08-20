import type { VerificationStatus } from "@/types/enums";
import type { ProjectCardData } from "@/types/project";

export interface BusinessCardData {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  verificationStatus: VerificationStatus;
  city: string | null;
  state: string | null;
  categoryNames: string[];
  projectCount: number;
  previewPhotoUrls: string[];
}

export interface Professional {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  photoUrl: string | null;
}

export interface BusinessDetail {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  website: string | null;
  phone: string | null;
  logoUrl: string | null;
  city: string | null;
  state: string | null;
  verificationStatus: VerificationStatus;
  profile: {
    tagline: string | null;
    about: string | null;
    yearEstablished: number | null;
    highlights: string[];
  } | null;
  services: { name: string; slug: string; categoryName: string }[];
  serviceAreaCityNames: string[];
  professionals: Professional[];
  projects: ProjectCardData[];
}
