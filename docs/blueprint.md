# **App Name**: BioMedLink

## Core Features:

- User Authentication & Authorization: Secure user login, logout, and registration with role-based access control (Admin, Biomedical Engineer, Technician) using Supabase Auth.
- Department Management: Create, view, update, and delete hospital departments (e.g., ICU, Radiology), organizing equipment within their respective locations.
- Equipment Inventory Management: Comprehensive CRUD for equipment records including detailed specifications (serial, model, manufacturer), images, manuals, and current status. Identifies equipment by serial and model numbers for precise tracking.
- AI Troubleshooting Assistant: An AI-powered tool where engineers can input equipment problems, symptoms, or error codes to receive step-by-step diagnostic and repair guidance. It leverages RAG with equipment manuals, history, and fault logs to generate context-aware recommendations and stores all troubleshooting conversations.
- Preventive Maintenance Scheduling: Log service activities, replaced parts, and notes. The system automatically calculates and displays the next service date, tracks overdue equipment, and manages upcoming maintenance schedules.
- Equipment History Tracking: Maintain a complete history for each equipment, detailing faults, repairs, downtime, service logs, engineers involved, and AI troubleshooting sessions.
- Advanced Search & Filtering: Efficiently search and filter equipment by key attributes such as serial number, department, manufacturer, model number, and operational status.

## Style Guidelines:

- Color scheme: A light theme that emphasizes professionalism, technology, and health. Primary actions and brand elements will use a calming, sophisticated blue-cyan (`#1F7EAD`).
- Background color: A very subtle, cool-toned off-white (`#E6ECEE`) to ensure readability and a clean interface.
- Accent color: A fresh aqua-green (`#62C9BB`) will be used for interactive elements, highlights, and status indicators, providing a gentle contrast.
- Headline font: 'Space Grotesk' (sans-serif) to convey a modern, technical, and precise feel, reflecting the biomedical engineering domain.
- Body text font: 'Inter' (sans-serif) for its high legibility and neutral, objective appearance, ensuring data-heavy content is easily digestible across all interface elements.
- Use clean, minimalist SVG icons with a flat or line-art style, relevant to medical equipment, technology, and management functions. Icons should maintain a consistent stroke weight and style.
- The layout will feature modern dashboards, clear data cards, responsive tables for equipment listings, and well-structured forms. Utilize Tailwind CSS and shadcn/ui components for a consistent and accessible design across various screen sizes.
- Incorporate subtle animations for UI feedback, such as smooth transitions for modal windows, loading states, and form submissions, to enhance the user experience without being distracting.