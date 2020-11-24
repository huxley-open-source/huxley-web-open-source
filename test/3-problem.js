var assert = require('assert');
var request = require('supertest');
var shared = require('./shared');

var requests = request('http://localhost:8080/api');

var topicid;

function testProblem(problem, status, done) {
  post('/v1/problems', problem, status, done);
}

function post(url, json, status, done, unauthenticated) {
  runMethod('post', url, json, status, done, unauthenticated);
}

function runMethod(method, url, json, status, done, unauthenticated) {

  requests[method](url).type('json')
    .send(JSON.stringify(json))
    .set('Authorization', 'Bearer ' + shared.adminToken)
    .expect(status, function(err, res) {
      if (err) {
        console.log(err, res.error);
        done(err);
      } else {
        done(err, res);
      }
    });

}

describe('Problem', function() {

  it('should have no problem', function(done) {
    requests
      .get('/v1/problems')
      .expect(200)
      .expect([], done);
  });

  it('should not authorize save problem', function(done) {
    requests
      .post('/v1/problems').type('json')
      .send(JSON.stringify({
        name: 'Teste', description: 'Fazer um dois tres'
      }))
      .expect(401, done);
  });

  it('should return invalid problem', function(done) {
    testProblem({ name: 'Teste', description: 'Fazer um dois tres'}, 400, done);
  });

  it('should create topic', function(done) {

    post('/v1/topics', {name: 'meu-topico'}, 200, function(err, res) {
      topicid = res.body.id;
      done(err, res);
    });
  });

  it('should save problem', function(done) {
    testProblem({
      "level":1,
      "timeLimit":1,
      "name":"Meu problema",
      "topics":[{"id": ""+topicid}],
      "description":"<p>Descrição do meu problema com mais de quarenta e nove caracteres</p>",
      "inputFormat":"<p>123123</p>",
      "outputFormat":"<p>123123</p>",
      "source":"fonte"}, 200, done);
  });

  it('should not save multiple choice problem', function(done) {
    testProblem({
      "problemType": 'MULTIPLE_CHOICE',
      "level":1,
      "timeLimit":1,
      "name":"Meu problema 2",
      "topics":[{"id": ""+topicid}],
      "description":"<p>Descrição do meu problema com mais de quarenta e nove caracteres</p>",
      "source":"fonte"}, 400, done);
  });

  it('should save multiple choice problem', function(done) {
    testProblem({
      "problemType": 'MULTIPLE_CHOICE',
      "level":1,
      "timeLimit":1,
      "name":"Meu problema de multipla escolha",
      "topics":[{"id": ""+topicid}],
      "choices": [
        { description: "m1 certa", correct: true },
        { description: "m1 errada", correct: false },
      ],
      "description":"<p>Descrição do meu problema com mais de quarenta e nove caracteres</p>",
      "source":"fonte"}, 200, done);
    });

    it('should save single choice problem', function(done) {
      testProblem({
        "problemType": 'SINGLE_CHOICE',
        "level":3,
        "timeLimit":1,
        "name":"Meu problema de unica escolha",
        "topics":[{"id": ""+topicid}],
        "choices": [
          { description: "essa aqui ta certa", correct: true },
          { description: "essa aqui ta errada", correct: false },
        ],
        "description":"<p>Descrição do meu problema com mais de quarenta e nove caracteres</p>",
        "source":"fonte"
      }, 200, done);
    });

    it('should save true or false problem', function(done) {
      testProblem({
        "problemType": 'TRUE_OR_FALSE',
        "level":2,
        "timeLimit":1,
        "name":"Meu problema de verdadeiro ou falso",
        "topics":[{"id": ""+topicid}],
        "choices": [
          { description: "essa aqui ta certa", correct: true },
          { description: "essa aqui ta errada", correct: false },
        ],
        "description":"<p>Descrição do meu problema com mais de quarenta e nove caracteres</p>",
        "source":"fonte"
      }, 200, done);
    });

    it('should save language', function(done) {
      runMethod('post', '/v1/languages', {
        name: 'C',
        label: 'C',
        compiler: 'C',
        extension: 'c',
        script: 'gcc'
      }, 200, done);
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

    it('should save fill the code problem', function(done) {
      testProblem({
        "problemType": 'FILL_THE_CODE',
        "level":2,
        "timeLimit":1,
        "name":"Meu problema de verdadeiro ou falso",
        "topics":[{"id": ""+topicid}],
        "baseCode": "linha 1\nlinha2\nlinha3\nlinha4\nlinha5\nlinha6\nlinha7",
        "baseLanguage": { id: languageId },
        "blankLines": [1, 5],
        "description":"<p>Descrição do meu problema com mais de quarenta e nove caracteres</p>",
        "source":"fonte"}, 200, done);
      });

      var choices, problemId;

      var algorithmProblemId, quizOnlyId, fillTheCodeId;

      it('should save quiz only problem', function(done) {
        testProblem({
          "level":1,
          "timeLimit":1,
          "name":"Meu problema de prova",
          "topics":[{"id": ""+topicid}],
          "description":"<p>Descrição do meu problema com mais de quarenta e nove caracteres</p>",
          "inputFormat":"<p>123123</p>",
          "outputFormat":"<p>123123</p>",
          "source":"fonte",
          "quizOnly": "true"
        }, 200, done);
      });

      it('should list 5 problems', function(done) {
        requests
          .get('/v1/problems?status=PENDING')
          .set('Authorization', 'Bearer ' + shared.adminToken)
          .expect(function(res) {
            if (res.body.length !== 6) throw new Error();

            res.body.forEach(function(prob) {
              if (!prob.problemType) throw new Error('no problem type');
              if (prob.problemType === 'ALGORITHM' && !prob.inputFormat) throw new Error();
              if (prob.problemType === 'MULTIPLE_CHOICE' && !prob.choices.length) throw new Error();
              if (prob.problemType === 'SINGLE_CHOICE' && !prob.choices.length) throw new Error();
              if (prob.problemType === 'TRUE_OR_FALSE' && !prob.choices.length) throw new Error();
              if (prob.problemType === 'FILL_THE_CODE' && (!prob.baseCode || prob.blankLines.length < 2)) throw new Error();

              if (prob.problemType === 'MULTIPLE_CHOICE') {
                problemId = prob.id;
                choices = prob.choices;
              } else if (prob.problemType === 'ALGORITHM') {
                if (prob.quizOnly) {
                  quizOnlyId = prob.id;
                } else {
                  algorithmProblemId = prob.id;
                }
              } else if (prob.problemType === 'FILL_THE_CODE') {
                fillTheCodeId = prob.id;
              }
            })
          })
          .end(done);
      });

      it('should update choices', function(done) {

        runMethod('put', '/v1/problems/' + problemId, {
          "problemType": 'MULTIPLE_CHOICE',
          "level":2,
          "timeLimit":1,
          "name":"Meu problema de multipla escolha update",
          "topics":[{"id": ""+topicid}],
          "choices": [
            choices[0],
            { description: "m2 nova errada", correct: false },
            { description: "m2 nova errada 2", correct: false },
          ],
          "description":"<p>Descrição do meu problema com mais de quarenta e nove caracteres</p>",
          "source":"fonte"
        }, 200, done);
      });

      it('should have 3 choices', function(done) {
        requests
          .get('/v1/problems/' + problemId)
          .set('Authorization', 'Bearer ' + shared.adminToken)
          .expect(function(res) {
            if (res.body.choices.length !== 3) throw new Error();
          }).end(done);
      });

      it('should approve problem', function(done) {
        requests
        .put('/v1/problems/' + problemId + '/accept')
        .set('Authorization', 'Bearer ' + shared.adminToken)
        .expect(200)
        .end(done);
      });

      it('should approve quiz only problem', function(done) {
        requests
        .put('/v1/problems/' + quizOnlyId + '/accept')
        .set('Authorization', 'Bearer ' + shared.adminToken)
        .expect(200)
        .end(done);
      });

      it('should send submission', function(done) {
        requests
        .post('/v1/user/problems/' + algorithmProblemId + '/submissions').type('json')
        .set('Authorization', 'Bearer ' + shared.adminToken)
        .send(JSON.stringify({
          language: { id: languageId },
          code: '3,3,CORRECT,2'
        }))
        .expect(200)
        .end(done);
      });

      it('should send multiple choice submission', function(done) {
        requests
        .post('/v1/user/problems/' + problemId + '/submissions').type('json')
        .set('Authorization', 'Bearer ' + shared.adminToken)
        .send(JSON.stringify({
          choices: [choices[1].id]
        }))
        .expect(200, function(err, res) {
          done();
        });
      });

      it('should send correct multiple choice submission', function(done) {
        requests
        .post('/v1/user/problems/' + problemId + '/submissions').type('json')
        .set('Authorization', 'Bearer ' + shared.adminToken)
        .send(JSON.stringify({
          choices: [choices[0].id]
        }))
        .expect(200, function(err, res) {
          done();
        });
      });

      it('should list submissions', function(done) {
        requests
        .get('/v1/user/submissions')
        .set('Authorization', 'Bearer ' + shared.adminToken)
        .expect(function(res) {
          if (res.body.length !== 2) throw new Error('differente length ' + res.body.length);
          if (res.body[0].evaluation !== 'CORRECT') throw new Error('different evaluation ' + res.body[0].evaluation);
        })
        .end(done);
      });

      it('should send fill the code', function(done) {
          requests
          .post('/v1/user/problems/' + fillTheCodeId + '/submissions').type('json')
          .set('Authorization', 'Bearer ' + shared.studentToken)
          .send(JSON.stringify({
            codeParts: [
              { lineNumber: 1,  code: '4,3,WRONG_ANSWER,1' },
              { lineNumber: 5,  code: 'nova linha 5' }
            ]
          }))
          .expect(200).end(done);
      });

      it('should not show correct answers', function(done) {
          requests
          .get('/v1/problems')
          .set('Authorization', 'Bearer ' + shared.studentToken)
          .expect(function(res) {
            res.body[0].choices.forEach(function(choice) {
              if (choice.correct) throw new Error();
            });
          }).end(done);
      });

      it('should list one problem', function(done) {
        requests
          .get('/v1/problems?status=PENDING')
          .set('Authorization', 'Bearer ' + shared.studentToken)
          .expect(function(res) {
            if (res.body.length !== 1) throw new Error();
            assert(res.body[0].id === problemId, 'id do problema não é ' + problemId);
            assert(res.body[0].quizOnly === false, 'problema não deveria ser quizOnly');
          })
          .end(done);
      });

      it('should translate algorithm problem', function(done) {
        requests
          .put('/v1/problems/' + algorithmProblemId + '/translate')
          .set('Authorization', 'Bearer ' + shared.teacherToken)
          .type('json')
          .send(JSON.stringify({
            locale: 'en_US',
            name: 'In english',
            description: 'My english description with more then 49 characteres',
            inputFormat: '123',
            outputFormat: '456'
          }))
          .expect(function(res) {
            assert(res.status === 200);
          })
          .end(done);
      });

    it('should list no problem', function(done) {
      requests
        .get('/v1/problems')
        .set('Authorization', 'Bearer ' + shared.englishToken)
        .expect(function(res) {
          assert.equal(res.body.length, 0);
        })
        .end(done);
    });

    it('should approve problem', function(done) {
        requests
            .put('/v1/problems/' + algorithmProblemId + '/accept')
            .set('Authorization', 'Bearer ' + shared.adminToken)
            .expect(200)
            .end(done);
    });

    it('should list one problem', function(done) {
        requests
            .get('/v1/problems')
            .set('Authorization', 'Bearer ' + shared.englishToken)
            .expect(function(res) {
                assert.equal(res.body.length,1);
                assert(res.body[0].id === algorithmProblemId, 'id do problema não é ' + algorithmProblemId);
                assert(res.body[0].quizOnly === false, 'problema não deveria ser quizOnly');
            })
            .end(done);
    });
});
