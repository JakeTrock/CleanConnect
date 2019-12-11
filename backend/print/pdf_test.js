const PDFDocument = require('pdfkit')
const SVGtoPDF = require('svg-to-pdfkit')
const QRCode = require('qrcode')
const uuidv1 = require('uuid/v1')
const fs = require('fs')
var async = require('async')
const Post = require('../models/Tag')
const dat = [
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
  },
  {
    tagid: '9e87cfe0-e517-11e9-ad2d-59b6f467ed1e',
    name: 'tag z',
    comments: [],
    __v: 0
  },

  {
    tagid: '6c995810-e95d-11e9-8715-8fd31126566e',
    name: 'tag r',
    comments: [],
    __v: 0
  },
  {
    tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
    name: 'tag r',
    comments: [],
    __v: 0
  },
  {
    tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
    name: 'tag r',
    comments: [],
    __v: 0
  },
  {
    tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
    name: 'tag r',
    comments: [],
    __v: 0
  },
  {
    tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
    name: 'tag r',
    comments: [],
    __v: 0
  },
  {
    tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
    name: 'tag r',
    comments: [],
    __v: 0
  },
  {
    tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
    name: 'tag r',
    comments: [],
    __v: 0
  },
  {
    tagid: '9e90che0-e517-11e9-ad2d-55g5h577jl1e',
    name: 'tag r',
    comments: [],
    __v: 0
  },
  {
    tagid: '6c993810-e35d-13e9-8215-3fd35126576e',
    name: 'tag r',
    comments: [],
    __v: 0
  },
  {
    tagid: '6c993810-e35d-13e9-8215-3fd35126576e',
    name: 'tag r',
    comments: [],
    __v: 0
  }
]

const docsettings = [
  {
    size: 'LETTER'
  }
]
//async function() {
// const dat = await Post.find({
//     user: req.user.internalId
// });
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
