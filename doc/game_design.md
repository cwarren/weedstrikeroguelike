# Design Doc for Weed Strike

### Goals

Weed Strike is a fairly standard, simple roguelike. As such, the player gets
* character advancement/progression (on the mechanics side of things, not necessarily the story side)
  * some opponents that are too challenging to fight in the early stages of the game are easy to beat by the later stages of the game
* inventory management
* primary mob interactions are combat ('attack it' is never a bad choice from a story standpoint)
  * some tactically interesting combat
    * at the very least, players must make decisions about whether to fight or flee a given opponent
* exploration (of procedurally generated content)
* a simple framing story to engage the player and justify the avatar actions, but nothing to deep and little in the way of narrative progression
* a final battle/goal
* other standard roguelike experiences (permadeath, turn-based action, etc.)
  
### Story

The national arboretum has been enspelled by a particularly mischievous fairy. The plants have come alive and taken over the entire area, the creatures have gone strange and dangerous, and generally everything is a mess. The head gardener went in two months ago. The assistant gardener 6 weeks ago. The assistant to the assistant 3 weeks ago. The royal court has since issued a proclamation calling for any landscaper/adventurer to come set things aright, and of course be suitably rewarded upon success. Hearing this, you leave behind your little kitchen garden in the small village where you grew up and leave with nothing but the clothes on your back, and bit of travel food, and your trusty trowel to seek your fortune.

1. find and rescue the missing people
  * head gardener
  * assistant gardener
  * assistant to the assistant gardener
  * anyone else encountered that needs it
1. find the fairy
1. get the fairy to put things back to normal
  * defeat it in combat
  * convince it
  * bribe it / trade it
  * solve its problems

### Mechanics

The game world operates on an 8-dir square grid. There are open spaces, through which entities can move, and blocked spaces (walls) which may not be entered.

The player controls an avatar that moves in the world. The avatar is fundamentally the same as any other game entity (though with more abilities), except that it is controlled by a player rather than an AI. 

Interaction between game entities usually happens by having one run into another. Doing so causes an action to occur between the two. Generally this action is for the active one to attack the other one.

There is a final boss entity. If that entity is defeated then the player wins the game.

