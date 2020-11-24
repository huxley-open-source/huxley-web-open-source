var pg = require('pg');

var config = {
  user: 'huxley', //env var: PGUSER
  database: 'huxley-test', //env var: PGDATABASE
  password: '123456', //env var: PGPASSWORD
  host: 'localhost', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
};

var pool = new pg.Pool(config);

var query = "TRUNCATE public.user, user_role, role, problem, problem_i18n, problem_i18n_aud,institution, topic, language, topic_i18n, problem_choice, problem_choice_i18n, user_group, submission CASCADE;"
+ "insert into institution (id, version,name,phone,logo,status) values (1, 0, 'Huxley', '00', 'default.png', 0);"
+ "insert into public.user (id, version, name, email, username, password, date_created, last_updated, avatar, institution_id, account_expired, account_locked, enabled, password_expired) "
+ "values (1, 0, 'Huxley', 'huxley@thehuxley.com', 'admin',"
+ "'ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413',"
+ "now(), now(),'0f5b02654056f68b61088d8fb5815c903278123c.png',1,false,false,true,false);"
+ "insert into role values (1,1,'ROLE_ADMIN');"
+ "insert into role values (2,1,'ROLE_STUDENT');"
+ "insert into role values (3,1,'ROLE_TEACHER');"
+ "insert into role values (4,1,'ROLE_TEACHER_ASSISTANT');"
+ "insert into role values (5,1,'ROLE_ADMIN_INST');"
+ "insert into user_role values (1, 1);";

describe('PG', function() {
    it('should run', function(done) {

        pool.connect(function(err, client, _done) {
            if(err) {
                console.error('error fetching client from pool', err);
            }

            client.query(query, function(err, result) {
                done();
                _done();
                if(err) {
                    console.error('error running query', err);
                }

            });
        });
    })
});


