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
- Audit logging system
- Responsive admin interface

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
│   ├── api/               # API routes
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
│   └── supabase/         # Supabase client setup
├── services/              # Business logic layers
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
- `audit_logs`: System activity logs

## API Endpoints

- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create a patient
- `PUT /api/patients/[id]` - Update a patient
- `DELETE /api/patients/[id]` - Delete a patient

- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create a room
- `PUT /api/rooms/[id]` - Update a room
- `DELETE /api/rooms/[id]` - Delete a room

- `GET /api/payers` - Get all payers
- `POST /api/payers` - Create a payer
- `PUT /api/payers/[id]` - Update a payer
- `DELETE /api/payers/[id]` - Delete a payer

- `GET /api/submissions` - Get all submissions
- `POST /api/submissions` - Create a submission
- `PUT /api/submissions/[id]` - Update a submission
- `DELETE /api/submissions/[id]` - Delete a submission

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