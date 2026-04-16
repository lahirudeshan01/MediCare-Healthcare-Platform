# Backend (Pinithi scope only)

This backend folder contains **only** the assigned services:
- doctor-service (3.3)
- telemedicine-service (3.6)

## 1) Doctor Service
Port: `8083`

### Responsibilities covered
- Doctor registration
- Set availability
- Accept or reject appointments
- Issue digital prescriptions

### APIs
- `POST /doctors`
- `PUT /doctors/:id/availability`
- `POST /appointments/:id/accept` (body `action: "accept" | "reject"`)
- `POST /prescriptions`
- `GET /health`

### DB tables (SQLite)
- `doctors`
- `availability_slots`
- `appointments`
- `prescriptions`

## 2) Telemedicine Service
Port: `8087`

### Responsibilities covered
- Generate meeting room (Jitsi)
- Send link to doctor + patient (simulated delivery log)
- Join via web URL

### APIs
- `POST /telemedicine/sessions`
- `GET /telemedicine/sessions/:appointmentId`
- `GET /telemedicine/sessions/:appointmentId/delivery-log`
- `GET /health`

### DB tables (SQLite)
- `telemedicine_sessions`
- `delivery_log`

## Local run (without Docker)
Open two terminals:

Doctor service:
```bash
cd backend/doctor-service
npm install
npm start
```

Telemedicine service:
```bash
cd backend/telemedicine-service
npm install
npm start
```

## Docker run
```bash
cd backend
docker compose up --build
```

## Kubernetes run (your 2 services only)

Build local images first:
```bash
cd backend
docker build -t doctor-service:latest ./doctor-service
docker build -t telemedicine-service:latest ./telemedicine-service
```

Apply manifests:
```bash
kubectl apply -f k8s/doctor-deployment.yaml
kubectl apply -f k8s/doctor-service.yaml
kubectl apply -f k8s/telemedicine-deployment.yaml
kubectl apply -f k8s/telemedicine-service.yaml
```

Check rollout:
```bash
kubectl get deployments
kubectl get services
kubectl get pods
```

## Sample request bodies

### Create doctor
```json
{
  "fullName": "Dr. Pinithi Perera",
  "email": "pinithi@example.com",
  "specialty": "Cardiology",
  "qualifications": "MBBS, MD",
  "experienceYears": 7
}
```

### Set availability
```json
{
  "slots": [
    {
      "dayOfWeek": "MONDAY",
      "startTime": "09:00",
      "endTime": "11:00",
      "isAvailable": true
    },
    {
      "dayOfWeek": "WEDNESDAY",
      "startTime": "14:00",
      "endTime": "16:00"
    }
  ]
}
```

### Accept appointment
```json
{
  "doctorId": 1,
  "patientId": 15,
  "action": "accept"
}
```

### Issue prescription
```json
{
  "appointmentId": 1001,
  "doctorId": 1,
  "patientId": 15,
  "diagnosis": "Mild bronchitis",
  "medication": "Amoxicillin",
  "dosage": "500mg twice daily",
  "instructions": "After meals for 5 days"
}
```

### Create telemedicine session
```json
{
  "appointmentId": 1001,
  "doctorId": 1,
  "patientId": 15
}
```
