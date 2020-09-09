import { Types, Document, Model } from 'mongoose';
import { BraintreeGateway, Customer, Subscription } from 'braintree';
import { Request } from "express";

//Mongoose Document Interfaces
export interface ifUserDocument extends Document {
    //data interfaces
    dashUrl: string;
    dashCode: string;
    tags?: Types.ObjectId[];
    invs?: Types.ObjectId[];
    isVerified?: boolean;
    tier: number;
    password: string;
    custID: string;
    PayToken: string;
    name: string;
    email: string;
    phone: string;
}
//static function interfaces
export interface ifUserModel extends Model<ifUserDocument> {
    get: (id: string) => Promise<ifUserDocument>;
    removeItem: (user: Types.ObjectId, id: Types.ObjectId, op: string) => Promise<void>;
    login: (field1: string, field2: string) => Promise<String>;
    changeInfo: (usr: Types.ObjectId, changeFields: UserChangeFields, gateway: BraintreeGateway) => Promise<void>;
    changePass: (info: changePassInterface) => Promise<void>;
    new: (details: UserNewInterface, gateway: BraintreeGateway) => Promise<ifUserDocument>;
    purge: (user: ifUserDocument) => Promise<void>;
}

export interface ifUserIndexDocument extends Document {
    //data interfaces
    token: string;
    isCritical: boolean;
    email: string;
    userID?: Types.ObjectId;
}
//static function interfaces
export interface ifUserIndexModel extends Model<ifUserIndexDocument> {
    get: (token: string) => Promise<ifUserIndexDocument>;
    createIndex: (info: UserIndexCreateFields) => Promise<mailOut>;
    confirm: (token: string) => Promise<ifUserDocument>;
}

export interface ifTagDocument extends Document {
    //data interfaces
    qrcode: string;
    comments?: Types.ObjectId[];
    name: string;
    user: Types.ObjectId;
}
//static function interfaces
export interface ifTagModel extends Model<ifTagDocument> {
    get: (id: string) => Promise<ifTagDocument>;
    getall: (userID: Types.ObjectId, sd: boolean) => Promise<Array<ifTagDocument>>;
    new: (name: string, user: ifUserDocument) => Promise<void>;
    change: (id: Types.ObjectId, updated: TagChangeInterface) => Promise<void>;
    removal: (id: Types.ObjectId, uid: Types.ObjectId) => Promise<void>;
    purge: (userID: Types.ObjectId) => Promise<void>;
}

export interface ifItemDocument extends Document {
    //data interfaces
    minQuant: number;
    markedForDeletion: boolean;
    name: string;
    inventory: Types.ObjectId;
    maxQuant: number;
    curQuant: number;
    ip?: string;
}
//static function interfaces
export interface ifItemModel extends Model<ifItemDocument> {
    get: (id: string) => Promise<ifItemDocument>;
    new: (inv: ifInventoryDocument, details: ItemNewInterface) => Promise<void>;
    change: (fp: ItemChangeFindInterface, updated: ItemChangeInterface, qupdate: boolean) => Promise<void>;
    mark: (fp: ItemDeleteFindInterface, status: boolean, ip: string) => Promise<void>;
}

export interface ifInventoryDocument extends Document {
    //data interfaces
    qrcode: string;
    status: number;
    items: Types.ObjectId[];
    name: string;
    user: Types.ObjectId;
}
//static function interfaces
export interface ifInventoryModel extends Model<ifInventoryDocument> {
    get: (id: string) => Promise<ifInventoryDocument>;
    getall: (userID: Types.ObjectId, sd: boolean) => Promise<Array<ifInventoryDocument>>;
    new: (name: String, user: ifUserDocument) => Promise<void>;
    change: (id: Types.ObjectId, updated: InventoryChangeInterface) => Promise<void>;
    removal: (id: Types.ObjectId, user: ifUserDocument) => Promise<void>;
    purge: (userID: Types.ObjectId) => Promise<void>;
}

export interface ifCommentDocument extends Document {
    //data interfaces
    markedForDeletion?: boolean;
    ip?: string;
    tag: Types.ObjectId;
    img?: string;
    text: string;
    sev: number;
    removedAt?: Date;
}
//static function interfaces
export interface ifCommentModel extends Model<ifCommentDocument> {
    get: (id: string) => Promise<ifCommentDocument>;
    rmImageDelete: (id: Types.ObjectId) => Promise<void>;
    new: (details: CommentInputData, tag: ifTagDocument) => Promise<void>;
    mark: (fp: CommentMarkFindParam, status: boolean, ip: string) => Promise<void>;
}
//express req.user patch
declare module 'express-serve-static-core' {
    interface Request {
        user?: JWTuser;
    }
    interface Response {
        user?: JWTuser;
    }
}
//Gen Purp. I/O Interfaces
export interface mailOut {
    success: boolean;
    status: String;
}

export interface UserChangeFields {
    name?: ifUserDocument["name"];
    email?: ifUserDocument["email"];
    phone?: ifUserDocument["phone"];
    tier?: ifUserDocument["tier"];
    payment_method_nonce?: string;
}

export interface UserIndexCreateFields {
    _id: ifUserIndexDocument["_id"];
    email: ifUserIndexDocument["email"];
    prefix: string;
    ic: ifUserIndexDocument["isCritical"];
}

export interface UserIndexCfOut {
    findUser: ifUserDocument;
    delIndex: ifUserIndexDocument;
}

export interface CommentInputData {
    ip?: ifCommentDocument["ip"];
    tag: ifCommentDocument["tag"];
    text: ifCommentDocument["text"];
    img?: ifCommentDocument["img"];
    sev: ifCommentDocument["sev"];
}

export interface CommentMarkFindParam {
    tag: ifTagDocument["_id"];
    _id: ifCommentDocument["_id"];
}

export interface ItemChangeInterface {
    curQuant?: ifItemDocument["curQuant"];
    name?: ifItemDocument["name"];
    maxQuant?: ifItemDocument["maxQuant"];
    minQuant?: ifItemDocument["minQuant"];
}
export interface ItemChangeFindInterface {
    inventory: ifInventoryDocument["_id"];
    _id: ifItemDocument["_id"];
}
export interface ItemNewInterface {
    curQuant: ifItemDocument["curQuant"];
    name: ifItemDocument["name"];
    maxQuant: ifItemDocument["maxQuant"];
    minQuant: ifItemDocument["minQuant"];
    inventory: ifItemDocument["inventory"];
    ip?: ifItemDocument["ip"];
}

export interface ItemDeleteFindInterface {
    inventory: ifInventoryDocument["_id"];
    _id: ifItemDocument["_id"];
}

export interface InventoryChangeInterface {
    name: ifInventoryDocument["name"];
}

export interface TagChangeInterface {
    name: ifTagDocument["name"];
}

export interface UserNewInterface {
    name: ifUserDocument["name"];
    email: ifUserDocument["email"];
    password: string;
    password2: string;
    payment_method_nonce: string;
    phone: ifUserDocument["phone"];
    tier: ifUserDocument["tier"];
}

export interface PaymentReturnInterface {
    custID: string | undefined;
    PayToken: string | undefined;
}

export interface JWTuser {
    tier: ifUserDocument["tier"];
    _id: ifUserDocument["_id"];
    name: ifUserDocument["name"];
    email: ifUserDocument["email"];
    dash: ifUserDocument["dashCode"];
}

export interface RequestWithFiles extends Request {
    files: any;
}

export interface changePassInterface {
    email: ifUserDocument["email"];
    password1: string;
    password2: string;
    phone: ifUserDocument["phone"];
}

export interface custresInterface {
    customer: Customer;
    success: boolean;
}

export interface subresInterface {
    subscription: Subscription;
    success: boolean;
}

export interface cronOutInterface {
    oneWeek: boolean;
    oneMonth: boolean;
}

export interface qdashgenInterface {
    dashCode: ifUserDocument["dashCode"];
    dashUrl: ifUserDocument["dashUrl"];
}

export interface exterr {
    ie: boolean;
    message: string;
}

export interface dashOutInterface {
    tags: ifTagDocument[];
    inventories: ifInventoryDocument[];
}

export interface userCreationInfoInterface {
    codes: {
        dashCode: string,
        dashUrl: string
    },
    password: string,
    payment: PaymentReturnInterface
}