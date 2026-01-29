export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            social_groups: {
                Row: {
                    id: string
                    created_at: string
                    name: string
                    color: string | null
                    user_id: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    name: string
                    color?: string | null
                    user_id: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    name?: string
                    color?: string | null
                    user_id?: string
                }
            }
            social_profiles: {
                Row: {
                    id: string
                    created_at: string
                    platform: string
                    url: string | null
                    bio: string | null
                    goal: string | null
                    group_id: string | null
                    user_id: string
                    username: string | null
                    password: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    platform: string
                    url?: string | null
                    bio?: string | null
                    goal?: string | null
                    group_id?: string | null
                    user_id: string
                    username?: string | null
                    password?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    platform?: string
                    url?: string | null
                    bio?: string | null
                    goal?: string | null
                    group_id?: string | null
                    user_id?: string
                    username?: string | null
                    password?: string | null
                }
            }
            posts: {
                Row: {
                    id: string
                    created_at: string
                    title: string
                    content: string | null
                    platform: string
                    scheduled_date: string | null
                    status: string
                    image_url: string | null
                    user_id: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    title: string
                    content?: string | null
                    platform: string
                    scheduled_date?: string | null
                    status?: string
                    image_url?: string | null
                    user_id: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    title?: string
                    content?: string | null
                    platform?: string
                    scheduled_date?: string | null
                    status?: string
                    image_url?: string | null
                    user_id?: string
                }
            }
            resources: {
                Row: {
                    id: string
                    created_at: string
                    title: string
                    description: string | null
                    url: string | null
                    category: string
                    tags: string[] | null
                    user_id: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    title: string
                    description?: string | null
                    url?: string | null
                    category?: string
                    tags?: string[] | null
                    user_id: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    title?: string
                    description?: string | null
                    url?: string | null
                    category?: string
                    tags?: string[] | null
                    user_id?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    created_at: string
                    title: string
                    description: string | null
                    status: string
                    category: string
                    progress: number
                    due_date: string | null
                    user_id: string
                    image_url: string | null
                    is_public: boolean
                }
                Insert: {
                    id?: string
                    created_at?: string
                    title: string
                    description?: string | null
                    status?: string
                    category?: string
                    progress?: number
                    due_date?: string | null
                    user_id: string
                    image_url?: string | null
                    is_public?: boolean
                }
                Update: {
                    id?: string
                    created_at?: string
                    title?: string
                    description?: string | null
                    status?: string
                    category?: string
                    progress?: number
                    due_date?: string | null
                    user_id?: string
                    image_url?: string | null
                    is_public?: boolean
                }
            }
            tasks: {
                Row: {
                    id: string
                    created_at: string
                    title: string
                    status: string
                    priority: string
                    project_id: string | null
                    user_id: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    title: string
                    status?: string
                    priority?: string
                    project_id?: string | null
                    user_id: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    title?: string
                    status?: string
                    priority?: string
                    project_id?: string | null
                    user_id?: string
                }
            }
            notes: {
                Row: {
                    id: string
                    updated_at: string
                    title: string | null
                    content: string | null
                    folder: string
                    folder_id: string | null
                    is_favorite: boolean
                    user_id: string
                }
                Insert: {
                    id?: string
                    updated_at?: string
                    title?: string | null
                    content?: string | null
                    folder?: string
                    folder_id?: string | null
                    is_favorite?: boolean
                    user_id: string
                }
                Update: {
                    id?: string
                    updated_at?: string
                    title?: string | null
                    content?: string | null
                    folder?: string
                    folder_id?: string | null
                    is_favorite?: boolean
                    user_id?: string
                }
            }
            folders: {
                Row: {
                    id: string
                    created_at: string
                    name: string
                    user_id: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    name: string
                    user_id: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    name?: string
                    user_id?: string
                }
            }
            profiles: {
                Row: {
                    id: string
                    username: string | null
                    full_name: string | null
                    avatar_url: string | null
                    bio: string | null
                    updated_at: string
                    created_at: string
                    settings: Json | null
                }
                Insert: {
                    id: string
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    updated_at?: string
                    created_at?: string
                    settings?: Json | null
                }
                Update: {
                    id?: string
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    updated_at?: string
                    created_at?: string
                    settings?: Json | null
                }
            }
            books: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    summary: string | null
                    cover_url: string | null
                    status: string
                    color: string | null
                    created_at: string
                    updated_at: string
                    is_public: boolean
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    summary?: string | null
                    cover_url?: string | null
                    status?: string
                    color?: string | null
                    created_at?: string
                    updated_at?: string
                    is_public?: boolean
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    summary?: string | null
                    cover_url?: string | null
                    status?: string
                    color?: string | null
                    created_at?: string
                    updated_at?: string
                    is_public?: boolean
                }
            }
            chapters: {
                Row: {
                    id: string
                    book_id: string
                    title: string
                    content: string | null
                    order_index: number
                    status: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    book_id: string
                    title: string
                    content?: string | null
                    order_index: number
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    book_id?: string
                    title?: string
                    content?: string | null
                    order_index?: number
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            personal_resources: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    content: string | null
                    type: string
                    category: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    content?: string | null
                    type: string
                    category?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    content?: string | null
                    type?: string
                    category?: string | null
                    created_at?: string
                }
            }
        }
    }
}
