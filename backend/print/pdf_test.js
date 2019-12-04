const PDFDocument = require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit');

const QRCode = require('qrcode');
const uuidv1 = require('uuid/v1');
const fs = require('fs');
var async = require("async");
const Post = require('../models/Tag');
const fn = uuidv1();

const tl = [{
            tagid: '9e87cfe0-e517-11e9-ad2d-59b6f467ed1e',
            name: 'tag z',
            comments: [],
            __v: 0
        },
        {
            tagid: '6c995810-e95d-11e9-8715-8fd31126566e',
            name: 'tag a',
            comments: [],
            __v: 0
        },
        {
            tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
            name: 'tag b',
            comments: [],
            __v: 0
        },
        {
            tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
            name: 'tag c',
            comments: [],
            __v: 0
        },
        {
            tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
            name: 'tag d',
            comments: [],
            __v: 0
        },
        {
            tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
            name: 'tag e',
            comments: [],
            __v: 0
        },
        {
            tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
            name: 'tag f',
            comments: [],
            __v: 0
        },
        {
            tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
            name: 'tag g',
            comments: [],
            __v: 0
        },
        {
            tagid: '9e90che0-e517-11e9-ad2d-55g5h577jl1e',
            name: 'tag z',
            comments: [],
            __v: 0
        },
        {
            tagid: '6c993810-e35d-13e9-8215-3fd35126576e',
            name: 'tag a',
            comments: [],
            __v: 0
        }
    ];

const docsettings = [{
    size: "LETTER"
}];
const doc = new PDFDocument(docsettings);
doc.pipe(fs.createWriteStream('../temp/' + fn + '.pdf'));

fs.readFile( __dirname + '/template.svg', async function (err, data) {
  if (err) {
    throw err; 
  }

    //console.log(data.toString());
    var svgbuff = data.toString();
    async.forEachOf(tl,function(pos, i, callback) {
        if (err) return callback(err);
        try {
        console.log(i);
        console.log(pos);
        svgbuff = svgbuff.replace("Room "+i, pos.name);
        QRCode.toDataURL("http://"+"localhost:3000"+"/tag/"+pos.tagid, function (err, url) {
           console.log("image generated");
            svgbuff = svgbuff.replace("Img"+(i+1), url);
        });
        } catch (e) {
            return callback(e);
        }
        callback();
    },err=>{
        if (err) throw err;
        //console.log(svgbuff);
        SVGtoPDF(doc, svgbuff, 0, 0);
        doc.end();
        //console.log(svgbuff);
    }); 
});


//https://github.com/alafr/SVG-to-PDFKit
//label spec: https://www.avery.com/blank/labels/94207
//https://www.npmjs.com/package/qrcode-svg