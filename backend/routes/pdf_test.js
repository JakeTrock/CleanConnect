const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const uuidv1 = require('uuid/v1');
const fs = require('fs');

const Post = require('../models/Tag');

const gr = ["Sample Text","Sample Text","Sample Text","Sample Text","Sample Text","Sample Text","Sample Text","Sample Text","Sample Text"];
const fn = uuidv1();
    const doc = new PDFDocument({
        size: 'A4',
        margins: {
            left: 12.65,
            right: 12.65,
            top: 43.5,
            bottom: 43.5
        }
    });
    doc.pipe(fs.createWriteStream('../temp/' + fn + '.pdf'));
    var pgsw = 0;
    (async () => {
        const tl = await Post.find({ user: req.user.id });
        for (let i = 0; i < tl.length; i++) {
            QRCode.toDataURL("http://website.com/tag/" + tl[i].tagid, function(error, url) {
                if (error) console.error(error);
                if (i == 7) {
                    pgsw = 285.7;
                }
                doc.rect(pgsw, i * 108, 281, 108) //change second element y fraction to how many stickers fit on page
                    .lineWidth(3)
                    .fillOpacity(0.8)
                    .fillAndStroke("grey", "#0f0f0f")
                    .text(gr[Math.ceil(Math.random() * (gr.length - 1))], pgsw, 50 + i * 108, {
                        width: 333.75,
                        align: 'right'
                    }).funtitledill("#FFFFFF").text(tl[i].name, 103 + pgsw, 200 + i * 108, {
                        width: 173,
                        align: 'right'
                    }).fillOpacity(1).fill("#FFFFFF")
                    .image(url, pgsw, i * 108, { fit: [108, 108], });
                if (i == tl.length - 1) doc.end();
            });
        }
        //label spec: https://uk.onlinelabels.com/templates/eu30011-template-pdf.html
        //https://www.npmjs.com/package/pdfkit
    })();