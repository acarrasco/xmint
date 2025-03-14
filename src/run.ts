import * as achieveGoal from './achieve_goal';
import * as megaverseClient from './megaverse_client';
import * as megaverseAdapter from './megaverse_adapter';

async function run() {
    const client = megaverseClient.makeDefaultClient();
    const adapter = new megaverseAdapter.MegaverseAdapter(client);
    const compareAndUpdateAction = new achieveGoal.CompareAndUpdateAction(
        new achieveGoal.GetUpdateActionVisitor(client),
        new achieveGoal.GetUpdateTargetVisitor(),
    );

    let changed = 0;
    // repeat until the current map is equal to the goal
    // this should take care of inconsistencies in resource placement order
    do {
        const [currentResources, goalResources] = await Promise.all([
            adapter.getMapResources(),
            adapter.getGoalResources(),
        ]);

        changed = await achieveGoal.achieveGoal(currentResources, goalResources, compareAndUpdateAction);
        console.log({changed});
    } while(changed > 0);
}

run();