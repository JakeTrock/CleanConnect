import { APIGatewayEvent, Context, Callback } from 'aws-lambda';
import * as Comment from './routes/Comment';
import * as Inventory from './routes/Inventory';
import * as Item from './routes/Item';
import * as Tag from './routes/Tag';
import * as User from './routes/User';

const rts = {
    comment: Comment,
    inventory: Inventory,
    item: Item,
    tag: Tag,
    user: User
}
const endpt = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    const body=JSON.parse(event.body);
    rts[body.routing.central][body.routing.secondary](event, context, callback);
};
export { endpt };