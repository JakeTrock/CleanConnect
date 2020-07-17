import {
    Request,
    Response,
    Router
} from "express";
import helpers from '../helpers';
import async from '../asyncpromise';
import User from '../models/User';
import Tag from '../models/Tag';
import Inventory from '../models/Inventory';
import { ifUserDocument, ifInventoryDocument, ifTagDocument } from '../interfaces';
//configure express addons
let router = Router();

// ROUTE: GET dash/:id
// DESCRIPTION: anonymous dashboard only accessible with secret keystring
router.get('/:dash', (req: Request, res: Response) => {
    User.findOne({
        dashCode: req.params.dash
    }).then((user: ifUserDocument) => {
        async.parallel({
            tags: (callback) =>
                Tag.getall(user._id, false)
                    .then((out: ifTagDocument[]) => callback(null, out))
                    .catch(err => callback(err, null)),
            inventories: (callback) =>
                Inventory.getall(user._id, false)
                    .then((out: ifInventoryDocument[]) => callback(null, out))
                    .catch(err => callback(err, null))
        })
            .then(out => res.json(helpers.scadd(out)))
            .catch(e => res.json(helpers.erep(e)))
    });
});
export default router;