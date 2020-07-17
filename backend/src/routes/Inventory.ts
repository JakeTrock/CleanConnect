import {
    Request,
    Response,
    Router
} from "express";
import helpers from '../helpers';
import Inventory from '../models/Inventory';
import User from '../models/User';
import Item from '../models/Item';
import { ifUserDocument, ifInventoryDocument } from "../interfaces";
//configure express addons
let router = Router();
//document settings and blank template image for pdf creator

// ROUTE: GET inventory/test
// DESCRIPTION: Tests post route
router.get('/test', (req: Request, res: Response) => res.send("Inventory Works"));

// ROUTE: GET inventory/getall
// DESCRIPTION: Gets full inventory listings
router.post('/getall', helpers.passport, (req: Request, res: Response) => {
    Inventory.getall(req.user._id, req.body.showDead)
        .then(out => res.json(helpers.scadd({ invs: out })))
        .catch(e => res.json(helpers.erep(e)));
});
// ROUTE: GET inventory/getone/id
// DESCRIPTION: gets the metadata of a single tag based on its id, can also be used to confirm if a tag exists
router.get('/getone/:id', helpers.passport, (req: Request, res: Response) => {
    Inventory.get(req.params.id)
        .then(out => res.json(helpers.scadd(out)))
        .catch(e => res.json(helpers.erep(e)));
});
// ROUTE: GET inventory/exists/:id
// DESCRIPTION: sees if tag exists
router.get('/exists/:id', (req: Request, res: Response) => {
    Inventory.exists({
        _id: new helpers.toObjID(req.params.id)
    })
        .then((out: boolean) => res.json({ success: out }))
        .catch(e => res.json(helpers.erep(e)));
});
// ROUTE: POST inventory/new
// DESCRIPTION: creates a new tag
// INPUT: requires a user name to link back to, and a unique room name
router.post('/new', helpers.passport, (req: Request, res: Response) => {
    User.findOne({
        _id: req.user._id
    })
        .then((usr: ifUserDocument) => Inventory.new(req.body.name, usr))
        .then(() => res.json(helpers.blankres))
        .catch(e => res.json(helpers.erep(e)));
});

// ROUTE: POST inventory/edit/:id
// DESCRIPTION: allows user to change current tag name to unique name
// INPUT: new tag name via json body
router.post('/edit/:id', helpers.passport, (req: Request, res: Response) => {
    Inventory.updateOne({
        _id: new helpers.toObjID(req.params.id)
    }, req.body)
        .then(() => res.json(helpers.blankres))
        .catch(e => res.json(helpers.erep(e)));
});

// ROUTE: DELETE inventory/:id
// DESCRIPTION: allows user to delete given tag information
// INPUT: tag id via url bar

router.delete('/delete/:id', helpers.passport, (req: Request, res: Response) => {
    User.findOne({
        _id: req.user._id
    })
        .then((usr: ifUserDocument) => Inventory.removal(new helpers.toObjID(req.params.id), usr))
        .then(() => res.json(helpers.blankres))
        .catch(e => res.json(helpers.erep(e)));
});


router.post('/newItem/:id', (req: Request, res: Response) => {
    Inventory.findById(req.params.id)
        .then((inv: ifInventoryDocument) => Item.new(inv, {
            name: req.body.name,
            inventory: inv._id,
            maxQuant: req.body.maxQuant,
            minQuant: req.body.minQuant,
            curQuant: req.body.curQuant,
            ip: req.ip
        }))
        .then(() => res.json(helpers.blankres))
        .catch(e => res.json(helpers.erep(e)));
});

router.delete('/delItem/:id/:item_id', (req: Request, res: Response) => {
    Item.mark({
        inventory: new helpers.toObjID(req.params.id),
        _id: new helpers.toObjID(req.params.item_id),
    },
        true,
        req.ip
    ).then(() => res.json(helpers.blankres))
        .catch(e => res.json(helpers.erep(e)));
});

router.post('/restore/:id/:item_id', (req: Request, res: Response) => {
    Item.mark({
        inventory: new helpers.toObjID(req.params.id),
        _id: new helpers.toObjID(req.params.item_id),
    }, false, req.ip)
        .then(() => res.json(helpers.blankres))
        .catch(e => res.json(helpers.erep(e)));
});

router.post('/updItemQuant/:id/:item_id', (req: Request, res: Response) => {
    Item.change({
        inventory: new helpers.toObjID(req.params.id),
        _id: new helpers.toObjID(req.params.item_id)
    }, req.body, true)
        .then(() => res.json(helpers.blankres))
        .catch(e => res.json(helpers.erep(e)));
});

router.post('/changeItem/:id/:item_id', (req: Request, res: Response) => {
    Item.change({
        inventory: new helpers.toObjID(req.params.id),
        _id: new helpers.toObjID(req.params.item_id)
    }, req.body, false)
        .then(() => res.json(helpers.blankres))
        .catch(e => res.json(helpers.erep(e)));
});
//export module for importing into central server file
export default router;