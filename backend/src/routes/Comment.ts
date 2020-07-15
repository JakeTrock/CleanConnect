import {
    Request,
    Response,
    Router
} from "express";
import xss from 'xss-filters';
import helpers from '../helpers';
import Comment from '../models/Comment';
import Tag from '../models/Tag';
import { ifTagDocument } from "../interfaces";
import econf from '../config/express.conf';
import upload from '../models/Image';


//router and request config
interface RequestWithFiles extends Request {
    files: any
}
let router = Router();
// router.use(fileUpload());

// ROUTE: POST comment/test
// DESCRIPTION: tests comment route
// INPUT: none
router.get("/test", (req: Request, res: Response) => res.send("Comments Works"));

// ROUTE: GET comment/img/:url
// DESCRIPTION: retrieves and returns image from temp dir
// INPUT: url and extenstion of choice image
router.get('/img/:id', (req: Request, res: Response) => {
    econf.gfs.openDownloadStream(new helpers.toObjID(req.params.id)).pipe(res);
});

// ROUTE: POST comment/:id
// DESCRIPTION: allows unauthorized user to add a comment to a post
// INPUT: severity of issue(0 to 2, being worst), description of issue, and an optional image of the issue

router.post("/new/:id", upload.single('img'), (req: RequestWithFiles, res: Response) => {
    Tag.get(req.params.id)
        .then((tag: ifTagDocument) => {
            Comment.new({
                ip: req.ip,
                tag: new helpers.toObjID(req.params.id),
                text: xss.uriQueryInHTMLData(req.body.text).replace(/%20/g," "),
                img: (req.file) ? req.file.id : undefined,
                sev: req.body.sev,
            }, tag)
                .then(() => res.json(helpers.blankres))
                .catch(e => res.json(helpers.erep(e)));
        });
});

// ROUTE: DELETE api/posts/comment/:id/:comment
// DESCRIPTION: allows deletion of comment, most likely after it has been resolved
// INPUT: in the url bar, this first takes the id of the post, then the id of the child comment

router.delete("/delete/:id/:comment_id", (req: Request, res: Response) => {
    Comment.mark({
        tag: new helpers.toObjID(req.params.id),
        _id: new helpers.toObjID(req.params.comment_id),
    }, true, req.ip)
        .then(() => res.json(helpers.blankres))
        .catch(e => res.json(helpers.erep(e)));
});

// ROUTE: POST api/posts/comment/:id/:comment
// DESCRIPTION: allows restoration of comment, after it has been wrongfully deleted
// INPUT: in the url bar, this first takes the id of the post, then the id of the child comment

router.post("/restore/:id/:comment_id", (req: Request, res: Response) => {
    Comment.mark({
        tag: new helpers.toObjID(req.params.id),
        _id: new helpers.toObjID(req.params.comment_id),
    }, false, req.ip)
        .then(() => res.json(helpers.blankres))
        .catch(e => res.json(helpers.erep(e)));
});

export default router;