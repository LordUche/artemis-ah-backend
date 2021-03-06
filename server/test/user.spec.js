import chaiHttp from 'chai-http';
import chai, { expect } from 'chai';
import dotenv from 'dotenv';
import { HelperUtils } from '../utils';
import app from '../app';
import { handleSocialLogin, generateNewUsername } from '../config/passport';

dotenv.config();

chai.use(chaiHttp);

const testEmail = 'thatemail@yahoo.com';
const QueryURL = `?email=${testEmail}&hash=${HelperUtils.hashPassword(testEmail)}`;
const invalidQueryURL = `?email=${'invalid.email@gmail.com'}&hash=${HelperUtils.hashPassword('iamEvenmoreInvalid@rocketmail.com')}`;
const signupURL = '/api/users';
const resetPassword = '/api/users/reset-password';
const resetPasswordURL = `/api/users/reset-password${QueryURL}`;
const invalidResetPasswordURL = `/api/users/reset-password${invalidQueryURL}`;
const verifyURL = `/api/users/verifyemail${QueryURL}`;
const invalidVerifyURL = `/api/users/verifyemail${invalidQueryURL}`;
const secondTestEmail = 'thatsecondemail@yahoo.com';
const secondQueryURL = `?email=${secondTestEmail}&hash=${HelperUtils.hashPassword(secondTestEmail)}`;
const secondVerifyURL = `/api/users/verifyemail${secondQueryURL}`;
const thirdTestEmail = 'thatthirdemail@yahoo.com';
const loginURL = '/api/users/login';
const invalidQueryURL2 = `?email=${'invalid.email@gmail.com'}&hash=${HelperUtils.hashPassword('invalid.email@gmail.com')}`;
const invalidResetPasswordURL2 = `/api/users/reset-password${invalidQueryURL2}`;
let userToken;

describe('Test signup endpoint and email verification endpoint', () => {
  it("It should return a 404 if user don't exist during email verification", (done) => {
    chai
      .request(app)
      .get(verifyURL)
      .end((err, res) => {
        expect(res.status).to.equal(404);
        expect(res.body.message).to.be.a('string');
        expect(res.body.message).to.equal("user doesn't exist");
        done();
      });
  });

  it('It should return a 201 and create a new user', (done) => {
    const data = {
      firstname: 'John',
      lastname: 'Doe',
      email: testEmail,
      username: 'john45',
      password: '12345678'
    };
    chai
      .request(app)
      .post(signupURL)
      .send(data)
      .end((err, res) => {
        expect(res.status).to.equal(201);
        expect(res.body.message).to.be.a('string');
        expect(res.body.message).to.equal('user created successfully');
        done();
      });
  });

  it('it should return a 409 if email exists', (done) => {
    const data = {
      firstname: 'John',
      lastname: 'Doe',
      email: testEmail,
      username: 'john456',
      password: '12345678'
    };
    chai
      .request(app)
      .post(signupURL)
      .send(data)
      .end((err, res) => {
        const { email } = res.body.errors;
        expect(res.status).to.equal(409);
        expect(email[0]).to.equal('email already exists.');
        done(err);
      });
  });

  it('it should return a 409 if username exists', (done) => {
    const data = {
      firstname: 'John',
      lastname: 'Doe',
      email: 'nwabuzor.obiora2@gmail.com',
      username: 'john45',
      password: '12345678'
    };
    chai
      .request(app)
      .post(signupURL)
      .send(data)
      .end((err, res) => {
        const { username } = res.body.errors;
        expect(res.status).to.equal(409);
        expect(username[0]).to.equal('username already exists.');
        done(err);
      });
  });

  it('It should return 400 if email is not verified successfully', (done) => {
    chai
      .request(app)
      .get(invalidVerifyURL)
      .end((err, res) => {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.be.a('string');
        expect(res.body.message).to.equal('invalid email');
        done();
      });
  });

  it('should return 400 if email is empty', (done) => {
    chai
      .request(app)
      .post(signupURL)
      .send({
        firstname: 'John',
        lastname: 'Doe',
        username: 'john45',
        password: '1234567'
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        const { email } = res.body.errors;
        expect(email[0]).to.be.equal('Email field cannot be blank.');
        done(err);
      });
  });

  it('should return 400 if firstname is empty', (done) => {
    chai
      .request(app)
      .post(signupURL)
      .send({
        email: 'johndoe@gmail.com',
        lastname: 'Doe',
        username: 'john45',
        password: '12345678'
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        const { firstname } = res.body.errors;
        expect(firstname[0]).to.be.equal('First name field must be specified.');
        done(err);
      });
  });

  it('should return 400 if firstname contains non-alphabetic characters', (done) => {
    chai
      .request(app)
      .post(signupURL)
      .send({
        email: 'johndoe@gmail.com',
        firstname: 'John124',
        lastname: 'Doe',
        username: 'john45',
        password: '12345678'
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        const { firstname } = res.body.errors;
        expect(firstname[0]).to.be.equal('First name can only contain alphabetic characters.');
        done(err);
      });
  });

  it('should return 400 if lastname is empty', (done) => {
    chai
      .request(app)
      .post(signupURL)
      .send({
        email: 'johndoe@gmail.com',
        firstname: 'John',
        username: 'john45',
        password: '12345678'
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        const { lastname } = res.body.errors;
        expect(lastname[0]).to.be.equal('Last name field must be specified.');
        done(err);
      });
  });

  it('should return 400 if lastname contains non-alphabetic characters', (done) => {
    chai
      .request(app)
      .post(signupURL)
      .send({
        email: 'johndoe@gmail.com',
        firstname: 'John',
        lastname: 'John123',
        username: 'john45',
        password: '12345678'
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        const { lastname } = res.body.errors;
        expect(lastname[0]).to.be.equal('Last name can only contain alphabetic characters.');
        done(err);
      });
  });

  it('should return 400 if username is empty', (done) => {
    chai
      .request(app)
      .post(signupURL)
      .send({
        email: 'johndoe@gmail.com',
        firstname: 'John',
        lastname: 'Doe',
        password: '12345678'
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        const { username } = res.body.errors;
        expect(username[0]).to.be.equal('Username field must be specified.');
        done(err);
      });
  });

  it('should return 400 if username is less than 2 characters', (done) => {
    chai
      .request(app)
      .post(signupURL)
      .send({
        email: 'johndoe@gmail.com',
        firstname: 'John',
        lastname: 'Doe',
        username: 'J',
        password: '12345678'
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        const { username } = res.body.errors;
        expect(username[0]).to.be.equal('Username must not be less than 2 characters.');
        done(err);
      });
  });

  it('should return 400 if email is invalid', (done) => {
    chai
      .request(app)
      .post(signupURL)
      .send({
        firstname: 'John',
        lastname: 'Doe',
        email: 'nwabuzor',
        username: 'john45',
        password: '1234567'
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        const { email } = res.body.errors;
        expect(email[0]).to.be.equal('Email is invalid.');
        done(err);
      });
  });

  it('should return 400 if password is not alphanumeric', (done) => {
    chai
      .request(app)
      .post(signupURL)
      .send({
        firstname: 'John',
        lastname: 'Doe',
        email: 'nwabuzor.obiora@gmail.com',
        username: 'john45',
        password: ''
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        const { password } = res.body.errors;
        expect(password[0]).to.be.equal('Password must be Alphanumeric.');
        done(err);
      });
  });

  it('should return 400 if password is less than 8 characters', (done) => {
    chai
      .request(app)
      .post(signupURL)
      .send({
        firstname: 'John',
        lastname: 'Doe',
        email: 'nwabuzor.obiora@gmail.com',
        username: 'john45',
        password: '12345'
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        const { password } = res.body.errors;
        expect(password[0]).to.be.equal('Password cannot be less than 8 characters.');
        done(err);
      });
  });
});

describe('Test reset password mail endpoint and password link endpoint', () => {
  it('It should return a 404 if user records not found', (done) => {
    const data = { email: 'ayo-oluwa.adebayo@andela.co' };
    chai
      .request(app)
      .post(resetPassword)
      .send(data)
      .end((err, res) => {
        expect(res.status).to.equal(404);
        expect(res.body.message).to.be.a('string');
        expect(res.body.message).to.equal('user not found in our records');
        done();
      });
  });

  it('It should return a 200 if user email is found in the database', (done) => {
    const data = { email: testEmail };
    chai
      .request(app)
      .post(resetPassword)
      .send(data)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body.message).to.be.a('string');
        expect(res.body.message).to.equal('Please, verify password reset link in your email box');
        done();
      });
  });

  it('It should return a 400 if user passwords do not match', (done) => {
    const data = { newPassword: 'hello2qwerr', confirmPassword: 'hello2qwer' };
    chai
      .request(app)
      .patch(resetPasswordURL)
      .send(data)
      .end((err, res) => {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.be.a('string');
        expect(res.body.message).to.equal('The supplied passwords do not match');
        done();
      });
  });

  it('It should return a 200 if user passwords match', (done) => {
    const data = { newPassword: 'hello2qwerr', confirmPassword: 'hello2qwerr' };
    chai
      .request(app)
      .patch(resetPasswordURL)
      .send(data)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body.message).to.be.a('string');
        expect(res.body.message).to.equal('Password reset successful. Please, login using your new password.');
        done();
      });
  });

  it('It should return a 400 if reset link is invalid', (done) => {
    const data = { newPassword: 'hello2qwerr', confirmPassword: 'hello2qwerr' };
    chai
      .request(app)
      .patch(invalidResetPasswordURL)
      .send(data)
      .end((err, res) => {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.be.a('string');
        expect(res.body.message).to.equal('Invalid password reset link');
        done();
      });
  });

  it("It should return a 404 if user doesn't exist", (done) => {
    const data = { newPassword: 'hello2qwerr', confirmPassword: 'hello2qwerr' };
    chai
      .request(app)
      .patch(invalidResetPasswordURL2)
      .send(data)
      .end((err, res) => {
        expect(res.status).to.equal(404);
        expect(res.body.message).to.be.a('string');
        expect(res.body.message).to.equal('User not found');
        done();
      });
  });

  it('It should return a 400 if password length is lessthan 8', (done) => {
    const data = { newPassword: 'hello', confirmPassword: 'hello' };
    chai
      .request(app)
      .patch(invalidResetPasswordURL)
      .send(data)
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
  });
});

describe('Social Login', () => {
  it('should sign a new user in', (done) => {
    const mockCb = (err, res) => {
      const { email, role, firstname, lastname, image, active, id } = res.data;
      expect(id).to.be.a('number');
      expect(email).to.equal('thanosxxl@yahoo.com');
      expect(role).to.equal('user');
      expect(firstname).to.equal('Thanos');
      expect(lastname).to.equal('Stormborn');
      expect(image).to.equal('hsgdfdg.jpg');
      expect(active).to.equal(true);
      done();
    };
    handleSocialLogin('thanosxxl@yahoo.com',
      'Thanos',
      'Stormborn',
      'snappy',
      'hsgdfdg.jpg',
      mockCb);
  });

  it('should log a returning user in', (done) => {
    const mockCb = (err, res) => {
      const { email, role, firstname, lastname, image, active, id } = res.data;
      expect(id).to.be.a('number');
      expect(email).to.equal('thanosxxl@yahoo.com');
      expect(role).to.equal('user');
      expect(firstname).to.equal('Thanos');
      expect(lastname).to.equal('Stormborn');
      expect(image).to.equal('hsgdfdg.jpg');
      expect(active).to.equal(true);
      done();
    };
    handleSocialLogin('thanosxxl@yahoo.com', null, null, null, null, mockCb);
  });

  it('should generate a serial username if social username is already taken', (done) => {
    const mockCb = (err, res) => {
      const { email, role, firstname, username, lastname, image, active, id } = res.data;
      expect(id).to.be.a('number');
      expect(email).to.equal('thanosxxxxxl@yahoo.com');
      expect(username).to.equal('ayo1');
      expect(role).to.equal('user');
      expect(firstname).to.equal('Thanos');
      expect(lastname).to.equal('Stormborn');
      expect(image).to.equal('hsgdfdg.jpg');
      expect(active).to.equal(true);
      done();
    };
    handleSocialLogin('thanosxxxxxl@yahoo.com',
      'Thanos',
      'Stormborn',
      'ayo',
      'hsgdfdg.jpg',
      mockCb);
  });

  it('should generate a username with firstname if social network provides no username', (done) => {
    const mockCb = (err, res) => {
      const { email, role, firstname, username, lastname, image, active, id } = res.data;
      expect(id).to.be.a('number');
      expect(email).to.equal('thanosl@yahoo.com');
      expect(username).to.equal('tatiana');
      expect(role).to.equal('user');
      expect(firstname).to.equal('tatiana');
      expect(lastname).to.equal('Stormborn');
      expect(image).to.equal('hsgdfdg.jpg');
      expect(active).to.equal(true);
      done();
    };
    handleSocialLogin('thanosl@yahoo.com', 'tatiana', 'Stormborn', null, 'hsgdfdg.jpg', mockCb);
  });

  it('should generate a username with email if social network provides no username or firstname', (done) => {
    const mockCb = (err, res) => {
      const { email, role, username, lastname, image, active, id } = res.data;
      expect(id).to.be.a('number');
      expect(email).to.equal('thanosxl@yahoo.com');
      expect(username).to.equal('thanosxl');
      expect(role).to.equal('user');
      expect(lastname).to.equal('Stormborn');
      expect(image).to.equal('hsgdfdg.jpg');
      expect(active).to.equal(true);
      done();
    };
    handleSocialLogin('thanosxl@yahoo.com', null, 'Stormborn', null, 'hsgdfdg.jpg', mockCb);
  });
});

describe('Social Login with Google', () => {
  it('should return the google authentication webpage', (done) => {
    chai
      .request(app)
      .get(`${signupURL}/auth/google`)
      .end((err, res) => {
        expect(res.redirects[0]).to.contain('https://accounts.google.com/o/oauth2');
        done();
      });
  });
  it('should redirect to the platform if the user does not grant access', (done) => {
    chai
      .request(app)
      .get(`${signupURL}/auth/google/redirect?error=access_denied&error_code=200&error_description=Permissions+error&error_reason=user_denied#_=_`)
      .end((err, res) => {
        expect(res.redirects[0]).to.contain(`${process.env.SOCIAL_LOGIN_REDIRECT_URL}/?errorData=`);
        done();
      });
  });
});

describe('Social Login with Facebook', () => {
  it('should return the facebook authentication webpage', (done) => {
    chai
      .request(app)
      .get(`${signupURL}/auth/facebook`)
      .end((err, res) => {
        expect(res.redirects[0]).to.contain('https://www.facebook.com');
        expect(res.redirects[0]).to.contain('oauth');
        done();
      });
  });
  it('should redirect to the platform if the user does not grant access', (done) => {
    chai
      .request(app)
      .get(`${signupURL}/auth/facebook/redirect?error=access_denied&error_code=200&error_description=Permissions+error&error_reason=user_denied#_=_`)
      .end((err, res) => {
        expect(res.redirects[0]).to.contain(`${process.env.SOCIAL_LOGIN_REDIRECT_URL}/?errorData=`);
        done();
      });
  });
});

describe('Social Login with Twitter', () => {
  it('should redirect to the platform if the user does not grant access', (done) => {
    chai
      .request(app)
      .get(`${signupURL}/auth/twitter/redirect?denied=RtMJrQAAAAAA9jxWAAABagrKdfc`)
      .end((err, res) => {
        expect(res.redirects[0]).to.contain(`${process.env.SOCIAL_LOGIN_REDIRECT_URL}/?errorData=`);
        done();
      });
  });
});

describe('Test login endpoint', () => {
  before((done) => {
    const secondData = {
      firstname: 'John',
      lastname: 'Doe',
      email: secondTestEmail,
      username: 'numerotwo222',
      password: '22222222'
    };
    chai
      .request(app)
      .post(signupURL)
      .send(secondData)
      .end(() => {
        chai
          .request(app)
          .get(secondVerifyURL)
          .end(() => {
            const thirdData = {
              firstname: 'John',
              lastname: 'Doe',
              email: thirdTestEmail,
              username: 'numerothree333',
              password: '33333333'
            };
            chai
              .request(app)
              .post(signupURL)
              .send(thirdData)
              .end(() => {
                done();
              });
          });
      });
  });
  it('should log in a user who has verified his email when name is set to email', (done) => {
    const data = {
      name: secondTestEmail,
      password: '22222222'
    };
    chai
      .request(app)
      .post(loginURL)
      .send(data)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        const { message, user } = res.body;
        expect(message).to.equal('user logged in successfully');
        expect(user.email).to.equal(secondTestEmail);
        expect(user.username).to.equal('numerotwo222');
        userToken = user.token;
        done();
      });
  });
  it('should log in a user who has verified his email when name is set to username', (done) => {
    const data = {
      name: 'numerotwo222',
      password: '22222222'
    };
    chai
      .request(app)
      .post(loginURL)
      .send(data)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        const { message, user } = res.body;
        expect(message).to.equal('user logged in successfully');
        expect(user.email).to.equal(secondTestEmail);
        expect(user.username).to.equal('numerotwo222');
        done();
      });
  });
  it('should not log in a user who hasnt verified his email', (done) => {
    const data = {
      name: thirdTestEmail,
      password: '33333333'
    };
    chai
      .request(app)
      .post(loginURL)
      .send(data)
      .end((err, res) => {
        expect(res.status).to.equal(403);
        expect(res.body.message).to.equal('You have to verify your email before you login');
        done();
      });
  });
  it('should not log in a user with wrong password', (done) => {
    const data = {
      name: secondTestEmail,
      password: '77777777'
    };
    chai
      .request(app)
      .post(loginURL)
      .send(data)
      .end((err, res) => {
        expect(res.status).to.equal(403);
        expect(res.body.message).to.equal('invalid credentials');
        done();
      });
  });
  it('should not log in a user with wrong username and email', (done) => {
    const data = {
      name: `${secondTestEmail}djdhff`,
      password: '22222222'
    };
    chai
      .request(app)
      .post(loginURL)
      .send(data)
      .end((err, res) => {
        expect(res.status).to.equal(404);
        expect(res.body.message).to.equal('invalid credentials');
        done();
      });
  });
  it('should not log in a user without password', (done) => {
    const data = {
      name: secondTestEmail
    };
    chai
      .request(app)
      .post(loginURL)
      .send(data)
      .end((err, res) => {
        expect(res.status).to.equal(400);
        expect(res.body.errors.password[0]).to.equal('Password is required to login');
        done();
      });
  });
  it('should not log in a user without email or username', (done) => {
    const data = {
      password: '22222222'
    };
    chai
      .request(app)
      .post(loginURL)
      .send(data)
      .end((err, res) => {
        expect(res.status).to.equal(400);
        expect(res.body.errors.name[0]).to.equal('Email or Username is required to login');
        done();
      });
  });
});

describe('Toggle notification', () => {
  it('should update my notifications settings', (done) => {
    const newSettings = {
      emailNotification: false,
      inAppNotification: false
    };
    chai
      .request(app)
      .patch('/api/users/notification')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newSettings)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body.message).to.equal('Notification settings updated');
        chai
          .request(app)
          .get('/api/user')
          .set('Authorization', `Bearer ${userToken}`)
          .end((error, response) => {
            expect(response.body.user.emailNotification).to.equal(false);
            expect(response.body.user.inAppNotification).to.equal(false);
            done();
          });
      });
  });
  it('should fail if emailNotification is not true or false', (done) => {
    const newSettings = {
      emailNotification: 'djfhfhf',
      inAppNotification: false
    };
    chai
      .request(app)
      .patch('/api/users/notification')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newSettings)
      .end((err, res) => {
        expect(res.status).to.equal(400);
        expect(res.body.errors.emailNotification[0]).to.equal('emailNotification should be either true or false');
        done();
      });
  });
  it('should fail if inAppNotification is not true or false', (done) => {
    const newSettings = {
      emailNotification: true,
      inAppNotification: 'nhfhjfj'
    };
    chai
      .request(app)
      .patch('/api/users/notification')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newSettings)
      .end((err, res) => {
        expect(res.status).to.equal(400);
        expect(res.body.errors.inAppNotification[0]).to.equal('InAppNotification should be either true or false');
        done();
      });
  });
  it('should fail if emailNotification is missing', (done) => {
    const newSettings = {
      inAppNotification: true
    };
    chai
      .request(app)
      .patch('/api/users/notification')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newSettings)
      .end((err, res) => {
        expect(res.status).to.equal(400);
        expect(res.body.errors.emailNotification[0]).to.equal('Please specify if you want to recieve email notifications');
        done();
      });
  });
  it('should fail if inAppNotification is missing', (done) => {
    const newSettings = {
      emailNotification: true
    };
    chai
      .request(app)
      .patch('/api/users/notification')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newSettings)
      .end((err, res) => {
        expect(res.status).to.equal(400);
        expect(res.body.errors.inAppNotification[0]).to.equal('Please specify if you want to recieve in app notifications');
        done();
      });
  });
});

describe('Test wild card route', () => {
  it('Should return a 404 error for unfound routes', (done) => {
    chai
      .request(app)
      .get('/api/reportadmin')
      .end((req, res) => {
        expect(res.status).to.equal(404);
        expect(res.body.message)
          .to.be.a('string')
          .to.equal('Route not found');
        done();
      });
  });
});

describe('Test welcome route', () => {
  it('Should return a 200', (done) => {
    chai
      .request(app)
      .get('/')
      .end((req, res) => {
        expect(res.status).to.equal(200);
        expect(res.body.message)
          .to.be.a('string')
          .to.equal('Authors Haven.');
        done();
      });
  });
});

describe('Unit test passport methods', () => {
  it('should test the meta passport methods', (done) => {
    expect(generateNewUsername('shaolin1')).to.equal('shaolin2');
    done();
  });
});
