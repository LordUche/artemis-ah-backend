import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import sendGrid from '@sendgrid/mail';
import readingTime from 'reading-time';
import Pusher from 'pusher';

dotenv.config();

const secretKey = process.env.SECRET_KEY;

/**
 * @class HelperUtils
 * @description Specifies reusable helper methods
 * @exports HelperUtils
 */
class HelperUtils {
  /**
   * @method generateToken
   * @description Generate a token from a given payload
   * @param {object} payload The user payload to tokenize
   * @returns {string} JSON Web Token
   */
  static generateToken(payload) {
    return jwt.sign(payload, secretKey);
  }

  /**
   * @method timedToken
   * @description Generate a token with timer
   * @param {object} hash encrypted data
   * @param {object} time
   * @returns {string} Token
   */
  static timedToken(hash, time) {
    return jwt.sign({
      hash
    }, secretKey, { expiresIn: time });
  }

  /**
   * @method verifyToken
   * @description Verifies a token and decodes it to its subsequent payload
   * @param {string} token The token to decode
   * @returns {object} The resulting payload
   */
  static verifyToken(token) {
    try {
      const payload = jwt.verify(token, secretKey);
      return payload;
    } catch (error) {
      return false;
    }
  }

  /**
   * @method hashPassword
   * @description Hashes a users password
   * @param {string} password The users password
   * @returns {string} The resulting hashed password
   */
  static hashPassword(password) {
    const hash = bcrypt.hashSync(password, 8);
    return hash;
  }

  /**
   * @method comparePassword
   * @description Hashes a users password
   * @param {string} passwordOrEmail The users password/email
   * @param {string} hash The users hashed password/email
   * @returns {string} The resulting hashed password
   */
  static comparePasswordOrEmail(passwordOrEmail, hash) {
    const isPassword = bcrypt.compareSync(passwordOrEmail, hash);
    return isPassword;
  }

  /**
   * @description Method that sends emails
   * @param {string} email
   * @param {string} from
   * @param {string} subject
   * @param {string} text
   * @param {string} htmlMarkup
   * @return {undefined}
   */
  static sendMail(email, from, subject, text, htmlMarkup) {
    sendGrid.setApiKey(process.env.SENDGRID_API_KEY);
    const message = {
      to: email,
      from,
      subject,
      text,
      html: htmlMarkup
    };
    return sendGrid.send(message);
  }

  /**
   * @description Method that estimates the reading time for an article
   * @param {string} articleBody
   * @return {object} estimatedTime
   */
  static estimateReadingTime(articleBody) {
    const estimatedTime = readingTime(articleBody);
    if (estimatedTime.minutes < 1) {
      estimatedTime.text = '< 1 min read';
      return estimatedTime;
    }
    return estimatedTime;
  }

  /**
   * @method calcArticleRating
   * @description Method that calculates new article rating
   * @param {number} currentRatingNo
   * @param {number} currentRating
   * @param {number} newRating
   * @return {number} The new rating for the article
   */
  static calcArticleRating(currentRatingNo, currentRating, newRating) {
    if (currentRatingNo === 0) {
      return newRating;
    }
    const currTotal = currentRating * currentRatingNo;
    const newTotal = currTotal + newRating;
    const totalReviewNo = currentRatingNo + 1;
    return newTotal / totalReviewNo;
  }

  /**
   * @method pusher
   * @description Method that Initializes Pusher and starts trigger
   * @param {string} channel
   * @param {string} event
   * @param {*} data
   * @return {undefined}
   */
  static pusher(channel, event, data) {
    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_APP_KEY,
      secret: process.env.PUSHER_APP_SECRET,
      cluster: 'eu',
      useTLS: true
    });

    return new Promise((resolve) => {
      pusher.trigger(channel, event, {
        data
      }, null, () => {
        resolve();
      });
    });
  }

  /**
   * @method isValidEmail
   * @description Validates an email field
   * @param {string} email - users email
   * @return {boolean} if email is valid
   */
  static isValidEmail(email) {
    const emailMatch = /^([A-z0-9]+)([._-]{0,1})([A-z0-9]+)@([A-z0-9-_.]+)\.([A-z]{2,3})$/;
    const emailEvaluation = emailMatch.test(email);
    return emailEvaluation;
  }
}

export default HelperUtils;
