import express from 'express';
import { Notifications } from '../controllers';
import { AuthenticateUser } from '../middlewares';
import validateToggleNotification from '../validations/toggle-notification';

const notificationRoutes = express.Router();

// Get all offline comment notification for a user
notificationRoutes.get('/users/notifications',
  AuthenticateUser.verifyUser,
  AuthenticateUser.verifyActiveUser,
  Notifications.fetchAllNotifications);


// Subscribe and unsubscribe notification for a user
notificationRoutes.patch('/users/notification',
  AuthenticateUser.verifyUser,
  AuthenticateUser.verifyActiveUser,
  validateToggleNotification,
  Notifications.toggleNotification);


export default notificationRoutes;
