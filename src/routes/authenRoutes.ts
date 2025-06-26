/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           minLength: 6
 *           maxLength: 15
 *           description: User's unique username
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           minLength: 6
 *           description: User's password
 *     UserResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: User's unique identifier
 *         username:
 *           type: string
 *           description: User's username
 *         email:
 *           type: string
 *           description: User's email
 *         isEmailVerified:
 *           type: boolean
 *           description: Whether the user's email is verified
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *     TokenResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT authentication token
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         msg:
 *           type: string
 *           description: Error message
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of validation error messages
 *     EmailRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - token
 *         - newPassword
 *       properties:
 *         token:
 *           type: string
 *           description: Password reset token
 *         newPassword:
 *           type: string
 *           minLength: 6
 *           description: New password
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           example:
 *             username: "john_doe"
 *             email: "john@example.com"
 *             password: "password123"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "User registered successfully. Please check your email to verify your account."
 *                 emailSent:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     summary: Verify user email
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *         example: "abc123def456ghi789jkl012mno345pq"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Email verified successfully. You can now log in."
 *       400:
 *         description: Invalid or expired verification token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Resend email verification
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailRequest'
 *           example:
 *             email: "john@example.com"
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Verification email sent successfully"
 *       400:
 *         description: Email already verified
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "john@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         description: Invalid credentials or email not verified
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     msg:
 *                       type: string
 *                       example: "Please verify your email before logging in"
 *                     emailVerified:
 *                       type: boolean
 *                       example: false
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/auth/request-password-reset:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailRequest'
 *           example:
 *             email: "john@example.com"
 *     responses:
 *       200:
 *         description: Password reset email sent (if user exists)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "If a user with that email exists, a password reset link has been sent."
 *                 emailSent:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: Server error or failed to send email
 */

/**
 * @swagger
 * /api/auth/verify-reset-token:
 *   get:
 *     summary: Verify password reset token
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token
 *         example: "def456ghi789jkl012mno345pqr678st"
 *     responses:
 *       200:
 *         description: Reset token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Reset token is valid"
 *                 valid:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid or expired reset token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Invalid or expired password reset token"
 *                 valid:
 *                   type: boolean
 *                   example: false
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *           example:
 *             token: "def456ghi789jkl012mno345pqr678st"
 *             newPassword: "newpassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Password has been reset successfully. You can now log in with your new password."
 *       400:
 *         description: Invalid or expired reset token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 15
 *               email:
 *                 type: string
 *                 format: email
 *           example:
 *             username: "john_doe_updated"
 *             email: "john.updated@example.com"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

import { Router } from 'express';
import { register, login, verifyEmail, resendVerificationEmail } from '../controllers/authencontroller';
import { requestPasswordReset, resetPassword, verifyResetToken } from '../controllers/passwordResetController';
import { getProfile, updateProfile, } from '../controllers/userController';
import { authenMiddleware } from '../middleware/authenMiddleware';
import { validateBody } from '../middleware/validate';
import { registerSchema, loginSchema, emailSchema, resetPasswordSchema } from '../utils/validator';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', validateBody(emailSchema), resendVerificationEmail);
router.post('/login', validateBody(loginSchema), login);

router.post('/request-password-reset', validateBody(emailSchema), requestPasswordReset);
router.get('/verify-reset-token', verifyResetToken);
router.post('/reset-password', validateBody(resetPasswordSchema), resetPassword);

router.get('/profile', authenMiddleware, getProfile);
router.put('/profile', authenMiddleware, updateProfile);

export default router