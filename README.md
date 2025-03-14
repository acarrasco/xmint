# Crossmint Megaverse Challenge

(by Alejandro Carrasco)

## How to run

1. Set the candidate id as an environment variable:

   `export CANDIDATE_ID=xxxx-xxxx-xxxx-xxx`

1. Install module dependencies:

   `npm install`

1. Run the script:

   `npm start`

## Design decisions

The main driving factors behind the decisions have been:

- Keep it simple
- Keep it type-safe
- Prefer virtual methods over if/else for conditional logic

### Megaverse API quirks

- The responses for the goal and the user map aren't homogeneous: we worked around that by converting both to a common domain representation.
- Empty space is a special case: we worked around that by using a variant of the "null object" pattern, giving the empty space its own class.

### Converting the current map to the goal

- The main piece of logic is iterating in parallel over the current map and the desired goal, and applying a transforming action if the elements are different.
- The transforming action is a bit tricky: it can be a `save` or a `delete`, depending on what is the type of goal. To complicate things further, the delete operation needs to know the type of resource we are deleting.
- We could have encapsulated this logic into the domain classes, but it seemed cleaner to leave the domain classes _agnostic_ of the client (despite having bent that rule by letting them know about their resource name; it felt like config data coupling is less offensive than behavioral coupling).

### Testability

The code was written with testing in mind: it is highly composable and dependencies are always supplied as parameters rather than hardcoded.

However, given the nature of the challenge (a lot of exploration and experimentation) plus the help of an expressive static type system, it felt counter-productive to practice TDD here (and once it was working, there was not a lot of incentive to add the tests). The only bug that would have been caught in a mocked environment would have been using an unbound method as the delegate for the `DefaultResourceVisitor`, which was easily spotted and fixed with manual testing.

### Possible improvements

- In the `MegaverseAdapter`, the big switch that creates resources from the map representation is type safe, but not scalable. If the number of combinations was any bigger, parsing the identifiers and having specialized builders would be a better option.
- The `MegaverseClient` has a bit of redundancy when building the requests. If the API had more endpoints, encapsulating each type of request in their own class (while sharing an Abstract Request ancestor and using a _Template Method_ pattern for specifics) would be a good way to factor out the common parts.
- The way of selecting the target and update method in the `CompareAndUpdateAction` class is not very elegant. In a language with more expressive pattern matching the solution wouldn't need the (often) complex visitor pattern.
