//module import block
import econf from './config/express.conf';
import * as schedule from "node-schedule";
import braintree from 'braintree';
import async from './asyncpromise';
import User from './models/User';
import UserIndex from './models/UserIndex';
import Comment from './models/Comment';
import Tag from './models/Tag';
import Inventory from './models/Inventory';
import helpers from './helpers';
import keys from './config/keys.json';
import { inspect } from 'util';
import { ifCommentDocument, ifUserIndexDocument } from './interfaces';
const gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: keys.mid,
    publicKey: keys.pbk,
    privateKey: keys.prk,
});

//setup bodyparser and express
if (!keys.testing) {
    process.env.topLevelDomain = "cleanconnect.us";
    process.env.domainPrefix = "https://";
} else {
    process.env.topLevelDomain = "localhost:3000";
    process.env.domainPrefix = "http://";
}
process.env.NODE_ENV = (keys.testing) ? "development" : "production";
console.log(`THIS IS THE ${process.env.NODE_ENV} BUILD`);


//set port and listen on it 

econf.app.listen(5000, () => console.log("Server running on port 5000"));


process
    .on('unhandledRejection', (reason, p) => helpers.erep(`${reason} Unhandled Rejection at Promise ${inspect(p)}`))
    .on('uncaughtException', err => {
        helpers.erep(`Uncaught Exception thrown ${inspect(err)}`);
        process.exit(1);
    });

// ROUTE: NONE
// DESCRIPTION: deletes unused tokens and pdfs over a week old from the server
// INPUT: NONE
schedule.scheduleJob("00 00 00 * * *", () => {
    console.log("Goodnight, time to delete some stuff! (-_-)ᶻᶻᶻᶻ");
    async.parallel({
        //older than one week block
        oneWeek: (callback) => {
            var d = new Date();
            d.setDate(d.getDate() - 7);
            UserIndex.listPrunable(d).then((list: Array<ifUserIndexDocument>) =>
                async.each(list, (elem: ifUserIndexDocument, callback) => {
                    User.findById(elem._userId).then(user => async.parallel({
                        payCancel: gateway.subscription.cancel(user.PayToken),
                        userRemove: User.findOneAndRemove({
                            _id: user._id,
                        }),
                        indexRemove: UserIndex.deleteMany({
                            _userId: user._id,
                        }),
                        tagPurge: Tag.purge(user._id),
                        invPurge: Inventory.purge(user._id)
                    }))
                        .catch(e => callback(e))
                        .then(callback())
                }))
                .then(callback(null, true))
                .catch(e => callback(e, false));
        },
        //older than one month block
        oneMonth: callback => {
            var d = new Date();
            d.setDate(d.getDate() - 23);
            //remove images connected to stale comments
            Comment.find({
                markedForDeletion: true,
                removedAt: {
                    $lt: d
                }
            }).then((list: Array<ifCommentDocument>) =>
                async.each(list, (elem: ifCommentDocument, callback) => {
                    Comment.rmImageDelete(elem._id)
                        .catch(e => callback(e))
                        .then(callback())
                }))
                .then(callback(null, true))
                .catch(e => callback(e, false));
        }
    }).then(console.log)
        .catch(helpers.erep);
});