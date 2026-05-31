README.md
# Insurance Approval Monitoring System

A full-stack internal web application for monitoring insurance approval submissions in hospitals.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **UI Components**: Custom built with Radix UI primitives
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Date Handling**: Day.js

## Features

- Dashboard with analytics and monitoring
- Master data management (patients, rooms, payers)
- Submission tracking and approval workflow
- Pending records monitoring
- Comprehensive audit logging system with user tracking
- Secure API authentication using Supabase sessions
- Responsive admin interface

## Security & Authentication

- **Secure API Routes**: All API routes require valid Supabase authentication sessions
- **Audit Trail**: Every operation is logged with the actual authenticated user's email
- **Session Management**: Automatic session handling via Supabase SSR integration
- **Frontend Security**: All API calls include credentials to maintain authentication context

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd insurance-approval-monitoring
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment variables file and update the values:
```bash
cp .env.example .env.local
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma db seed
```

5. Run the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes with authentication
│   ├── dashboard/         # Dashboard page
│   ├── patients/          # Patient management
│   ├── rooms/             # Room management
│   ├── payers/            # Payer management
│   ├── submissions/       # Submission management
│   ├── pending/           # Pending monitoring
│   ├── audit/             # Audit logs
│   └── login/             # Login page
├── components/            # Reusable UI components
│   └── ui/               # Base UI components
├── lib/                   # Utility functions
│   ├── authUtils.ts       # Authentication utilities
│   └── supabase/         # Supabase client setup
├── services/              # Business logic layers with audit support
│   └── repositories/     # Data access layer
├── prisma/                # Database schema and migrations
└── public/                # Static assets
```

## Database Schema

The application uses the following tables:

- `patients`: Patient information
- `rooms`: Hospital room information
- `payers`: Insurance providers
- `submissions`: Insurance submission headers
- `submission_details`: Details within a submission
- `pending_histories`: Pending records for submission details
- `audit_logs`: System activity logs with user tracking

## API Endpoints

### Authentication & Security
All API endpoints require valid authentication and automatically log operations with the authenticated user's email.

- `GET /api/patients` - Get all patients (requires auth)
- `POST /api/patients` - Create a patient (requires auth, logged with user)
- `PUT /api/patients/[id]` - Update a patient (requires auth, logged with user)
- `DELETE /api/patients/[id]` - Delete a patient (requires auth, logged with user)

- `GET /api/rooms` - Get all rooms (requires auth)
- `POST /api/rooms` - Create a room (requires auth, logged with user)
- `PUT /api/rooms/[id]` - Update a room (requires auth, logged with user)
- `DELETE /api/rooms/[id]` - Delete a room (requires auth, logged with user)

- `GET /api/payers` - Get all payers (requires auth)
- `POST /api/payers` - Create a payer (requires auth, logged with user)
- `PUT /api/payers/[id]` - Update a payer (requires auth, logged with user)
- `DELETE /api/payers/[id]` - Delete a payer (requires auth, logged with user)

- `GET /api/submissions` - Get all submissions (requires auth)
- `POST /api/submissions` - Create a submission (requires auth, logged with user)
- `PUT /api/submissions/[id]` - Update a submission (requires auth, logged with user)
- `DELETE /api/submissions/[id]` - Delete a submission (requires auth, logged with user)

- `GET /api/audit` - Get audit logs (requires auth)

## Authentication Flow

1. User authenticates via Supabase Auth
2. Session tokens are stored in cookies
3. Frontend API calls include `credentials: 'include'` to send cookies
4. Backend API routes extract user from session using Supabase client
5. User email is passed to service methods for audit logging
6. All operations are recorded in audit logs with user identity

## Deployment

This application is designed for deployment on Vercel:

1. Push your code to a Git repository
2. Import the project in Vercel
3. Add your environment variables
4. Deploy!

Make sure to set the following environment variables in your deployment:
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.