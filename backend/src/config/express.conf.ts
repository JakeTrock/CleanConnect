// Configuration
import * as config from './keys.json';
import * as express from 'express';
import mongoose from "mongoose";
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cors from 'cors';
import user from '../routes/User';
import tag from '../routes/Tag';
import comment from '../routes/Comment';
import dash from '../routes/Dash';
import inventory from '../routes/Inventory';
import helpers from '../helpers';
import braintree from 'braintree';
import keys from '../config/keys.json';//secret generator:dd if=/dev/random bs=2 count=3 2>/dev/null | perl -e '$hex = <>; $hex = unpack("H*", $hex) ; $hex =~ s/(..)(?!.?$)/$1:/g; print "$hex\n";'
// Logic
class ExpressConfiguration {
    public app: express.Application;
    public dbUrl: string = config.url;
    public gfs;
    public gateway = braintree.connect({
        environment: braintree.Environment.Sandbox,
        merchantId: keys.mid,
        publicKey: keys.pbk,
        privateKey: keys.prk,
    });
    
    constructor() {
        this.app = express.default();
        this.config();
        this.dbConnect();
    }

    private dbConnect() {
        mongoose.connect(keys.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => console.log('Mongodb Connected'))
            .catch(err => helpers.erep(err));
        mongoose.set('useFindAndModify', false);
        mongoose.connection.once("open", () => {
            this.gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
                bucketName: "uploads"
            });
        });
    }

    private config() {
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(bodyParser.urlencoded({
            extended: false
        }));
        this.app.use(bodyParser.json());
        this.app.set('trust proxy', true);
        this.app.use((req: express.Request, res: express.Response, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type, authorization');
            next();
        });
        //map router files to respective urls
        this.app.use('/user', user);
        this.app.use('/tag', tag);
        this.app.use('/comment', comment);
        this.app.use('/dash', dash);
        this.app.use('/inventory', inventory);
    }
}
export default new ExpressConfiguration();