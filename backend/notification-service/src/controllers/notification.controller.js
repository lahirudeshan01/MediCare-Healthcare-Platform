const Notification = require("../models/Notification");

exports.createNotification = async (req, res) => {
  try {
    const {
      userId,
      appointmentId = null,
      type = "general",
      title,
      message,
      source = "system",
      metadata = {},
    } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        message: "userId, title, and message are required",
      });
    }

    const notification = await Notification.create({
      userId,
      appointmentId,
      type,
      title,
      message,
      source,
      metadata,
    });

    return res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { userId, unreadOnly, limit } = req.query;
    const parsedLimit = Number.parseInt(limit, 10);
    const cappedLimit = Number.isNaN(parsedLimit)
      ? 100
      : Math.min(Math.max(parsedLimit, 1), 500);
    const filter = {};

    if (userId) {
      filter.userId = userId;
    }

    if (unreadOnly === "true") {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(cappedLimit);

    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error getting notifications:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return res.status(200).json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
    );

    return res.status(200).json({
      message: "Notifications marked as read",
      modifiedCount: result.modifiedCount || 0,
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const count = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    return res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error("Error getting unread count:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
