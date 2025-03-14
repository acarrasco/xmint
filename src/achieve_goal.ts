import { Client } from "./megaverse_client";
import { DefaultResourceVisitor, Resource } from "./resources";


/**
 * This class selects the appropriate action when updating a resource to match a goal.
 * 
 * If the goal is a space, the action is delete, other the action is save.
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

    public async execute(current: Resource, goal: Resource) {
        if (current.equals(goal)) {
            return;
        }

        const target = goal.receive(this.getTarget) || current;
        const action = goal.receive(this.getAction);

        await action(target);
    }
}

export async function achieveGoal(current: Resource[], goal: Resource[], compareAndUpdateAction: CompareAndUpdateAction) {
    if (current.length != goal.length) {
        throw new Error(`Mismatched lengths for current and goal (${current.length}, ${goal.length})`);
    }

    for (let i = 0; i < current.length; i++) {
        await compareAndUpdateAction.execute(current[i], goal[i]);
    }
}