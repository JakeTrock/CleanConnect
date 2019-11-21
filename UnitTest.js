var supertest = require("supertest");
var should = require("should");

var backend = supertest.agent("http://localhost:5000");
var frontend = supertest.agent("http://localhost:3000");

describe("Now conducting unit test of backend users...",function(){
  it("should return user status code 200",function(done){
    backend.get("/user/test").expect("Content-type",/text/).expect(200).end(function(err,res){
      res.status.should.equal(200);
      done();
    });
  });
});
describe("Now conducting unit test of backend tags...",function(){
  it("should return tag status code 200",function(done){
    backend.get("/tag/test").expect("Content-type",/text/).expect(200).end(function(err,res){
      res.status.should.equal(200);
      done();
    });
  });
});

describe("Now conducting unit test of frontend...",function(){
  it("should return home page",function(done){
    frontend.get("/").expect("Content-type",/text/).expect(200).end(function(err,res){
      res.status.should.equal(200);
      done();
    });
  });
});
