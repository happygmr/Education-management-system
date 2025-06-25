const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const winston  = require("winston");
require("dotenv").config();
const Role = require('./role.model');
const User = require('./user.model');
const Student = require('./student.model');
const Guardian = require('./guardian.model');
const Class = require('./class.model');
const Subject = require('./subject.model');
const Teacher = require('./teacher.model');
const ClassSubject = require('./classSubject.model');
const Attendance = require('./attendance.model');
const Assessment = require('./assessment.model');
const Grade = require('./grade.model');
const GradeScale = require('./gradeScale.model');
const FeeCategory = require('./feeCategory.model');
const Invoice = require('./invoice.model');
const Payment = require('./payment.model');
const Message = require('./message.model');
const Bus = require('./bus.model');
const BusAssignment = require('./busAssignment.model');
const Hostel = require('./hostel.model');
const RoomAssignment = require('./roomAssignment.model');
const ActivityLog = require('./activityLog.model');
const ReportCard = require('./reportCard.model');

// Import routes
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const teacherRoutes = require('./routes/teacher.routes');
const classRoutes = require('./routes/class.routes');
const subjectRoutes = require('./routes/subject.routes');
const assessmentRoutes = require('./routes/assessment.routes');
const gradeRoutes = require('./routes/grade.routes');
const paymentRoutes = require('./routes/payment.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const reportCardRoutes = require('./routes/reportCard.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const activityLogRoutes = require('./routes/activityLog.routes');

const app = express();

app.use(cors({
  origin: true, // Allow all origins
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static("public"));

// Winston logger configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

// If not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

// Utility function to format uptime
function formatuptime(seconds) {
    const pad = (s) => (s < 10 ? '0' + s : s);
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/education-management", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("Connected to MongoDB");
})
.catch((err) => {
    console.error("Failed to connect to MongoDB", err);
});

app.use(
    morgan(":method :url :status :response-time ms - :res[content-length]")
);

// Custom API Logger Middleware
const apiLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const { method, path, params, query } = req;
        const { statusCode } = res;
        const body = req.method !== 'GET' ? req.body : undefined;

        logger.info(JSON.stringify({
            method,
            path,
            status: statusCode,
            duration: `${duration}ms`,
            params,
            query,
            body
        }));
    });
    next();
};

// Apply API Logger
app.use(apiLogger);

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/report-cards', reportCardRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/activity-logs', activityLogRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    const mongoState = mongoose.connection.readyState;
    const mongoStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({
        status: 'ok',
        uptime: formatuptime(process.uptime()),
        currentTime: new Date().toISOString(),
        mongo: {
            state: mongoStates[mongoState] || 'unknown',
            host: mongoose.connection.host,
            name: mongoose.connection.name
        }
    });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    const { method, path, params, query } = req;
    const statusCode = res.statusCode || 500;
    const body = req.method !== 'GET' ? req.body : undefined;
    
    logger.error(JSON.stringify({
        message: err.message,
        method,
        path,
        status: statusCode,
        params,
        query,
        body,
        stack: err.stack
    }));

    res.status(statusCode !== 200 ? statusCode : 500).json({
        error: err.message || 'Internal Server Error'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    logger.info(`Server started on port ${PORT}`);
});

