import * as achieveGoal from "./achieve_goal";
import * as megaverseClient from "./megaverse_client";
import * as megaverseAdapter from "./megaverse_adapter";
import * as fetchRetry from "fetch-retry";

async function run() {
  const myFetch = fetchRetry.default(global.fetch, {
    retries: 5,
    retryDelay: (attempt, _error, _response) => 100 << attempt,
    retryOn: [429],
  });
  const client = megaverseClient.makeDefaultClient();
  const adapter = new megaverseAdapter.MegaverseAdapter(client);
  const compareAndUpdateAction = new achieveGoal.CompareAndUpdateAction(
    new achieveGoal.GetUpdateActionVisitor(client),
    new achieveGoal.GetUpdateTargetVisitor(),
  );

  let changed = 0;
  // repeat until the current map is equal to the goal
  // this should take care of any inconsistencies
  do {
    const [currentResources, goalResources] = await Promise.all([
      adapter.getMapResources(),
      adapter.getGoalResources(),
    ]);

    changed = await achieveGoal.achieveGoal(
      currentResources,
      goalResources,
      compareAndUpdateAction,
    );
    console.log({ changed });
  } while (changed > 0);
}

run();
