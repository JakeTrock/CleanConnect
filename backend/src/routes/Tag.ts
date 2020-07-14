import {
    Request,
    Response,
    Router
} from "express";
import helpers from '../helpers';
import User from '../models/User';
import Tag from '../models/Tag';
import { ifUserDocument, ifTagDocument } from "../interfaces";
let router = Router();

// ROUTE: GET tag/test
// DESCRIPTION: Tests post route
router.get("/test", (req: Request, res: Response) => res.send("Tag Works"));

// ROUTE: POST tag/new
// DESCRIPTION: creates a new tag
// INPUT: requires a user name to link back to, and a unique room name
router.post("/new", helpers.passport, (req: Request, res: Response) => {
    User.findById(req.user._id)
        .then((usr: ifUserDocument) => Tag.new(req.body.name, usr))
        .then(() => res.json(helpers.blankres))
        .catch(e => res.json(helpers.erep(e)));
});

// ROUTE: GET tag/getall
// DESCRIPTION: pregenerates qr codes, skipping tags that are already generated
router.post("/getall", helpers.passport, async (req: Request, res: Response) => {
    Tag.getall(req.user._id, req.body.showDead)
        .then(out => res.json(helpers.scadd(out)))
        .catch(e => res.json(helpers.erep(e)));
});

// ROUTE: GET tag/getone/id
// DESCRIPTION: gets the metadata of a single tag based on its id, can also be used to confirm if a tag exists
router.get("/getone/:id", helpers.passport, (req: Request, res: Response) => {
    Tag.get(req.params.id)
        .then((out: ifTagDocument) => res.json(helpers.scadd(out)))
        .catch(e => res.json(helpers.erep(e)));
});

// ROUTE: GET tag/exists/:id
// DESCRIPTION: sees if tag exists
router.get("/exists/:id", (req: Request, res: Response) => {
    Tag.exists(new helpers.toObjID(req.params.id))
        .then((out: boolean) => res.json({ success: out }))
        .catch(e => res.json(helpers.erep(e)));
});


// ROUTE: POST tag/edit/:id
// DESCRIPTION: allows user to change current tag name to unique name
// INPUT: new tag name via json body
router.post("/edit/:id", helpers.passport, (req: Request, res: Response) => {
    Tag.change(new helpers.toObjID(req.params.id), req.body)
        .then(() => res.json(helpers.blankres))
        .catch(e => res.json(helpers.erep(e)));
});

// ROUTE: DELETE tag/:id
// DESCRIPTION: allows user to delete given tag information
// INPUT: tag id via url bar

router.delete("/delete/:id", helpers.passport, (req: Request, res: Response) => {
    User.findById(req.user._id)
        .then((usr: ifUserDocument) => Tag.removal(new helpers.toObjID(req.params.id), usr._id))
        .then(() => res.json(helpers.blankres))
        .catch(e => res.json(helpers.erep(e)));
});
//export module for importing into central server file
export default router;