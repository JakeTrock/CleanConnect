var unirest = require("unirest");
var waterfall = require('async-waterfall');
const prefix = "http://localhost:5000";
const mongoose = require('mongoose');
const defaultBody = {
    "content-type": "application/json"
};
var authNoBody, authBody, token, verlnk, userDetails, userInv, userTags, pdfname;

function request(reqType, url, headers, bodyType, reqBody, callback) {
    console.log(url + "\n==================================\n");
    var req = unirest(reqType, prefix + url);

    if (headers != "") req.headers(headers);
    if (bodyType != "") req.type(bodyType);
    if (reqBody != "") req.send(reqBody);

    req.end(function (res) {
        if (res.error) {
            console.log(res.body);
            throw new Error(res.error);
        }
        console.log(JSON.stringify(res.body) + "\n==================================\n");
        if (url == "/user/resend" || url == "/user/register" || url == "/user/changeinfo/" || url == "/user/resetPass/" || url == "/user/resend" || url == "/user/deleteinfo") verlnk = res.body.link.split("/")[5];

        if (url == "/user/login") {
            token = res.body.token;
            authBody = {
                "content-type": "application/json",
                "authorization": token
            };
            authNoBody = {
                "authorization": token
            };
        }
        if (url == "/user/current") userDetails = res.body;
        // if (url == "/tag/print/") pdfname = res.body.filename;
        if (url == "/tag/getall") userTags = res.body;
        if (url == "/inventory/getall") userInv = res.body;
        callback();
        return JSON.stringify(res.body);
    });
}

waterfall([
        //(Reset DB)=====================================================================================
        (callback) => {
            mongoose.connect('mongodb://localhost/CleanConnectDev', function () {
                mongoose.connection.db.dropDatabase();
                callback();
            })
        },
        //(generic testz)================================================================================
        (callback) => {
            request("GET", "/user/test", "", "", "", callback)
        },
        (callback) => {
            request("GET", "/tag/test", "", "", "", callback)
        },
        (callback) => {
            request("GET", "/inventory/test", "", "", "", callback)
        },
        (callback) => {
            request("GET", "/comment/test", "", "", "", callback)
        },
        //(user testzzz)=================================================================================
        //cre8 acct
        (callback) => {
            request("POST", "/user/register", defaultBody, "json", {
                "name": "testAccount",
                "email": "fake@test.com",
                "password": "test123",
                "password2": "test123",
                "payment_method_nonce": "fake-valid-nonce",
                "phone": "666.666.6666",
                "tier": 1
            }, callback)
        },
        //isvalid check
        (callback) => {
            request("GET", "/user/isValid/" + verlnk, "", "", "", callback)
        },
        //res3nd verif
        (callback) => {
            request("POST", "/user/resend", defaultBody, "json", {
                "email": "fake@test.com"
            }, callback)
        },
        //verify dat acct
        (callback) => {
            request("GET", "/user/confirm/" + verlnk, "", "", "", callback)
        },
        //log in
        (callback) => {
            request("POST", "/user/login", defaultBody, "json", {
                "email": "fake@test.com",
                "password": "test123"
            }, callback)
        },
        //ask 2 change doze acct deetz
        (callback) => {
            request("POST", "/user/changeinfo/", authNoBody, "", "", callback)
        },
        //change doze acct deetz
        (callback) => {
            request("POST", "/user/change/" + verlnk, authBody, "json", {
                "email": "fake2@test.com",
                "tier": "2",
                "name": "newName",
                "phone": "666.666.6667",
                "payment_method_nonce": "fake-valid-nonce"
            }, callback)
        },
        //reset me passwerd
        (callback) => {
            request("POST", "/user/resetPass/", defaultBody, "json", {
                "email": "fake2@test.com"
            }, callback)
        },
        (callback) => {
            request("POST", "/user/resetPass/" + verlnk, defaultBody, "json", {
                "email": "fake2@test.com",
                "phone": "666.666.6667",
                "password1": "newpass1234",
                "password2": "newpass1234"
            }, callback)
        },
        //login again
        (callback) => {
            request("POST", "/user/login", defaultBody, "json", {
                "email": "fake2@test.com",
                "password": "newpass1234"
            }, callback)
        },
        //client tokenz just 4 funziez
        (callback) => {
            request("GET", "/user/getClientToken", "", "", "", callback)
        },
        (callback) => {
            request("GET", "/user/getAuthClientToken", authNoBody, "", "", callback)
        },
        //grab da deetz
        (callback) => {
            request("GET", "/user/current", authNoBody, "", "", callback)
        },
        //(tag testzzzzzzzz)================================================================================
        (callback) => {
            request("POST", "/tag/new", authBody, "json", {
                "name": "room 1"
            }, callback)
        },
        (callback) => {
            request("POST", "/tag/new", authBody, "json", {
                "name": "room 2"
            }, callback)
        },
        (callback) => {
            request("POST", "/tag/new", authBody, "json", {
                "name": "room 3"
            }, callback)
        },
        (callback) => {
            request("POST", "/tag/new", authBody, "json", {
                "name": "room 4"
            }, callback)
        },
        (callback) => {
            request("POST", "/tag/new", authBody, "json", {
                "name": "room 5"
            }, callback)
        },
        (callback) => {
            request("POST", "/tag/new", authBody, "json", {
                "name": "room 6"
            }, callback)
        },
        (callback) => {
            request("POST", "/tag/new", authBody, "json", {
                "name": "room 7"
            }, callback)
        },
        (callback) => {
            request("POST", "/tag/new", authBody, "json", {
                "name": "room 8"
            }, callback)
        },
        (callback) => {
            request("POST", "/tag/new", authBody, "json", {
                "name": "room 9"
            }, callback)
        },
        (callback) => {
            request("POST", "/tag/new", authBody, "json", {
                "name": "room 10"
            }, callback)
        },
        (callback) => {
            request("POST", "/tag/new", authBody, "json", {
                "name": "room 11"
            }, callback)
        },
        (callback) => {
            request("POST", "/tag/new", authBody, "json", {
                "name": "room 12"
            }, callback)
        },
        (callback) => {
            request("POST", "/tag/new", authBody, "json", {
                "name": "room 13"
            }, callback)
        },
        (callback) => {
            request("POST", "/tag/new", authBody, "json", {
                "name": "room 14"
            }, callback)
        },
        (callback) => {
            request("POST", "/tag/new", authBody, "json", {
                "name": "room 15"
            }, callback)
        },
        (callback) => {
            request("POST", "/tag/new", authBody, "json", {
                "name": "room 16"
            }, callback)
        },
        (callback) => {
            request("POST", "/tag/new", authBody, "json", {
                "name": "room 17"
            }, callback)
        },
        (callback) => {
            request("POST", "/tag/new", authBody, "json", {
                "name": "room 18"
            }, callback)
        },
        (callback) => {
            request("POST", "/tag/new", authBody, "json", {
                "name": "room 19"
            }, callback)
        },
        (callback) => {
            request("POST", "/tag/new", authBody, "json", {
                "name": "room 20"
            }, callback)
        },
        (callback) => {
            request("POST", "/tag/getall", authBody, "json", {
                "showDead": false
            }, callback)
        },
        (callback) => {
            request("GET", "/tag/getone/" + userTags[0]._id, authNoBody, "", "", callback)
        },
        (callback) => {
            request("GET", "/tag/getone/" + userTags[18]._id, authNoBody, "", "", callback)
        },
        (callback) => {
            request("POST", "/tag/edit/" + userTags[15]._id, authBody, "json", {
                "name": "room z"
            }, callback)
        },
        (callback) => {
            request("DELETE", "/tag/delete/" + userTags[10]._id, authNoBody, "", "", callback)
        },
        // (callback) => {
        //     request("POST", "/tag/print/", authBody, "json", {
        //         "printIteration": [
        //             1, 3, 1, 2, 2, 3, 1, 4, 3, 2, 4, 2, 1, 2, 1, 2, 1, 3, 5
        //         ]
        //     }, callback)
        // },
        //(comment testzzzzzzzz)============================================================================
        (callback) => {
            console.log("/comment/new/" + userTags[0]._id + "\n================================\n");
            var req = unirest("POST", prefix + "/comment/new/" + userTags[0]._id);
            req.headers({
                "content-type": "multipart/form-data; boundary=---011000010111000001101001"
            });

            req.field("text", "testing");
            req.field("sev", "2");

            req.end(function (res) {
                if (res.error) throw new Error(res.body + "\n\n" + res.error);
                console.log(res.body + "\n================================\n");
                callback();
            });
        },
        (callback) => {
            console.log("/comment/new/" + userTags[1]._id + "\n================================\n");
            var req = unirest("POST", prefix + "/comment/new/" + userTags[1]._id);
            req.headers({
                "content-type": "multipart/form-data; boundary=---011000010111000001101001"
            });

            req.field("text", "testing");
            req.field("sev", "2");

            req.end(function (res) {
                if (res.error) throw new Error(res.body + "\n\n" + res.error);
                console.log(res.body + "\n================================\n");
                callback();
            });
        },
        (callback) => {
            console.log("/comment/new/" + userTags[2]._id + "\n================================\n");
            var req = unirest("POST", prefix + "/comment/new/" + userTags[2]._id);
            req.headers({
                "content-type": "multipart/form-data; boundary=---011000010111000001101001"
            });

            req.field("text", "testing");
            req.field("sev", "2");

            req.end(function (res) {
                if (res.error) throw new Error(res.body + "\n\n" + res.error);
                console.log(res.body + "\n================================\n");
                callback();
            });
        },
        (callback) => {
            console.log("/comment/new/" + userTags[3]._id + "\n================================\n");
            var req = unirest("POST", prefix + "/comment/new/" + userTags[3]._id);
            req.headers({
                "content-type": "multipart/form-data; boundary=---011000010111000001101001"
            });

            req.field("text", "testing");
            req.field("sev", "2");

            req.end(function (res) {
                if (res.error) throw new Error(res.body + "\n\n" + res.error);
                console.log(res.body + "\n================================\n");
                callback();
            });
        },
        (callback) => {
            console.log("/comment/new/" + userTags[4]._id + "\n================================\n");
            var req = unirest("POST", prefix + "/comment/new/" + userTags[4]._id);
            req.headers({
                "content-type": "multipart/form-data; boundary=---011000010111000001101001"
            });

            req.field("text", "testing");
            req.field("sev", "2");

            req.end(function (res) {
                if (res.error) throw new Error(res.body + "\n\n" + res.error);
                console.log(res.body + "\n================================\n");
                callback();
            });
        },
        (callback) => {
            console.log("/comment/new/" + userTags[5]._id + "\n================================\n");
            var req = unirest("POST", prefix + "/comment/new/" + userTags[5]._id);
            req.headers({
                "content-type": "multipart/form-data; boundary=---011000010111000001101001"
            });

            req.field("text", "testing");
            req.field("sev", "2");

            req.end(function (res) {
                if (res.error) throw new Error(res.body + "\n\n" + res.error);
                console.log(res.body + "\n================================\n");
                callback();
            });
        },
        (callback) => {
            console.log("/comment/new/" + userTags[6]._id + "\n================================\n");
            var req = unirest("POST", prefix + "/comment/new/" + userTags[6]._id);
            req.headers({
                "content-type": "multipart/form-data; boundary=---011000010111000001101001"
            });

            req.field("text", "testing");
            req.field("sev", "2");

            req.end(function (res) {
                if (res.error) throw new Error(res.body + "\n\n" + res.error);
                console.log(res.body + "\n================================\n");
                callback();
            });
        },
        (callback) => {
            console.log("/comment/new/" + userTags[7]._id + "\n================================\n");
            var req = unirest("POST", prefix + "/comment/new/" + userTags[7]._id);
            req.headers({
                "content-type": "multipart/form-data; boundary=---011000010111000001101001"
            });

            req.field("text", "testing");
            req.field("sev", "2");

            req.end(function (res) {
                if (res.error) throw new Error(res.body + "\n\n" + res.error);
                console.log(res.body + "\n================================\n");
                callback();
            });
        },
        (callback) => {
            console.log("/comment/new/" + userTags[8]._id + "\n================================\n");
            var req = unirest("POST", prefix + "/comment/new/" + userTags[8]._id);
            req.headers({
                "content-type": "multipart/form-data; boundary=---011000010111000001101001"
            });

            req.field("text", "testing");
            req.field("sev", "2");

            req.end(function (res) {
                if (res.error) throw new Error(res.body + "\n\n" + res.error);
                console.log(res.body + "\n================================\n");
                callback();
            });
        },
        (callback) => {
            console.log("/comment/new/" + userTags[9]._id + "\n================================\n");
            var req = unirest("POST", prefix + "/comment/new/" + userTags[9]._id);
            req.headers({
                "content-type": "multipart/form-data; boundary=---011000010111000001101001"
            });

            req.field("text", "testing");
            req.field("sev", "2");

            req.end(function (res) {
                if (res.error) throw new Error(res.body + "\n\n" + res.error);
                console.log(res.body + "\n================================\n");
                callback();
            });
        },
        (callback) => {
            request("POST", "/tag/getall", authBody, "json", {
                "showDead": false
            }, callback)
        },
        (callback) => {
            request("DELETE", "/comment/delete/" + userTags[0]._id + "/" + userTags[0].comments[0]._id, "", "", "", callback)
        },
        (callback) => {
            request("DELETE", "/comment/delete/" + userTags[1]._id + "/" + userTags[1].comments[0]._id, "", "", "", callback)
        },
        (callback) => {
            request("POST", "/comment/restore/" + userTags[0]._id + "/" + userTags[0].comments[0]._id, "", "", "", callback)
        },
        //(inventory testzzzzzzzz)==========================================================================
        (callback) => {
            request("POST", "/inventory/new", authBody, "json", {
                "name": "storage 1"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/new", authBody, "json", {
                "name": "storage 2"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/new", authBody, "json", {
                "name": "storage 3"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/new", authBody, "json", {
                "name": "storage 4"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/new", authBody, "json", {
                "name": "storage 5"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/new", authBody, "json", {
                "name": "storage 6"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/new", authBody, "json", {
                "name": "storage 7"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/new", authBody, "json", {
                "name": "storage 8"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/new", authBody, "json", {
                "name": "storage 9"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/new", authBody, "json", {
                "name": "storage 10"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/new", authBody, "json", {
                "name": "storage 11"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/new", authBody, "json", {
                "name": "storage 12"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/new", authBody, "json", {
                "name": "storage 13"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/new", authBody, "json", {
                "name": "storage 14"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/new", authBody, "json", {
                "name": "storage 15"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/getall", authBody, "json", {
                "showDead": "false"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/edit/" + userInv[0]._id, authBody, "json", {
                "name": "super duper secret room"
            }, callback)
        },
        (callback) => {
            request("DELETE", "/inventory/delete/" + userInv[4]._id, authNoBody, "", "", callback)
        },
        (callback) => {
            request("POST", "/inventory/newItem/" + userInv[0]._id, defaultBody, "json", {
                "name": "industrial strength cleanser1",
                "maxQuant": "100",
                "minQuant": "20",
                "curQuant": "37"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/newItem/" + userInv[1]._id, defaultBody, "json", {
                "name": "industrial strength cleanser2",
                "maxQuant": "100",
                "minQuant": "20",
                "curQuant": "37"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/newItem/" + userInv[2]._id, defaultBody, "json", {
                "name": "industrial strength cleanser3",
                "maxQuant": "100",
                "minQuant": "20",
                "curQuant": "37"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/newItem/" + userInv[3]._id, defaultBody, "json", {
                "name": "industrial strength cleanser4",
                "maxQuant": "100",
                "minQuant": "20",
                "curQuant": "37"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/newItem/" + userInv[4]._id, defaultBody, "json", {
                "name": "industrial strength cleanser5",
                "maxQuant": "100",
                "minQuant": "20",
                "curQuant": "37"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/newItem/" + userInv[5]._id, defaultBody, "json", {
                "name": "industrial strength cleanser6",
                "maxQuant": "100",
                "minQuant": "20",
                "curQuant": "37"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/newItem/" + userInv[6]._id, defaultBody, "json", {
                "name": "industrial strength cleanser7",
                "maxQuant": "100",
                "minQuant": "20",
                "curQuant": "37"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/newItem/" + userInv[7]._id, defaultBody, "json", {
                "name": "industrial strength cleanser8",
                "maxQuant": "100",
                "minQuant": "20",
                "curQuant": "37"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/newItem/" + userInv[8]._id, defaultBody, "json", {
                "name": "industrial strength cleanser9",
                "maxQuant": "100",
                "minQuant": "20",
                "curQuant": "37"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/newItem/" + userInv[9]._id, defaultBody, "json", {
                "name": "industrial strength cleanser10",
                "maxQuant": "100",
                "minQuant": "20",
                "curQuant": "37"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/newItem/" + userInv[10]._id, defaultBody, "json", {
                "name": "industrial strength cleanser11",
                "maxQuant": "100",
                "minQuant": "20",
                "curQuant": "37"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/newItem/" + userInv[11]._id, defaultBody, "json", {
                "name": "industrial strength cleanser12",
                "maxQuant": "100",
                "minQuant": "20",
                "curQuant": "37"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/newItem/" + userInv[12]._id, defaultBody, "json", {
                "name": "industrial strength cleanser13",
                "maxQuant": "100",
                "minQuant": "20",
                "curQuant": "37"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/newItem/" + userInv[13]._id, defaultBody, "json", {
                "name": "industrial strength cleanser14",
                "maxQuant": "100",
                "minQuant": "20",
                "curQuant": "37"
            }, callback)
        },
        // (callback) => {
        //     request("POST", "/inventory/newItem/" + userInv[14]._id, defaultBody, "json", {
        //         "name": "industrial strength cleanser15",
        //         "maxQuant": "100",
        //         "minQuant": "20",
        //         "curQuant": "37"
        //     }, callback)
        // },
        (callback) => {
            request("GET", "/inventory/exists/" + userInv[5]._id, "", "", "", callback)
        },
        (callback) => {
            request("POST", "/inventory/getall", authBody, "json", {
                "showDead": "false"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/updItemQuant/" + userInv[5]._id + "/" + userInv[5].items[0]._id, defaultBody, "json", {
                "newVal": "4"
            }, callback)
        },
        (callback) => {
            request("POST", "/inventory/changeItem/" + userInv[4]._id + "/" + userInv[4].items[0]._id, defaultBody, "json", {
                "name": "industrial strength cleanser",
                "maxQuant": "1000",
                "minQuant": "2"
            }, callback)
        },
        (callback) => {
            request("DELETE", "/inventory/delItem/" + userInv[3]._id + "/" + userInv[3].items[0]._id, "", "", "", callback)
        },
        //(dash testzzzz)===================================================================================
        (callback) => {
            request("GET", "/dash/" + userDetails.dashCode, "", "", "", callback)
        },
        // (callback) => {
        //     request("POST", "/dash/print/", authBody, "json", {
        //         "printIteration": 2
        //     }, callback)
        // },
        //(file testzzzzzzzz)===============================================================================
        // (callback) => {
        //     request("GET", "/file/pdf/" + pdfname + ".pdf", "", "", "", callback)
        // },
        // (callback) => { request("GET", "/file/img/" + userTags[5].comments[0].img, "", "", "", callback) },
        //(kleenup)=========================================================================================
        (callback) => {
            request("DELETE", "/user/deleteinfo", authNoBody, "", "", callback)
        },
        (callback) => {
            request("GET", "/user/delete/" + verlnk, authNoBody, "", "", callback)
        },
        function (callback) {
            callback();
        }
    ],
    function () {
        console.log("PASSED ALL TESTS!");
    });