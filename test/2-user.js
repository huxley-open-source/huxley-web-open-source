var assert = require('assert');
var request = require('supertest');
var requests = request('http://localhost:8080/api');
var shared = require('./shared');

var adminToken;

describe('User API', function() {

  it('should not login', function(done) {
    requests
      .post('/login').type('json')
      .send(JSON.stringify({ username: 'admin', password: '1234567' }))
      .expect(401).end(done);
  });


  it('should login', function(done) {
    requests
      .post('/login').type('json')
      .send(JSON.stringify({ username: 'admin', password: '123456' }))
      .expect(function(res) {
        if (res.body.username !== 'admin') throw new Error();
        adminToken = res.body['access_token'];
        shared.adminToken = adminToken;
        done();
      }).expect(200).end();
  });

  it('should create a student', function(done) {
    requests
    .post('/v1/users').type('json')
    .set('Authorization', 'Bearer ' + adminToken)
    .send(JSON.stringify({
      username: 'marcio',
      name: 'Marcio',
      password: '123456',
      email: 'marcio@marcio.com.br',
      locale: 'pt_BR'
    }))
    .expect(200).end(done);
  });

  it('should login as marcio', function(done) {
    requests
      .post('/login').type('json')
      .send(JSON.stringify({ username: 'marcio', password: '123456' }))
      .end(function(err, res) {
        if (res.body.username !== 'marcio') throw new Error();
        token = res.body['access_token'];
        shared.studentToken  = token;

        done(err, res);
      });
  });

  it('should create a teacher', function(done) {
    requests
    .post('/v1/users').type('json')
    .set('Authorization', 'Bearer ' + adminToken)
    .send(JSON.stringify({
      username: 'rodrigo',
      name: 'Rodrigo',
      password: '123456',
      email: 'rodrigo@thehuxley.com',
      locale: 'pt_BR'
    }))
    .expect(200).end(done);
  });

  it('should create an english student', function(done) {
    requests
    .post('/v1/users').type('json')
    .set('Authorization', 'Bearer ' + adminToken)
    .send(JSON.stringify({
      username: 'john',
      name: 'John',
      password: '123456',
      email: 'john@john.com.br',
      locale: 'en_US'
    }))
    .expect(200).end(done);
  });

  var teacherId;
  it('should login as rodrigo', function(done) {
    requests
      .post('/login').type('json')
      .send(JSON.stringify({ username: 'rodrigo', password: '123456' }))
      .end(function(err, res) {
        if (res.body.username !== 'rodrigo') throw new Error();
        shared.teacherToken  = res.body['access_token'];
        done(err, res);
      });
  });

  it('should get current user', function(done) {
    requests
    .get('/v1/user')
    .set('Authorization', 'Bearer ' + shared.teacherToken)
    .expect(function(res) {
      teacherId = res.body.id;
    })
    .end(done);
  });

  it('should add teacher to instituition', function(done) {
    requests
    .put('/v1/institutions/' + 1 + '/users/' + teacherId + '?role=TEACHER').type('json')
    .set('Authorization', 'Bearer ' + adminToken)
    .send(JSON.stringify({
      role: 'TEACHER'
    }))
    .expect(200).end(done);
  });

  it('should login as rodrigo', function(done) {
    requests
      .post('/login').type('json')
      .send(JSON.stringify({ username: 'rodrigo', password: '123456' }))
      .end(function(err, res) {
        if (res.body.username !== 'rodrigo') throw new Error();
        shared.teacherToken  = res.body['access_token'];
        done(err, res);
      });
  });

  it('should login as english student', function(done) {
    requests
      .post('/login').type('json')
      .send(JSON.stringify({ username: 'john', password: '123456' }))
      .end(function(err, res) {
        if (res.body.username !== 'john') throw new Error();
        shared.englishToken  = res.body['access_token'];
        done(err, res);
      });
  });
});
