const PDFDocument = require('pdfkit')
const SVGtoPDF = require('svg-to-pdfkit')
const QRCode = require('qrcode')
const uuidv1 = require('uuid/v1')
const fs = require('fs')
var async = require('async')
const Post = require('../models/Tag')
const fillImg=' data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkAQMAAAAjexcCAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAA1BMVEX///+nxBvIAAAAGUlEQVQYGe3BAQEAAACCoP6vdkjAAAAAuBYOGAABPIptXAAAAABJRU5ErkJggg==';




const docsettings = [
  {
    size: 'LETTER'
  }
]
//async function() {
const dat = Post.find({
    user: req.user.internalId
});
/*await*/ fs.readFile(__dirname + '/template.svg', async function (err, data) {
  if (err) {
    console.error(err)
  }
  if (dat.length < 10) {
    var svgbuff = data.toString()
    const doc = new PDFDocument(docsettings)
    const fn = uuidv1()
    doc.pipe(fs.createWriteStream('../temp/' + fn + '.pdf'))
    async.forEachOf(
      dat,
      function (pos, i, callback) {
        console.log(i)
        console.log(pos)
        QRCode.toDataURL(
          'http://' + 'localhost:3000' + '/tag/' + pos.tagid,
          function (err, url) {
            if (err) return callback(err)
            try {
              svgbuff = svgbuff.replace('Room ' + i, pos.name)
              svgbuff = svgbuff.replace('Img' + (i + 1), url)
            } catch (e) {
              return callback(e)
            }
            callback()
          }
        )
      },
      err => {
        if (err) console.error(err.message)
        SVGtoPDF(doc, svgbuff, 0, 0)
        doc.end()
        //res.redirect("https://" + "localhost:3000" + "/pdf/" + fn + ".pdf");
        console.log(
          'https://' + 'localhost:3000' + '/pdf/' + fn + '.pdf'
        )
      }
    )
  } else {
    //svg template file
    var svgbuff = data.toString()
    //array of pages defined
    var pagesArray = [];
    //populate pages array with templates one for each ten< of data
    for (var h = 0; h < Math.ceil(dat.length / 10); h++) {
      pagesArray.push(svgbuff);
    }
    //cbuff stores page position
    var cbuff = 0;
    const doc = new PDFDocument(docsettings);
    const fn = uuidv1();
    //async qr generation
    async.forEachOf(
      dat,
      function (pos, i, callback) {
        //create data url, call insertion function
        QRCode.toDataURL('http://' + 'localhost:3000' + '/tag/' + pos.tagid, function (err, url) {
          if (err) return callback(err);
          try {
            //every tenth page, increment page position
            if (i != 0 && i % 10 == 0) {
              cbuff++
              console.log('up ' + cbuff)
            }
            console.log(pos.name)
            //replace image and room name dummy values with values from async function and json file
            pagesArray[cbuff] = pagesArray[cbuff].replace('Room ' + (i -(cbuff*10)), pos.name)
            pagesArray[cbuff] = pagesArray[cbuff].replace('Img ' + (i -(cbuff*10)), url)
          } catch (e) {
            return callback(e)
          }
          //call callback when finished
          callback();
        }
        )
      },
      err => {
        if (err) return console.error(err.message);
        //document write stream begins
        doc.pipe(fs.createWriteStream('../temp/' + fn + '.pdf'));
        //for each page, add new pdf page, convert svg into pdf page content data and put it into place.
        for (var h=0; h < pagesArray.length; h++) {
          if(pagesArray[h].indexOf("Room 9") !== -1){
            for(var g=0;g<10;g++){
              pagesArray[cbuff] = pagesArray[cbuff].replace('Room ' + g, '')
              pagesArray[cbuff] = pagesArray[cbuff].replace('Img ' + g, fillImg);
            }
            console.log();
          }
          SVGtoPDF(doc, pagesArray[h], 0, 0);
          doc.addPage();
        }
        //finish writing to document
        doc.end();
        //redirect user to pdf page
        //res.redirect("https://" + "localhost:3000" + "/pdf/" + fn + ".pdf");
        console.log(
          'https://' + 'localhost:3000' + '/pdf/' + fn + '.pdf'
        );
      }
    )
  }
})

// });

// https://github.com/alafr/SVG-to-PDFKit
// label spec: https://www.avery.com/blank/labels/94207
// https://www.npmjs.com/package/qrcode
