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
    tagid: '6c993810-e35d-13e9-8215-3fd35126576e',
    name: 'tag a',
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
    var svgbuff = data.toString()
        let pagesArray = [Math.ceil(dat.length / 10)]
        pagesArray.every((elem, index, arr) => {
      arr[index] = svgbuff
            return elem
        })
    var cbuff = 0
        console.log(dat.length)
        const doc = new PDFDocument(docsettings)
        const fn = uuidv1()
        doc.pipe(fs.createWriteStream('../temp/' + fn + '.pdf'))
        async.forEachOf(
      dat,
      function (pos, i, callback) {
        // console.log(pos);
        QRCode.toDataURL(
          'http://' + 'localhost:3000' + '/tag/' + pos.tagid,
          function (err, url) {
            if (err) return callback(err)
                        try {
              console.log(i)
                            if (i != 0 && i % 10 == 0) {
                                cbuff++
                                console.log('up ' + cbuff)
                            }
              console.log(cbuff)
                            console.log(pos.name)
                            pagesArray[cbuff] = pagesArray[cbuff].replace('Room ' + i, pos.name)
                            pagesArray[cbuff] = pagesArray[cbuff].replace('Img' + (i + 1), url)
                        } catch (e) {
              return callback(e)
                        }
            callback()
                    }
        )
            },
      err => {
        if (err) return console.error(err.message)
                for (var g = 0; g < pagesArray.length; g++) {
          doc.addPage()
                    doc.on('pageAdded', () => SVGtoPDF(doc, svgbuff, 0, 0))
                }
        doc.end()
                //res.redirect("https://" + "localhost:3000" + "/pdf/" + fn + ".pdf");
                console.log(
          'https://' + 'localhost:3000' + '/pdf/' + fn + '.pdf'
        )
            }
    )
    }
})

// });

// https://github.com/alafr/SVG-to-PDFKit
// label spec: https://www.avery.com/blank/labels/94207
// https://www.npmjs.com/package/qrcode-svg
