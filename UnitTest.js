const supertest = require("supertest");
const should = require("should");

const backend = supertest.agent("http://localhost:5000");
const frontend = supertest.agent("http://localhost:3000");
var verif, token, info, tagArray;
//ADD THINGY TO RETURN ERRORS IF STATUS NOT 200

////backend
describe("Now conducting unit test of backend users...", function () {
  it("should return user status code 200", function (done) {
    backend.get("/user/test").expect("Content-type", /text/).expect(200).end(function (err, res) {
      res.status.should.equal(200);
      done();
    });
  });
});
describe("Now conducting unit test of backend tags...", function () {
  it("should return tag status code 200", function (done) {
    backend.get("/tag/test").expect("Content-type", /text/).expect(200).end(function (err, res) {
      res.status.should.equal(200);
      done();
    });
  });
});
describe("Creating account...", function () {
  it("should return tag status code 200", function (done) {
    backend.post("/user/register").send({
      "name": "testAccount4",
      "email": "fake@test.com",
      "password": "test123",
      "password2": "test123"
    }).expect("Content-type", /json/).expect(200).end(function (err, res) {
      res.status.should.equal(200);
      res.body.status.should.equal(true);
      verif = res.body.email;
      done();
    });
  });
});

describe("Verifying account...", function () {
  it("should return tag status code 200", function (done) {
    backend.get(verif).end(function (err, res) {
      // res.status.should.equal(200);
      res.header['location'].should.include('/login');
      done();
    });
  });
});
describe("Logging in...", function () {
  it("should return tag status code 200", function (done) {
    backend.post("/user/login").send({
      "email": "fake@test.com",
      "password": "test123",
    }).expect("Content-type", /json/).expect(200).end(function (err, res) {
      res.status.should.equal(200);
      res.body.success.should.equal(true);
      token = res.body.token;
      done();
    });
  });
});
describe("Getting user info...", function () {
  it("should return tag status code 200", function (done) {
    var tn = "room" + Math.random().toString(36).substring(11);
    backend.get("/user/current").set({
      "Authorization": token
    }).send({}).expect("Content-type", /json/).expect(200).end(function (err, res) {
      res.status.should.equal(200);
      info = res.body;
    });
    done();
  });
});
describe("Creating 20 tags...", function () {
  it("should return tag status code 200", function (done) {
    for (var v = 0; v < 20; v++) {
      var tn = "room" + Math.random().toString(36).substring(11);
      backend.set({
        "Authorization": token
      }).post("/tag/new").send({
        "name": tn
      }).expect("Content-type", /json/).expect(200).end(function (err, res) {
        res.status.should.equal(200);
        res.body.name.should.equal(tn);
        res.body.hasOwnProperty('tagid').should.equal(true);
      });
    }
    done();
  });
});
describe("Getting all tag info...", function () {
  it("should return tag status code 200", function (done) {
    backend.post("/tag/" + info._id).set({
      "Authorization": token
    }).send({}).expect("Content-type", /json/).expect(200).end(function (err, res) {
      res.status.should.equal(200);
      tagArray = res.body;
    });
    done();
  });
});
describe("Commenting on 20 tags...", function () {
  it("should return tag status code 200", function (done) {
    for (var v = 0; v < 20; v++) {
      backend.post("/tag/new") .set('Accept', 'application.json')
      .field('text', 'testing text')
      .field('sev', 1)
      .attach('img', __dirname + '/testing.jpg')
      .expect("Content-type", /json/).expect(200).end(function (err, res) {
        res.status.should.equal(200);
        res.body.comments[0].sev.should.equal(1);
        res.body.comments[0].text.should.equal('testing text');
      });
    }
    done();
  });
});
describe("Printing on 20 tags...", function () {
  it("should return tag status code 200", function (done) {
      backend.post("/tag/print") .set('Accept', 'application.json')
      .expect("Content-type", /json/).expect(200).end(function (err, res) {
        res.status.should.equal(200);
        res.header['location'].should.include('/pdf')
      });
    }
    done();
  });
});
describe("Deleting 5 tags...", function () {
  it("should return tag status code 200", function (done) {
    for (var v = 0; v < 5; v++) {
      backend.delete("/tag/"+tagArray[v].tagid) .set('Accept', 'application.json')
      .expect("Content-type", /json/).expect(200).end(function (err, res) {
        res.status.should.equal(200);
        res.body.success.should.equal(true);
        res.header['location'].should.include('/pdf')
      });
    }
    done();
  });
});
describe("Printing on 15 tags...", function () {
  it("should return tag status code 200", function (done) {
      backend.post("/tag/print") .set('Accept', 'application.json')
      .expect("Content-type", /json/).expect(200).end(function (err, res) {
        res.status.should.equal(200);
        res.header['location'].should.include('/pdf')
      });
    }
    done();
  });
});
////frontend
describe("Now conducting unit test of frontend...", function () {
  it("should return home page", function (done) {
    frontend.get("/").expect("Content-type", /text/).expect(200).end(function (err, res) {
      res.status.should.equal(200);
      done();
    });
  });
});
