var assert = require('assert');
var request = require('supertest');
var shared = require('./shared');

var requests = request('http://localhost:8080/api');

describe('Groups API', function() {

  it('should have no groups', function(done) {
    requests
      .get('/v1/groups')
      .expect(200)
      .expect([], done);
  });

  it('should create group', function(done) {

    var now = new Date().getTime();
    var day = 24 * 60 * 60 * 1000;

    requests
      .post('/v1/groups').type('json')
      .set('Authorization', 'Bearer ' + shared.teacherToken)
      .send(JSON.stringify({
        name: 'Grupo Test',
        institution: { id: 1 },
        url: 'grupo-test',
        description: 'nenhuma',
        startDate: new Date(now - day),
        endDate: new Date(now + (day * 20))
      }))
      .expect(200)
      .end(done);
  });

  var groupId;

  it('should have 1 group', function(done) {
    requests
      .get('/v1/groups')
      .expect(200)
      .expect(function(res) {
        assert(res.body.length === 1, 'wrong siiize');
        var group = res.body[0];
        assert(group.name === 'Grupo Test', 'nome errado');
        groupId = group.id;
      }).end(done);
  });

    var key;
    it('should get a key', function (done) {
        requests
            .get('/v1/groups/' + groupId + '/key')
            .set('Authorization', 'Bearer ' + shared.teacherToken)
            .expect(200)
            .expect(function(res) {
                key = res.body.key;
                assert(res.body.key !== null && res.body.key !== undefined, 'key is null or undefined');
            }).end(done);
    });

    it('should refresh a key', function (done) {
        requests
            .put('/v1/groups/' + groupId + '/key')
            .set('Authorization', 'Bearer ' + shared.teacherToken)
            .expect(200)
            .expect(function(res) {
                assert(res.body.key !== null && res.body.key !== undefined, 'key is null or undefined');
                assert(key !== res.body.key, 'didn\'t refreshed the key');
            }).end(done);
    });

  it('should have no quizzes', function(done) {
    requests
      .get('/v1/quizzes')
      .set('Authorization', 'Bearer ' + shared.teacherToken)
      .expect(200)
      .expect([], done);
  });

  var quizId;

  it('should create quiz', function(done) {

    var now = new Date().getTime();
    var day = 24 * 60 * 60 * 1000;

    requests
      .post('/v1/quizzes').type('json')
      .set('Authorization', 'Bearer ' + shared.teacherToken)
      .send(JSON.stringify({
        title: 'Questionário Teste',
        group: { id: groupId },
        description: 'nenhuma descrição',
        startDate: new Date(now).toISOString().split('.')[0]+ "Z",
        endDate: new Date(now + (day * 2)).toISOString().split('.')[0] + "Z"
      }))
      .expect(function(res) {
        assert.equal(res.status, 200);
        quizId = res.body.id;
      }).end(done);
  });

  var topicid;

  it('should create topic 2', function(done) {

    requests
      .post('/v1/topics').type('json')
      .set('Authorization', 'Bearer ' + shared.adminToken)
      .send(JSON.stringify({name: 'meu-topico-2'}))
      .expect(function(res) {
        topicid = res.body.id;
      }).end(done);
  });


  var problemId;

  it('should save quiz only problem', function(done) {
    requests
      .post('/v1/problems').type('json')
      .set('Authorization', 'Bearer ' + shared.teacherToken)
      .send(JSON.stringify({
        "level":1,
        "timeLimit":1,
        "name":"Meu problema de prova em questionário",
        "topics":[{ id: topicid }],
        "description":"<p>Descrição do meu problema com mais de quarenta e nove caracteres</p>",
        "inputFormat":"<p>123123</p>",
        "outputFormat":"<p>123123</p>",
        "source":"fonte",
        "quizOnly": "true"
      }))
      .expect(function(res) {
        assert.equal(res.status, 200);
        problemId = res.body.id;
      }).end(done);
  });

  it('should approve quiz only problem', function(done) {
    requests
      .put('/v1/problems/' + problemId + '/accept')
      .set('Authorization', 'Bearer ' + shared.teacherToken)
      .expect(200)
      .end(done);
  });

  it('should not view quiz only problem', function(done) {
    requests
      .get('/v1/problems/' + problemId)
      .set('Authorization', 'Bearer ' + shared.studentToken)
      .expect(403)
      .end(done);
  });

  var userId;
  it('should get student id', function(done) {
    requests
      .get('/v1/user')
      .set('Authorization', 'Bearer ' + shared.studentToken)
      .expect(function(res) {
        assert(res.body.id, 'retorna o id do usuario cadastrado');
        userId = res.body.id;
      }).end(done);

  });

  it('should add user to group', function(done) {
    requests
      .put('/v1/groups/' + groupId + '/users/' + userId)
      .set('Authorization', 'Bearer ' + shared.teacherToken)
      .expect(200)
      .end(done);
  });

  it('should add problem to quiz', function(done) {
    requests
      .put('/v1/quizzes/' + quizId + '/problems/' + problemId + '?score=10')
      .set('Authorization', 'Bearer ' + shared.teacherToken)
      .expect(200)
      .end(done);
  });

  it('should view quiz only problem', function(done) {
    requests
      .get('/v1/problems/' + problemId)
      .set('Authorization', 'Bearer ' + shared.studentToken)
      .expect(200)
      .end(done);
  });

    var languageId;

    it('should list languages', function(done) {
        requests
            .get('/v1/languages')
            .set('Authorization', 'Bearer ' + shared.adminToken)
            .expect(function(res) {
                languageId = res.body[0].id;
            }).end(done);
    });

    it('should send submission', function(done) {
        requests
            .post('/v1/user/problems/' + problemId + '/submissions').type('json')
            .set('Authorization', 'Bearer ' + shared.studentToken)
            .send(JSON.stringify({
                language: { id: languageId },
                code: '10,1,WRONG_ANSWER,2'
            }))
            .expect(200)
            .end(done);
    });

    it('should get user score', function(done) {
        requests
            .get('/v1/quizzes/' + quizId + '/users/' + userId + '/problems/' + problemId)
            .set('Authorization', 'Bearer ' + shared.adminToken)
            .expect(function(res) {
                assert.equal(res.body.scores.length, 1);
                var score = res.body.scores[0];
                assert.equal(score.user_score, 0);
                assert.equal(score.partial_score, 1);
            })
            .end(done);
    });

    it('should get user quiz scores', function(done) {
        requests
            .get('/v1/user/quizzes/scores')
            .set('Authorization', 'Bearer ' + shared.studentToken)
            .expect(function(res) {
                assert.equal(res.body.length, 1);
                assert.equal(res.body[0].userscore, 0);
                assert.equal(res.body[0].partialscore, 1);
            })
            .end(done);
    });

    it('should get quiz consolidated scores', function(done) {
        requests
            .get('/v1/quizzes/' + quizId + '/scores')
            .set('Authorization', 'Bearer ' + shared.adminToken)
            .expect(function(res) {
                assert.equal(res.body.length, 1);
                assert.equal(res.body[0].correctProblems.length, 1);
                var p = res.body[0].correctProblems[0];
                assert.equal(p.score, 0);
                assert.equal(p.partialScore, 1);
            })
            .end(done);
    });

    it('should send better submission', function(done) {
        requests
            .post('/v1/user/problems/' + problemId + '/submissions').type('json')
            .set('Authorization', 'Bearer ' + shared.studentToken)
            .send(JSON.stringify({
                language: { id: languageId },
                code: '10,5,WRONG_ANSWER,2'
            }))
            .expect(200)
            .end(done);
    });

    it('should get user score', function(done) {
        requests
            .get('/v1/quizzes/' + quizId + '/users/' + userId + '/problems/' + problemId)
            .set('Authorization', 'Bearer ' + shared.adminToken)
            .expect(function(res) {
                assert.equal(res.body.scores.length, 1);
                var score = res.body.scores[0];
                assert.equal(score.user_score, 0);
                assert.equal(score.partial_score, 5);
            })
            .end(done);
    });

    it('should get user quiz scores', function(done) {
        requests
            .get('/v1/user/quizzes/scores')
            .set('Authorization', 'Bearer ' + shared.studentToken)
            .expect(function(res) {
                assert.equal(res.body.length, 1);
                assert.equal(res.body[0].userscore, 0);
                assert.equal(res.body[0].partialscore, 5);
            })
            .end(done);
    });

    it('should get quiz consolidated scores', function(done) {
        requests
            .get('/v1/quizzes/' + quizId + '/scores')
            .set('Authorization', 'Bearer ' + shared.adminToken)
            .expect(function(res) {
                assert.equal(res.body.length, 1);
                assert.equal(res.body[0].correctProblems.length, 1);
                var p = res.body[0].correctProblems[0];
                assert.equal(p.score, 0);
                assert.equal(p.partialScore, 5);
            })
            .end(done);
    });

    it('should send correct submission', function(done) {
        requests
            .post('/v1/user/problems/' + problemId + '/submissions').type('json')
            .set('Authorization', 'Bearer ' + shared.studentToken)
            .send(JSON.stringify({
                language: { id: languageId },
                code: '10,10,CORRECT,2'
            }))
            .expect(200)
            .end(done);
    });

    it('should get user score', function(done) {
        requests
            .get('/v1/quizzes/' + quizId + '/users/' + userId + '/problems/' + problemId)
            .set('Authorization', 'Bearer ' + shared.adminToken)
            .expect(function(res) {
                assert.equal(res.body.scores.length, 1);
                var score = res.body.scores[0];
                assert.equal(score.user_score, 10);
                assert.equal(score.partial_score, 10);
            })
            .end(done);
    });

    it('should get user quiz scores', function(done) {
        requests
            .get('/v1/user/quizzes/scores')
            .set('Authorization', 'Bearer ' + shared.studentToken)
            .expect(function(res) {
                assert.equal(res.body.length, 1);
                assert.equal(res.body[0].userscore, 10);
                assert.equal(res.body[0].partialscore, 10);
            })
            .end(done);
    });

    it('should get quiz consolidated scores', function(done) {
        requests
            .get('/v1/quizzes/' + quizId + '/scores')
            .set('Authorization', 'Bearer ' + shared.adminToken)
            .expect(function(res) {
                assert.equal(res.body.length, 1);
                assert.equal(res.body[0].correctProblems.length, 1);
                var p = res.body[0].correctProblems[0];
                assert.equal(p.score, 10);
                assert.equal(p.partialScore, 10);
            })
            .end(done);
    });

  it('should update quiz start date', function(done) {
    var inTwoHours = new Date().getTime() + (2 * 60 * 60 * 1000);
    requests
      .put('/v1/quizzes/' + quizId).type('json')
      .set('Authorization', 'Bearer ' + shared.teacherToken)
      .send(JSON.stringify({
        startDate: new Date(inTwoHours).toISOString().split('.')[0]+ "Z",
      }))
      .expect(200)
      .end(done);
  });

  it('should not view quiz only problem', function(done) {
    requests
      .get('/v1/problems/' + problemId)
      .set('Authorization', 'Bearer ' + shared.studentToken)
      .expect(403)
      .end(done);
  });



});
