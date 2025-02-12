# Sales Professional Platform

A comprehensive professional networking and job matching platform designed to connect sales professionals with companies through intelligent matching, detailed profile management, and an enhanced application tracking system.

## Tech Stack

### Frontend
- React.js with TypeScript
- TanStack Query for data fetching
- Shadcn UI components
- Tailwind CSS for styling
- React Hook Form for form management
- Zod for validation

### Backend
- Express.js with TypeScript
- PostgreSQL database
- Drizzle ORM
- Session-based authentication
- Multer for file uploads

## Database Schema

The application uses PostgreSQL with the following main tables:

```sql
users - Stores user authentication details
- id (Primary Key)
- username 
- password (hashed)
- role (enum: 'sales', 'company')

profiles - Stores detailed user profiles
- id (Primary Key)
- userId (Foreign Key)
- headline
- summary
- experience (JSON)
- education (JSON)
- skills (JSON)
- achievements (JSON)
- profilePicture
- website
- industry
- companySize
- foundedYear

jobs - Stores job listings
- id (Primary Key)
- title
- description
- requirements
- companyId (Foreign Key)
- location
- salary
- status

applications - Tracks job applications
- id (Primary Key)
- jobId (Foreign Key)
- salesId (Foreign Key)
- status
- appliedAt
```

## Local Development Setup

1. **Prerequisites**
   ```bash
   - Node.js (v18 or higher)
   - PostgreSQL
   ```

2. **Clone the Repository**
   ```bash
   git clone https://github.com/ayushchaurey/sales-professional-platform.git
   cd sales-professional-platform
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/sales_platform
   SESSION_SECRET=your_session_secret
   ```

5. **Database Setup**
   ```bash
   npm run db:push
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```
   Access the application at `http://localhost:5000`

## AWS Deployment

1. **Prerequisites**
   - AWS Account
   - AWS CLI configured

2. **Database Setup**
   - Create an RDS PostgreSQL instance
   - Update security groups to allow inbound traffic
   - Note down the database connection URL

3. **EC2 Setup**
   ```bash
   # Connect to EC2 instance
   ssh -i key.pem ec2-user@your-instance-ip

   # Install Node.js
   curl -sL https://rpm.nodesource.com/setup_18.x | sudo -E bash -
   sudo yum install -y nodejs

   # Clone repository
   git clone https://github.com/ayushchaurey/sales-professional-platform.git
   cd sales-professional-platform

   # Install dependencies
   npm install

   # Setup environment variables
   echo "DATABASE_URL=your_rds_url" > .env
   echo "SESSION_SECRET=your_session_secret" >> .env

   # Build and start
   npm run build
   npm start
   ```

4. **Configure Nginx (Optional)**
   ```nginx
   server {
       listen 80;
       server_name your_domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## API Documentation

### Authentication Endpoints

```
POST /api/auth/register
- Register new user
- Body: { username, password, role }

POST /api/auth/login
- Login user
- Body: { username, password }

GET /api/auth/logout
- Logout current user
```

### Profile Endpoints

```
GET /api/profiles/:id
- Get user profile

POST /api/profiles
- Create user profile
- Body: FormData with profile fields and optional profile picture

PATCH /api/profiles
- Update user profile
- Body: FormData with updated profile fields
```

### Job Endpoints

```
GET /api/jobs
- List all jobs

POST /api/jobs
- Create new job listing
- Body: { title, description, requirements, location, salary }

GET /api/jobs/:id
- Get specific job details
```

### Application Endpoints

```
GET /api/applications
- List user's applications

POST /api/applications
- Submit job application
- Body: { jobId }

PATCH /api/applications/:id
- Update application status
- Body: { status }
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
