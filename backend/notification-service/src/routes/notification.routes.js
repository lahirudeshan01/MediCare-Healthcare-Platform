const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");

router.get("/unread-count", notificationController.getUnreadCount);
router.get("/", notificationController.getNotifications);
router.post("/", notificationController.createNotification);
router.patch("/mark-all-read", notificationController.markAllNotificationsRead);
router.patch("/:id/read", notificationController.markNotificationRead);

module.exports = router;
