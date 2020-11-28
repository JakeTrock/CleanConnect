const unirest = require('unirest');
const waterfall = require('async-waterfall');
const Sequelize = require('sequelize');

const prefix = "http://localhost:3000/dev/backend";
const defaultBody = {
    "content-type": "application/json"
};
var authNoBody, authBody, token, verlnk, userDetails, userInv, userTags;

function request(reqBody, callback) {
    console.log("{"+reqBody.routing.central + "/" + reqBody.routing.secondary + "\n==================================\n");
    var req = unirest("POST", prefix);

    req.headers(defaultBody);
    req.type("json");
    req.send(reqBody);

    req.end(function (res) {
        if (res.error) {
            console.log(res.body);
            throw new Error(res.error);
        }
        console.log(JSON.stringify(res.body) + "\n==================================\n");

        if (reqBody.routing.central + reqBody.routing.secondary == "usrresend" ||
            reqBody.routing.central + reqBody.routing.secondary == "usrcreate" ||
            reqBody.routing.central + reqBody.routing.secondary == "usrchangeReq" ||
            reqBody.routing.central + reqBody.routing.secondary == "usrresetPassReq" ||
            reqBody.routing.central + reqBody.routing.secondary == "usrresend" ||
            reqBody.routing.central + reqBody.routing.secondary == "usrremoveReq") verlnk = res.body.status;

        if (reqBody.routing.central + reqBody.routing.secondary == "usrlogin") {
            authBody = token = res.body.token;
        }
        if (reqBody.routing.central + reqBody.routing.secondary == "usrcurrent") userDetails = res.body;
        if (reqBody.routing.central + reqBody.routing.secondary == "taggetAll") userTags = res.body.tags;
        if (reqBody.routing.central + reqBody.routing.secondary == "inventorygetAll") userInv = res.body.invs;
        callback();
        return JSON.stringify(res.body);
    });
}

waterfall([
        //(Reset DB)=====================================================================================
        // (callback) => {
        //     new Sequelize( "database-1", "ccdef", "Ly3v1372TJ4thXx0GSye", {
        //         host: "database-1.ccgwsnlzm4yj.us-east-1.rds.amazonaws.com",
        //         port: 5432,
        //         dialect: 'postgres',
        //     }).drop();
        // },
        //(user testzzz)=================================================================================
        //cre8 acct
        (callback) => {
            request({
                "routing": {
                    "central": "user",
                    "secondary": "create"
                },
                "data": {
                    "name": "testAccount",
                    "email": "fake@test.com",
                    "password": "test123",
                    "password2": "test123",
                    "payment_method_nonce": "fake-valid-nonce",
                    "phone": "666.666.6666",
                    "tier": 1
                },
            }, callback)
        },
        //isvalid check
        (callback) => {
            request({
                "routing": {
                    "central": "user",
                    "secondary": "isValid",
                    "authorization":authBody
                },
                "data": {}
            }, callback)
        },
        //res3nd verif
        (callback) => {
            request({
                "routing": {
                    "central": "user",
                    "secondary": "resend"
                },
                "data": {
                    "email": "fake@test.com"
                },
            }, callback)
        },
        //verify dat acct
        (callback) => {
            request({
                "routing": {
                    "central": "user",
                    "secondary": "confirm"
                },
                "data": {}
            }, callback)
        },
        //log in
        (callback) => {
            request({
                "routing": {
                    "central": "user",
                    "secondary": "login"
                },
                "data": {
                    "email": "fake@test.com",
                    "password": "test123"
                },
            }, callback)
        },
        //ask 2 change doze acct deetz
        (callback) => {
            request({
                "routing": {
                    "central": "user",
                    "secondary": "changeReq",
                    authorization: authBody
                },
                "data": {}
            }, callback)
        },
        //change doze acct deetz
        (callback) => {
            request({
                "routing": {
                    "central": "user",
                    "secondary": "change",
                    token1: verlnk,
                    authorization: authBody
                },
                "data": {
                    "email": "fake2@test.com",
                    "tier": "2",
                    "name": "newName",
                    "phone": "666.666.6667",
                    "payment_method_nonce": "fake-valid-nonce"
                },
            }, callback)
        },
        //reset me passwerd
        (callback) => {
            request({
                "routing": {
                    "central": "user",
                    "secondary": "resetPassReq"
                },
                "data": {
                    "email": "fake2@test.com"
                },
            }, callback)
        },
        (callback) => {
            request({
                "routing": {
                    "central": "user",
                    "secondary": "resetPass",
                    token1: verlnk
                },
                "data": {
                    "email": "fake2@test.com",
                    "phone": "666.666.6667",
                    "password": "newpass1234",
                    "password2": "newpass1234"
                },
            }, callback)
        },
        //login again
        (callback) => {
            request({
                "routing": {
                    "central": "user",
                    "secondary": "login"
                },
                "data": {
                    "email": "fake2@test.com",
                    "password": "newpass1234"
                },
            }, callback)
        },
        //client tokenz just 4 funziez
        (callback) => {
            request({
                "routing": {
                    "central": "user",
                    "secondary": "getClientToken"
                },
                "data": {}
            }, callback)
        },
        (callback) => {
            request({
                "routing": {
                    "central": "user",
                    "secondary": "getAuthClientToken",
                    authorization: authBody
                },
                "data": {}
            }, callback)
        },
        //grab da deetz
        (callback) => {
            request({
                "routing": {
                    "central": "user",
                    "secondary": "current",
                    authorization: authBody
                },
                "data": {}
            }, callback)
        },
        //(tag testzzzzzzzz)================================================================================
        (callback) => {
            for (var i = 1; i < 21; i++) {
                request({
                    "routing": {
                        "central": "tag",
                        "secondary": "create",
                        authorization: authBody
                    },
                    "data": {
                        "name": "room " + i
                    },
                }, () => {
                    if (i == 20) callback
                })
            }
        },
        (callback) => {
            request({
                "routing": {
                    "central": "tag",
                    "secondary": "getAll",
                    authorization: authBody
                },
                "data": {
                    "showDead": false
                },
            }, callback)
        },
        (callback) => {
            request({
                "routing": {
                    "central": "tag",
                    "secondary": "getOne",
                    token1: userTags[0]._id,
                    authorization: authBody
                },
                "data": {}
            }, callback)
        },
        (callback) => {
            request({
                "routing": {
                    "central": "tag",
                    "secondary": "getOne",
                    token1: userTags[18]._id,
                    authorization: authBody
                },
                "data": {}
            }, callback)
        },
        (callback) => {
            request({
                "routing": {
                    "central": "tag",
                    "secondary": "edit",
                    token1: userTags[15]._id,
                    authorization: authBody
                },
                "data": {
                    "name": "room z"
                },
            }, callback)
        },
        (callback) => {
            request({
                "routing": {
                    "central": "tag",
                    "secondary": "remove",
                    token1: userTags[10]._id,
                    authorization: authBody
                },
                "data": {}
            }, callback)
        },
        //(comment testzzzzzzzz)============================================================================
        (callback) => {
            for (var i = 0; i < 21; i++) {
                request({
                    "routing": {
                        "central": "comment",
                        "secondary": "create",
                        token1: userTags[i]._id
                    },
                    "data": {
                        "image": "data:image/jpeg;base64,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",
                        "text": "dsfjdsjfdsjfksdjfksdjfkdsfjkdfjkdsfjksdfjsfksdjfkdsfjskdfdjsk",
                        "sev": "2"
                    },
                }, () => {
                    if (i == 20) callback
                })
            }
        },
        (callback) => {
            request({
                "routing": {
                    "central": "tag",
                    "secondary": "getAll",
                    authorization: authBody
                },
                "data": {
                    "showDead": false
                },
            }, callback)
        },
        (callback) => {
            request({
                "routing": {
                    "central": "comment",
                    "secondary": "remove",
                    token1: userTags[0]._id,
                    token2: userTags[0].comments[0]._id
                },
                "data": {}
            }, callback)
        },
        (callback) => {
            request({
                "routing": {
                    "central": "comment",
                    "secondary": "remove",
                    token1: userTags[1]._id,
                    token2: userTags[1].comments[0]._id
                },
                "data": {}
            }, callback)
        },
        (callback) => {
            request({
                "routing": {
                    "central": "comment",
                    "secondary": "restore",
                    token1: userTags[0]._id,
                    token2: userTags[0].comments[0]._id
                },
                "data": {}
            }, callback)
        },
        //(inventory testzzzzzzzz)==========================================================================
        (callback) => {
            for (var i = 1; i < 16; i++) {
                request({
                    "routing": {
                        "central": "inventory",
                        "secondary": "create",
                        authorization: authBody
                    },
                    "data": {
                        "name": "storage " + i
                    },
                }, () => {
                    if (i == 15) callback
                })
            }
        },
        (callback) => {
            request({
                "routing": {
                    "central": "inventory",
                    "secondary": "getAll",
                    authorization: authBody
                },
                "data": {
                    "showDead": false
                },
            }, callback)
        },
        (callback) => {
            request({
                "routing": {
                    "central": "inventory",
                    "secondary": "edit",
                    token1: userInv[0]._id,
                    authorization: authBody
                },
                "data": {
                    "name": "super duper secret room"
                },
            }, callback)
        },
        (callback) => {
            request({
                "routing": {
                    "central": "inventory",
                    "secondary": "remove",
                    token1: userInv[4]._id,
                    authorization: authBody
                },
                "data": {}
            }, callback)
        },
        (callback) => {
            for (var i = 1; i < 16; i++) {
                if (i != 4)
                    request({
                        "routing": {
                            "central": "item",
                            "secondary": "create",
                            "token1": userInv[i]._id
                        },
                        "data": {
                            "name": "industrial strength cleanser " + i,
                            "maxQuant": 100,
                            "minQuant": 20,
                            "curQuant": 37
                        },
                    }, () => {
                        if (i == 15) callback
                    })
            }
        },
        (callback) => {
            request({
                "routing": {
                    "central": "inventory",
                    "secondary": "exists",
                    token1: userInv[5]._id
                },
                "data": {}
            }, callback)
        },
        (callback) => {
            request({
                "routing": {
                    "central": "inventory",
                    "secondary": "getOne",
                    "authorization": authBody,
                    token1: userInv[5]._id
                },
                "data": {}
            }, callback)
        },
        (callback) => {
            request({
                "routing": {
                    "central": "inventory",
                    "secondary": "getAll",
                    "authorization": authBody
                },
                "data": {
                    "showDead": false
                },
            }, callback)
        },
        (callback) => {
            request({
                "routing": {
                    "central": "item",
                    "secondary": "updQnt",
                    token1: userInv[5]._id,
                    token2: userInv[5].items[0]._id
                },
                "data": {
                    "newVal": 4
                },
            }, callback)
        },
        (callback) => {
            request({
                "routing": {
                    "central": "item",
                    "secondary": "edit",
                    token1: userInv[4]._id,
                    token2: userInv[4].items[0]._id
                },
                "data": {
                    "name": "industrial strength cleanser",
                    "maxQuant": 1000,
                    "minQuant": 2
                },
            }, callback)
        },
        (callback) => {
            request({
                "routing": {
                    "central": "item",
                    "secondary": "remove",
                    token1: userInv[3]._id,
                    token2: userInv[3].items[0]._id
                },
                "data": {}
            }, callback)
        },
        //(kleenup)=========================================================================================
        (callback) => {
            request({
                "routing": {
                    "central": "user",
                    "secondary": "removeReq",
                    "authorization": authBody
                },
                "data": {}
            }, callback)
        },
        (callback) => {
            request({
                "routing": {
                    "central": "user",
                    "secondary": "remove",
                    "authorization": authBody
                },
                "data": {}
            }, callback)
        },
        function (callback) {
            callback();
        }
    ],
    function () {
        console.log("PASSED ALL TESTS!");
    });