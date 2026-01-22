Cloud Drive – Full Stack File Management System ----------------------------

Cloud Drive is a full-stack, Google Drive–like file management application built with Next.js, Supabase, and PostgreSQL.
It allows authenticated users to securely upload, organize, manage, and recover files using a modern, scalable architecture.

Tech Stack----------------------------------------
Frontend

Next.js (App Router)

React

TypeScript

Tailwind CSS

Backend / Infrastructure------------------------------------

Supabase

PostgreSQL Database

Authentication

Storage Buckets

Row Level Security (RLS)

Features--------------------------------------------

Authentication & Security-----

Email and password authentication

Email verification support

Protected routes using Next.js middleware

Session-based access control

Row Level Security (RLS) for data isolation

Secure file access using signed URLs

File Management-------------------------------------------

Upload files to Supabase Storage

Store file metadata in PostgreSQL

Secure file preview and download

Rename files

Move files between folders

Drag-and-drop file movement

File size display

Search files by name

Folder Management------------------------------------

Create folders

Nested folder hierarchy

Rename folders

Move folders between directories

Drag-and-drop folder organization

Breadcrumb navigation

Back navigation support

Search folders by name

Trash System------------------------------------------------

Soft delete (move to trash)

Dedicated Trash page

Restore files from trash

Permanently delete files

Confirmation for destructive actions

UI / UX-----------------------------------------------------

Sticky header with search bar

Responsive grid layout

Loading states

Empty state messages

Clean, minimal design

Optimized rendering with memoization

Advanced Functionality ----------------------------------------

Drag-and-drop for files and folders

Root-level drop zone

Breadcrumb path reconstruction

Client-side search filtering

Component-based architecture

Real-time UI refresh after actions

Project Structure-------------------------------------------------------------------------
app/
 ├── page.tsx              # Main Drive UI
 ├── login/                # Authentication page
 ├── trash/                # Trash page
 ├── components/
 │    ├── Header.tsx
 │    ├── FileUpload.tsx
 │    ├── FileList.tsx
 │    ├── CreateFolder.tsx
 ├── middleware.ts         # Route protection
lib/
 ├── supabaseClient.ts     # Supabase client configuration

Database Schema-----------------------------------------------------------------------
files--------------

id

name

size_bytes

storage_key

folder_id

user_id

is_trashed

created_at

folders---------------

id

name

parent_id

user_id

is_trashed

created_at

Security Model

Users can access only their own files and folders

RLS policies enforce data isolation

Storage access is scoped per user

Public access is disabled by default

Local Development---------------------------------------------------------------

Clone the repository

Install dependencies

npm install


Create .env.local

NEXT_PUBLIC_SUPABASE_URL=https://lujjrqsspmzamrskhemc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_z1imM8g_iJfCYzxYB6NE-g_N8Yptjde


Run the development server

npm run dev

Deployment-----------------------------------------------------

Recommended setup:

Frontend: Vercel

live link : 

Backend: Supabase

Deployment steps:----------

Push code to GitHub

Connect repository to Vercel

Add environment variables in Vercel

Deploy

Project Status

Feature complete

Production-ready

Secure authentication and storage

Scalable database design

Clean and maintainable codebase

Future Enhancements----------------------------------------------------------------

File sharing with permissions

Public/private share links

Activity logs

File versioning

Bulk actions

Storage analytics

Dark mode

License---------------------------------------------------------

MIT License
