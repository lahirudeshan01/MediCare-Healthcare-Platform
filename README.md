# Building an AI-Enabled Smart Healthcare Appointment & Telemedicine Platform

> Microservices-based cloud-native healthcare platform

## Project Overview
This project is a group assignment (3 to 4 members) worth 25% of the final grade. The goal is to build a cloud-native telemedicine platform similar to Channeling.lk, oDoc, or mHealth. The system enables patients to book doctor appointments, attend video consultations, upload medical reports, and receive AI-based preliminary health suggestions.

## Key Features (Requirements)
### Web/Mobile Interface
- Responsive web/mobile interface to browse doctors, book appointments, and attend video consultations.
- User-friendly design that supports multiple device types.

### Patient Management Service
- Patient registration and profile management.
- Upload medical reports/documents.
- View medical history and past prescriptions.

### Doctor Management Service
- Doctor profile management.
- Availability scheduling.
- Conduct video consultations.
- Issue digital prescriptions.

### Appointment Service
- Search doctors by specialty.
- Book, modify, or cancel appointments.
- Track appointment status in real time.

### Telemedicine Service (Video Integration)
- Secure real-time video consultations.
- Integrate third-party video/conferencing APIs (Agora, Twilio, or Jitsi Meet).

### Payment Service
- Secure payment gateway integration for consultation fees.
- Supported providers: PayHere, Dialog Genie, FriMi, or Stripe/PayPal (sandbox).

### Notification Service
- SMS and email notifications on successful booking and consultation completion.
- Use third-party SMS and email providers.

### AI Symptom Checker Service (Optional)
- Patients enter symptoms to receive preliminary health suggestions.
- Recommend suitable doctor specialties using AI/ML API or model.

## User Roles
### Patient
- Register and manage profile.
- Browse doctors and book appointments.
- Upload reports and view prescriptions.
- Attend video consultations.

### Doctor
- Manage profile and availability.
- Accept or reject appointments.
- Conduct telemedicine sessions.
- Issue digital prescriptions and view patient reports.

### Admin
- Manage user accounts.
- Verify doctor registrations.
- Oversee platform operations and financial transactions.

## Architecture and Implementation Requirements
- Use a Microservices architecture.
- Expose RESTful APIs for all services.
- Use Docker and Kubernetes for containerization and orchestration.
- Ensure scalability, security, and performance.
- Build an asynchronous web client using a JS framework (Angular, React, etc.) or jQuery + AJAX.
- Implement authentication and role-based access control for Patient, Doctor, and Admin.

## Suggested Microservices
- API Gateway
- Auth Service
- Patient Service
- Doctor Service
- Appointment Service
- Telemedicine Service
- Payment Service
- Notification Service
- (Optional) AI Symptom Checker Service

## Notes
- You may add extra features beyond the given requirements.
- Any alternative microservices orchestration tools must be justified in the report and viva.

## Status
- This README captures the assignment scope and requirements. Add setup, build, and run instructions once the project structure is finalized.
