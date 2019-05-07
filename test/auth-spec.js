// should is not used directly in the file but is added as a mocha requirement

import supertest from 'supertest';
import app from '../app';

const server = supertest.agent(app);

describe('Auth endpoint: SignUp', () => {

    it('should return the signup form page', done => {
        server
            .get('/auth/signup')
            .expect(200)
            .end((err, res) => {
                res.status.should.be.equal(200);
                done();
            });
    });

    it('should register and return user', done => {
        server
            .post('/auth/signup')
            .send({ email: 'email@address.com', password: 'password', 
                confirm_password: 'password' })
            .expect(200)
            .end((err, res) => {
                res.body.status.should.equal(201);
                res.body.data.should.be.an.instanceOf(Object);
                res.body.data.should.have.property(
                    'email', 'email@address.com');
                done();
            });
    });

    it("should return error if passwords don't match", done => {
        server
            .post('/auth/signup')
            .send({ email: 'email@address.com', password: 'password',
                confirm_password: 'wrong' })
            .expect(200)
            .end((err, res) => {
                res.body.status.should.equal(404);
                res.body.error.should.equal('Passwords do not match');
                done();
            });
    });
});

describe('Auth endpoint: SignIn', () => {

    it('should return the signin form page', done => {
        server
            .get('/auth/signin')
            .expect(200)
            .end((err, res) => {
                res.status.should.be.equal(200);
                done();
            });
    });

    it('should return registered user if found', done => {
        server
            .post('/auth/signin')
            .send({ email: 'me@yahoo.com', password: 'password' })
            .expect(200)
            .end((err, res) => {
                res.body.status.should.equal(200);
                res.body.data.should.be.an.instanceOf(Object);
                res.body.data.should.have.property('email', 'me@yahoo.com');
                done();
            });
    });

    it('should return error if user is found but password is wrong', done => {
        server
            .post('/auth/signin')
            .send({ email: 'me@yahoo.com', password: 'wrong_password' })
            .expect(200)
            .end((err, res) => {
                res.body.status.should.equal(404);
                res.body.error.should.equal('Email and password do not match');
                done();
            });
    });

    it('should return error if user is not found', done => {
        server
            .post('/auth/signin')
            .send({ email: 'email@address.com', password: 'password' })
            .expect(200)
            .end((err, res) => {
                res.body.status.should.equal(404);
                res.body.error.should.equal('User not found');
                done();
            });
    });
});