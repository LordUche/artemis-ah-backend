import express from 'express';
import { ArticleController, Comment } from '../controllers';
import createArticleValidation from '../validations/create-article';
import AuthenticateUser from '../middlewares/AuthenticateUser';

const router = express.Router();

const controller = new ArticleController();

router.post('/articles',
  AuthenticateUser.verifyUser, // User must be logged in first
  createArticleValidation, // Validate user input
  controller.create.bind(controller));
router.post('/articles/:slug/comment', AuthenticateUser.verifyUser, Comment.postComment);

router.get('/articles/tags',
  controller.getTags.bind(controller));
router.get('/articles', controller.getAll.bind(controller));

export default router;
