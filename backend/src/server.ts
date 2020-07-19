//module import block
import econf from './config/express.conf';
import * as schedule from "node-schedule";
import async from './asyncpromise';
import User from './models/User';
import UserIndex from './models/UserIndex';
import Comment from './models/Comment';
import Tag from './models/Tag';
import Inventory from './models/Inventory';
import helpers from './helpers';
import keys from './config/keys.json';
import { inspect } from 'util';
import { ifCommentDocument, ifUserIndexDocument, ifUserDocument } from './interfaces';


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
    let d: Date = new Date();
    async.parallel({
        //older than one week block
        oneWeek: (callback) => {
            d.setDate(d.getDate() - 7);
            UserIndex.find({
                isCritical: true,
                createdAt: {
                    $lt: d
                }
            }).then((list: Array<ifUserIndexDocument>) =>
                async.each(list, (elem: ifUserIndexDocument, callback) => {
                    User.findById(elem._userId).then((user: ifUserDocument) =>
                        async.parallel({
                            payCancel: (cb) => econf.gateway.subscription.cancel(user.PayToken)
                                .then(cb())
                                .catch(cb),
                            userRemove: (cb) => User.findOneAndRemove({
                                _id: user._id,
                            })
                                .then(cb())
                                .catch(cb),
                            indexRemove: (cb) => UserIndex.deleteMany({
                                _userId: user._id,
                            })
                                .then(cb())
                                .catch(cb),
                            tagPurge: (cb) => Tag.purge(user._id)
                                .then(cb())
                                .catch(cb),
                            invPurge: (cb) => Inventory.purge(user._id)
                                .then(cb())
                                .catch(cb)
                        }))
                        .then(callback())
                        .catch(console.log)
                }))
                .then(callback(null, true))
                .catch(e => callback(e, false));
        },
        //older than one month block
        oneMonth: callback => {
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
                        .then(callback())
                        .catch(e => callback(e))
                }))
                .then(callback(null, true))
                .catch(e => callback(e, false));
        }
    }).then(out => console.log(out))
        .catch(console.log);
});