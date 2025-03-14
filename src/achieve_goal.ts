import { Client } from "./megaverse_client";
import { DefaultResourceVisitor, Resource } from "./resources";


/**
 * This class selects the appropriate action when updating a resource to match a goal.
 * 
 * If the goal is a space, the action is delete, otherwise the action is save.
 */
export class GetUpdateActionVisitor extends DefaultResourceVisitor<(r: Resource) => Promise<Response>> {
    constructor(protected client: Client) {
        // I hate JS sometimes :-/
        const f = client.save.bind(client);
        super(() => f);
    }

    public visitSpace() {
        return (r: Resource) => this.client.delete(r);
    }
}

/**
 * This class helps select the target for the update action.
 * 
 * If the goal is a valid resource, then the target is the goal itself.
 * 
 * If the goal is a space, then the target should fall back to the current resource (for deletion)
 */
export class GetUpdateTargetVisitor extends DefaultResourceVisitor<Resource | undefined> {
    constructor() {
        super(r => r);
    }

    public visitSpace() {
        return undefined;
    }
}

/**
 * This class implements the logic of converting a current resource to a desired goal resource.
 */
export class CompareAndUpdateAction {
    constructor(
        protected getAction: GetUpdateActionVisitor,
        protected getTarget: GetUpdateTargetVisitor,
    ) {}

    /**
     * Executes the action necessary to convert one resource into another.
     * 
     * @param current the resource in the current map 
     * @param goal the resource in the goal
     * @returns true if the cell was changed, false otherwise.
     */
    public async execute(current: Resource, goal: Resource): Promise<Boolean> {
        if (JSON.stringify(current.getLocation()) !== JSON.stringify(goal.getLocation())) {
            throw Error(`Mismatched locations for ${current} and ${goal}`);
        }

        if (current.equals(goal)) {
            console.log(`Skip ${goal}`);
            return false;
        }

        const target = goal.receive(this.getTarget) || current;
        const action = goal.receive(this.getAction);

        console.log(`Changing from ${current} to ${goal}`);
        await action(target);
        return true;
    }
}

/**
 * Tries to change the current map to match the goal map.
 * 
 * IMPORTANT: the current and goal arrays must be in the same order.
 * 
 * @param current The current resources in the map.
 * @param goal The resources in the goal.
 * @param compareAndUpdateAction  
 */
export async function achieveGoal(current: Resource[], goal: Resource[], compareAndUpdateAction: CompareAndUpdateAction): Promise<number> {
    if (current.length != goal.length) {
        throw new Error(`Mismatched lengths for current and goal (${current.length}, ${goal.length})`);
    }
    let totalChanged = 0;
    for (let i = 0; i < current.length; i++) {
        const isChanged = await compareAndUpdateAction.execute(current[i], goal[i]); 
        totalChanged += Number(isChanged);
    }
    return totalChanged;
}