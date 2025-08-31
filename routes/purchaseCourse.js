import express from "express";
import { createCheckoutSession, getAllPurchasedCourse, getCourseDetailwithPurchaseStatus, stripeWebhook } from "../controllers/coursePurchase.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
const router = express.Router();

router.post("/", express.raw({ type: "application/json" }), stripeWebhook);
router.post("/checkout/create-checkout-session",isAuthenticated,createCheckoutSession);
router.get("/course/:courseId/detail-with-status",isAuthenticated,getCourseDetailwithPurchaseStatus); 
router.get("/",isAuthenticated, getAllPurchasedCourse);


export default router;