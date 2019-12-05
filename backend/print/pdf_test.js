const PDFDocument = require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit');
const merge = require('easy-pdf-merge');
const QRCode = require('qrcode');
const uuidv1 = require('uuid/v1');
const fs = require('fs');
var async = require("async");
const Post = require('../models/Tag');
const dat = [{
    tagid: '9e87cfe0-e517-11e9-ad2d-59b6f467ed1e',
    name: 'tag z',
    comments: [],
    __v: 0
}, {
    tagid: '6c995810-e95d-11e9-8715-8fd31126566e',
    name: 'tag a',
    comments: [],
    __v: 0
}, {
    tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
    name: 'tag b',
    comments: [],
    __v: 0
}, {
    tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
    name: 'tag c',
    comments: [],
    __v: 0
}, {
    tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
    name: 'tag d',
    comments: [],
    __v: 0
}, {
    tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
    name: 'tag e',
    comments: [],
    __v: 0
}, {
    tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
    name: 'tag f',
    comments: [],
    __v: 0
}, {
    tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
    name: 'tag g',
    comments: [],
    __v: 0
}, {
    tagid: '9e90che0-e517-11e9-ad2d-55g5h577jl1e',
    name: 'tag z',
    comments: [],
    __v: 0
}, {
    tagid: '6c993810-e35d-13e9-8215-3fd35126576e',
    name: 'tag a',
    comments: [],
    __v: 0
}, {
    tagid: '9e87cfe0-e517-11e9-ad2d-59b6f467ed1e',
    name: 'tag z',
    comments: [],
    __v: 0
}, {
    tagid: '6c995810-e95d-11e9-8715-8fd31126566e',
    name: 'tag a',
    comments: [],
    __v: 0
}, {
    tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
    name: 'tag b',
    comments: [],
    __v: 0
}, {
    tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
    name: 'tag c',
    comments: [],
    __v: 0
}, {
    tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
    name: 'tag d',
    comments: [],
    __v: 0
}, {
    tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
    name: 'tag e',
    comments: [],
    __v: 0
}, {
    tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
    name: 'tag f',
    comments: [],
    __v: 0
}, {
    tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
    name: 'tag g',
    comments: [],
    __v: 0
}, {
    tagid: '9e90che0-e517-11e9-ad2d-55g5h577jl1e',
    name: 'tag z',
    comments: [],
    __v: 0
}, {
    tagid: '6c993810-e35d-13e9-8215-3fd35126576e',
    name: 'tag a',
    comments: [],
    __v: 0
}];
//const dat = await Post.find({ user: req.user.internalId });
const docsettings = [{
    size: "LETTER"
}];
var pdn = [];
(async () => {
        await fs.readFile(__dirname + '/template.svg', async function(err, data) {
            if (err) {
                throw err;
            }
            for (var b = 0; b < (Math.ceil(dat.length / 10) * 10); b += 10) {
                var svgbuff = data.toString();
                var tl = dat.slice((0 + b), (10 + b));
                const doc = new PDFDocument(docsettings);
                const fn = uuidv1();
                doc.pipe(fs.createWriteStream('../temp/' + fn + '.pdf'));
                async.forEachOf(tl, function(pos, i, callback) {
                    QRCode.toDataURL("http://" + "localhost:3000" + "/tag/" + pos.tagid, function(err, url) {
                        if (err) return callback(err);
                        try {
                            console.log(i);
                            console.log(pos);
                            svgbuff = svgbuff.replace("Room " + i, pos.name);
                            console.log("image generated");
                            svgbuff = svgbuff.replace("Img" + (i + 1), url);
                        } catch (e) {
                            return callback(e);
                        }
                        callback();
                    });
                }, err => {
                    if (err) console.error(err.message);
                    //console.log(svgbuff);
                    SVGtoPDF(doc, svgbuff, 0, 0);
                    //console.log(svgbuff);
                    doc.end();
                    pdn.push(fn + '.pdf');
                });
            }
        });
        const nfn = uuidv1();
        await merge([pdn, nfn + '.pdf', function(err) {
                if (err) {
                    return console.log(err)
                }
                for(var g =0;g<nfn.length;g++)fs.unlink(nfn[g]);
                console.log('Successfully merged!');
                res.redirect("https://"+"localhost:3000" + "/pdf/" + nfn + ".pdf");
            });
});

    //https://github.com/alafr/SVG-to-PDFKit
    //label spec: https://www.avery.com/blank/labels/94207
    //https://www.npmjs.com/package/qrcode-svg