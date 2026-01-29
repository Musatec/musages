
import { Database } from "@/types/supabase";

export type Book = Database['public']['Tables']['books']['Row'] & {
    chapters?: { count: number }[];
};

export type Chapter = Database['public']['Tables']['chapters']['Row'];
