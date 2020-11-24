var assert = require('assert');
var request = require('supertest');
var shared = require('./shared');

var requests = request('http://localhost:8080/api');

describe('Messages API', function() {

  var userId;
  it('should get teacher id', function(done) {
    requests
      .get('/v1/user')
      .set('Authorization', 'Bearer ' + shared.teacherToken)
      .expect(function(res) {
        assert(res.body.id, 'retorna o id do usuario cadastrado');
        userId = res.body.id;
      }).end(done);

  });


  it('should send a direct message', function(done) {
    requests
      .post('/v1/user/messages').type('json')
      .set('Authorization', 'Bearer ' + shared.studentToken)
      .send(JSON.stringify({
        recipientId: userId,
        body: 'opa professor!'
      }))
      .expect(200)
      .end(done);
  });

  it('should list messages', function(done) {
    requests
      .get('/v1/user/messages')
      .set('Authorization', 'Bearer ' + shared.studentToken)
      .expect(function(res) {
        assert.equal(res.body.messages.length, 1);
      })
      .end(done);
  });


});
