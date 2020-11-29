import { Customer, Subscription } from 'braintree';
import User from './models/User';
import UserIndex from './models/UserIndex';
import Comment from './models/Comment';
import Item from './models/Item';
import Inventory from './models/Inventory';
import Tag from './models/Tag';

// export interface allSettledOut {
//     status: "fulfilled" | "rejected",
//     value: any
// }

// export type genericModel = User|UserIndex|Comment|Item|Inventory|Tag;

export interface reqBody {
    routing: {
        central: string,
        secondary: string,
        ip: string,
        token1?: string,
        token2?: string,
        authorization?: string
    },
    data: {
        name?: string,
        email?: string,
        password?: string,
        password2?: string,
        payment_method_nonce?: string,
        phone?: string,
        tier?: number,
        showDead?: boolean,
        image?: string,
        text?: string,
        sev?: number,
        maxQuant?: number,
        minQuant?: number,
        curQuant?: number,
        newVal?: number
    }
}

export interface mailOut {
    success: boolean;
    status: String;
}

export interface UserChangeFields {
    name?: User["name"];
    email?: User["email"];
    phone?: User["phone"];
    tier?: User["tier"];
    payment_method_nonce?: string;
}

export interface UserIndexCreateFields {
    id: UserIndex["id"];
    email: UserIndex["email"];
    prefix: string;
    ic: UserIndex["isCritical"];
}

export interface UserIndexCfOut {
    findUser: User;
    delIndex: UserIndex;
}

export interface CommentInputData {
    ip?: Comment["ip"];
    tag: Comment["tag"];
    text: Comment["text"];
    img?: Comment["img"];
    sev: Comment["sev"];
}

export interface ItemChangeInterface {
    curQuant?: Item["curQuant"];
    name?: Item["name"];
    maxQuant?: Item["maxQuant"];
    minQuant?: Item["minQuant"];
}
export interface ItemChangeFindInterface {
    inventory: Inventory["id"];
    id: Item["id"];
}
export interface ItemNewInterface {
    curQuant: Item["curQuant"];
    name: Item["name"];
    maxQuant: Item["maxQuant"];
    minQuant: Item["minQuant"];
    inventory: Item["inventory"];
    ip?: Item["ip"];
}

export interface ItemDeleteFindInterface {
    inventory: Inventory["id"];
    id: Item["id"];
}

export interface InventoryChangeInterface {
    name: Inventory["name"];
}

export interface TagChangeInterface {
    name: Tag["name"];
}

export interface UserNewInterface {
    name: User["name"];
    email: User["email"];
    password: string;
    password2: string;
    payment_method_nonce: string;
    phone: User["phone"];
    tier: User["tier"];
}

export interface PaymentReturnInterface {
    custID: string | undefined;
    PayToken: string | undefined;
}

export interface JWTuser {
    tier: User["tier"];
    id: User["id"];
    name: User["name"];
    email: User["email"];
    dash: User["dashCode"];
}

export interface changePassInterface {
    email: User["email"];
    password: string;
    password2: string;
    phone: User["phone"];
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
    dashCode: User["dashCode"];
    dashUrl: User["dashUrl"];
}

export interface exterr {
    ie: boolean;
    message: string;
}

export interface dashOutInterface {
    tags: Tag[];
    inventories: Inventory[];
}

export interface userCreationInfoInterface {
    codes: {
        dashCode: string,
        dashUrl: string
    },
    password: string,
    payment: PaymentReturnInterface
}