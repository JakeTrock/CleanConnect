const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const uuidv1 = require('uuid/v1');
const fs = require('fs');

const Post = require('../models/Tag');
const fn = uuidv1();

const docsettings = [{
    size: LETTER
}];
const dpath = ``;
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
var linkList=[];
const doc = new PDFDocument(docsettings);
doc.pipe(fs.createWriteStream('../temp/' + fn + '.pdf'));
var pgsw = 0;
(async () => {
    for (let i = 0; i < tl.length; i++) {
        QRCode.toDataURL("http://website.com/tag/" + tl[i].tagid, function(error, url) {
            if (error) console.error(error);
            linkList.push(url);
            // if (i == 7) {
            //     pgsw = 285.7;
            // }
            // doc.path(dpath).lineWidth(3).fillAndStroke("grey", "#0f0f0f")
            // .text(gr[Math.ceil(Math.random() * (gr.length - 1))], pgsw, 50 + i * 108, {
            //         width: 333.75,
            //         align: 'right'
            //     }).fill("#FFFFFF").text(tl[i].name, 103 + pgsw, 200 + i * 108, {
            //         width: 173,
            //         align: 'right'
            //     }).fillOpacity(1).fill("#FFFFFF")
            //     .image(url, pgsw, i * 108, { fit: [108, 108], });
            // if (i == tl.length - 1) doc.end();
        });
    }
    //label spec: https://uk.onlinelabels.com/templates/eu30011-template-pdf.html
    //https://www.npmjs.com/package/pdfkit
}).then(function(){
if(linkList.length>10){
for(var i = 0;i<linkList.length;i+=10){
    doc.addPage(docsettings);
}
} else{

}
});