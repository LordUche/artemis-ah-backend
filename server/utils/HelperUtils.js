import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

const sendGrid = require('@sendgrid/mail');

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
      throw new Error(error);
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
    sendGrid.send(message);
  }
}

export default HelperUtils;