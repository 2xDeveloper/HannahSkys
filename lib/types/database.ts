export type UserRole = "user" | "creator" | "admin";
export type CreatorStatus = "pending" | "approved" | "rejected";
export type AccountType = "user" | "creator";

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  instagram_handle: string | null;
  id_document_path: string | null;
  role: UserRole;
  creator_status: CreatorStatus;
  created_at: string;
  updated_at: string;
};

export function isApprovedCreator(profile: Profile): boolean {
  return profile.role === "creator" && profile.creator_status === "approved";
}

export function creatorStatusLabel(status: CreatorStatus): string {
  switch (status) {
    case "pending":
      return "Pending approval";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
  }
}
