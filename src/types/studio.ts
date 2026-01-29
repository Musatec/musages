
import { Database } from "@/types/supabase";

export type Project = Database['public']['Tables']['projects']['Row'];

export type CategoryId = "idea" | "link" | "image" | "prompt" | "tip";

export interface CategoryConfig {
    id: CategoryId;
    label: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    color: string;
    ring: string;
}
