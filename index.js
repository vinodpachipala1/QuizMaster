import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import crypto from "crypto";

import createTables from "./models/createTables.js";
import userModel from "./models/userModel.js";
import companyModel from "./models/companyModel.js";
import jobModel from "./models/jobModel.js";
import applicationModel from "./models/applicationModel.js";
import candidateProfileModel from "./models/candidateProfileModel.js";
import otpModel from "./models/otpModel.js";
import { sendEmail } from "./config/mailer.js";

const port = 3001;
const app = express();
dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });

// Initialize database tables
createTables();
const Frontend_url =  "https://job-board-tau-three.vercel.app"
//  ||
app.use(cors({
  origin: Frontend_url || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.set("trust proxy", 1);

const saltrounds = 10;

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Not logged in" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid or expired token" });
        req.user = user;
        next();
    });
};

// Helper function for resume URLs
const addResumeUrls = (applications, req) => {
    return applications.map(app => {
        if (app.resume_filename && app.resume_file) {
            const downloadUrl = `${req.protocol}://${req.get('host')}/downloadResume/${app.id}`;
            return {
                ...app,
                resumeUrl: downloadUrl,
                hasResume: true
            };
        }
        return {
            ...app,
            resumeUrl: null,
            hasResume: false
        };
    });
};

// ============ AUTHENTICATION ROUTES ============
app.post("/register", async (req, res) => {
    const { fname, lname, email, password, confirmPassword, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, saltrounds);
        const user = await userModel.createUser(email.toLowerCase(), fname, lname, hashedPassword, role);
        res.json({ message: "Registration successful", user: { id: user.id, email: user.email } });
    } catch (err) {
        console.log(err);
        if (err.code === "23505") {
            res.status(500).json({ error: "Email Already Exist!" });
        } else {
            res.status(500).json({ error: "Server error" });
        }
    }
});

app.post("/send-otp", async (req, res) => {
    try {
        const { email } = req.body;

        const user = await userModel.findUserByEmail(email.toLowerCase());
        if (user) {
            return res.status(401).json({ msg: "Email already exists" });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

        await otpModel.upsertOtp(email.toLowerCase(), otp, expiresAt);

        await sendEmail(
            email,
            "Your OTP Code - JobBoard",
            `
            <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
                <p>Your JobBoard verification code is:</p>
        
                <div style="text-align: center; margin: 25px 0;">
                    <div style="font-size: 28px; font-weight: bold; color: #0ea5e9; letter-spacing: 6px;">
                        ${otp}
                    </div>
                    <p style="color: #ef4444; font-size: 13px; margin: 8px 0 0 0;">
                        Expires in 5 minutes
                    </p>
                </div>
        
                <p style="color: #64748b; font-size: 12px;">
                    If you didn't request this, please disregard this email.
                </p>
            </div>
            `
        );

        res.json({ msg: "OTP sent successfully" });
    } catch (err) {
        console.error("Error sending OTP:", err);
        res.status(500).json({ msg: "Failed to send OTP" });
    }
});


// Verify OTP
app.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Get OTP record from DB
        const record = await otpModel.findOtpByEmail(email.toLowerCase());
        if (!record) return res.status(400).json({ msg: "OTP not found" });

        const { otp: storedOtp, expires_at } = record;

        if (new Date() > expires_at) return res.status(400).json({ msg: "OTP expired" });
        if (otp !== storedOtp) return res.status(400).json({ msg: "Invalid OTP" });

        // Delete OTP after successful verification
        await otpModel.deleteOtp(email.toLowerCase());

        res.json({ msg: "OTP verified successfully" });
    } catch (err) {
        console.error("Error verifying OTP:", err);
        res.status(500).json({ msg: "Failed to verify OTP" });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findUserByEmail(email.toLowerCase());
        if (!user) { 
            return res.status(404).json({ error: "User Not Found!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid Password" });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.user_type,
                email: email,
                fname: user.first_name,
                lname: user.last_name,
            },
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });
        res.json({ token, user: payload.user });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

app.get("/verify-login", authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// ============ CANDIDATE PROFILE ROUTES ============
app.get("/candidate/profile", authenticateToken, async (req, res) => {
    const userId = req.user.user.id;
    try {
        const profile = await candidateProfileModel.findProfileByUserId(userId);
        res.send({ profile: profile });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/candidate/profile", async (req, res) => {
    const { formData, userId } = req.body;
    const { headline, bio, skills, experience, education, linkedin_url, portfolio_url, github_url } = formData;
    
    try {
        await candidateProfileModel.upsertProfile({
            headline, bio, skills, experience, education, linkedin_url, portfolio_url, github_url
        }, userId);
        res.send({ message: "Profile saved successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to save profile" });
    }
});

// ============ COMPANY ROUTES ============
app.post("/addCompany", async (req, res) => {
    const { name, website, logo_url, description } = req.body.companyprofile;
    const userId = req.body.userId;

    try {
        const company = await companyModel.createCompany(name, description, website, logo_url, userId);
        res.send({ company: company });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/getCompanyDetails", async (req, res) => {
    const userId = req.body.userId;
    try {
        const company = await companyModel.findCompanyByUserId(userId);
        res.send({ company: company });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}); 

app.put("/updateCompany", async (req, res) => {
    const { name, website, logo_url, description } = req.body.companyprofile;
    const userId = req.body.userId;
    
    try {
        const company = await companyModel.updateCompany(name, description, website, logo_url, userId);
        res.send({ company: company });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to update company" });
    }
});

// ============ JOB ROUTES ============
app.post("/CreateNewJob", async (req, res) => {
    const { title, description, requirements, category, job_type, location, salary_range, expires_at } = req.body.jobDetails;
    const userId = req.body.userId;

    try {
        const company = await companyModel.findCompanyByUserId(userId);
        if(!company){
            console.log("hello");
            return res.status(401).send("Please fill company profile first");
        }
        
        const job = await jobModel.createJob({
            title, description, requirements, category, job_type, location, salary_range, expires_at
        }, userId);
        res.send("Success");
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/getEmployerJobs", async (req, res) => {
    const userId = req.body.userId;
    try {
        const jobs = await jobModel.findJobsByEmployer(userId);
        res.send({ jobs: jobs });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch jobs" });
    }
});

app.post("/DeleteJob", async (req, res) => {
    const id = req.body.id;
    try {
        await jobModel.softDeleteJob(id);
        res.send("Successfull");
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to delete job" });
    }
});

app.post("/EditJob", async (req, res) => {
    const { id, title, description, requirements, location, salary_range, job_type, category, expires_at } = req.body;
    
    try {
        await jobModel.updateJob({
            id, title, description, requirements, location, salary_range, job_type, category, expires_at
        });
        res.send("Successfull");
    } catch (err) {
        console.log(err);
        res.status(500).send("Failed");
    }
});

app.get("/jobs", async (req, res) => {
    try {
        const jobs = await jobModel.findAllJobs();
        res.send({ jobs: jobs });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch jobs" });
    }
});

app.post("/getJobDetils", async (req, res) => {
    const id = req.body.id;
    try {
        const job = await jobModel.findJobById(id);
        res.send({ job: job });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch job details" });
    }
});

// ============ APPLICATION ROUTES ============
app.post("/postApplication", upload.single('resume'), async (req, res) => {
    const file = req.file;
    const { jobId, userId, phone_number, cover_letter, portfolio_link, linkedin_url, source } = req.body;

    try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const newFilename = `resume-${userId}-${jobId}-${uniqueSuffix}.pdf`;

        const application = await applicationModel.createApplication(
            { jobId, userId, phone_number, cover_letter, portfolio_link, linkedin_url, source },
            file.buffer,
            newFilename
        );

        const candidate = await userModel.findUserById(userId);
        const Job = await jobModel.findJobById(jobId);

        if (candidate) {
            await sendEmail(
                candidate.email,
                "Application Submitted Successfully",
                `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0;">Application Submitted! 🎉</h1>
                    </div>
            
                    <div style="padding: 20px; background: #f8fafc;">
                        <p>Hi <strong>${candidate.first_name} ${candidate.last_name}</strong>,</p>
                
                        <p>Your application has been submitted successfully for:</p>
                
                        <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #3b82f6;">
                        <p style="margin: 5px 0;"><strong>Job Role:</strong> ${Job.title}</p>
                        <p style="margin: 5px 0;"><strong>Job ID:</strong> ${jobId}</p>
                    </div>
                
                    <p>Track your application status:</p>
                    <a href="${Frontend_url}/candidate/dashboard/applications" 
                        style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;">
                        View Application Status
                    </a>
                
                    <p style="margin-top: 20px;">We'll review your application and get back to you soon.</p>
                
                    <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                        <p>Best regards,<br><strong>The Hiring Team</strong></p>
                    </div>
                </div>
            </div>
            `
        );
    }

        res.json({
            success: true,
            message: "Application submitted successfully",
            applicationId: application.id
        });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: "You have already applied for this job." });
        }
        console.error("Application submission error:", err);
        res.status(500).json({ error: 'Failed to submit application.' });
    }
});

app.post("/getEmployeerApplications", async (req, res) => {
    const jobId = req.body.jobId;
    try {
        const applications = await applicationModel.findApplicationsByJobId(jobId);
        const applicationsWithUrls = addResumeUrls(applications, req);
        res.json({ applications: applicationsWithUrls });
    } catch (err) {
        console.error("Error fetching employer applications:", err);
        res.status(500).json({ error: "Failed to fetch job applications." });
    }
});

app.get("/downloadResume/:applicationId", async (req, res) => {
    const { applicationId } = req.params;
    try {
        const application = await applicationModel.findApplicationById(applicationId);
        
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        if (!application.resume_file) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${application.resume_filename}"`);
        res.setHeader('Content-Length', application.resume_file.length);
        res.send(application.resume_file);

    } catch (err) {
        console.error("Resume view error:", err);
        res.status(500).json({ error: 'Failed to load resume' });
    }
});

app.put("/updateApplicationStatus", async (req, res) => {
    const { application_id, application_status } = req.body;
    try {
        await applicationModel.updateApplicationStatus(application_id, application_status);
        const application = await applicationModel.findApplicationById(application_id);
        const candidate = await userModel.findUserById(application.candidate_id);
        console.log(application)
        if (candidate) {

            await sendEmail(
                candidate.email,
                "Application Status Updated",
                `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                    <p>Hi <strong>${candidate.first_name} ${candidate.last_name}</strong>,</p>
        
                    <p>Your application status has been updated to: <strong>${application_status}</strong></p>
        
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${Frontend_url}/candidate/dashboard/applications" 
                            style="background: #0ea5e9; color: white; padding: 8px 16px; 
                            text-decoration: none; border-radius: 4px; font-size: 14px;">
                            View Application
                        </a>
                    </div>
        
                    <p style="color: #64748b; font-size: 14px;">Best regards,<br>The Hiring Team</p>
                </div>
                `
            );
        }
        res.send("success");
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to update application status" });
    }
});

app.post("/getCandidateApplications", async (req, res) => {
    const userId = req.body.userId;
    try {
        const applications = await applicationModel.findApplicationsByCandidateId(userId);
        const applicationsWithUrls = addResumeUrls(applications, req);
        res.send({ applications: applicationsWithUrls });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch applications" });
    }
});



app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});