import * as achieveGoal from './achieve_goal';
import * as megaverseClient from './megaverse_client';
import * as megaverseAdapter from './megaverse_adapter';

async function run() {
    const client = megaverseClient.makeDefaultClient();
    const adapter = new megaverseAdapter.MegaverseAdapter(client);

    const [currentResources, goalResources] = await Promise.all([
        adapter.getMapResources(),
        adapter.getGoalResources(),
    ]);

    const compareAndUpdateAction = new achieveGoal.CompareAndUpdateAction(
        new achieveGoal.GetUpdateActionVisitor(client),
        new achieveGoal.GetUpdateTargetVisitor(),
    );

    await achieveGoal.achieveGoal(currentResources, goalResources, compareAndUpdateAction);
}

run();