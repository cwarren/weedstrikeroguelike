# Weed Strike Project Plan

This is the project plan for Weed Strike. This covers general planning thoughts in addition to tasks and milestones. This is NOT a design document for the game.

1. better message system
  1. archive/log of messages (queue of size x)
  1. which age out as turn are taken
  1. old ones are visible via a separate UI mode
  1. message log persisted
1. basic combat
  1. get rid of the jagged protrusion entity that was used to test avatar HP loss
  1. multiple entities on the map
  1. melee attacker mixin
    1. bumping into an entity attacks it
    1. if hit, deal damage to the bummped entity (from the bumper to the bumpee)
  1. entities that are killed are removed from the map and the datastore
1. game ending
  1. killing x entities wins the game
  1. after y turns lose 1 hp per turn
  1. being killed loses the game
    