# Design Doc for Weed Strike

### Goals

Weed Strike is a game that illustrates some programming and development patterns that cover the basic functionality of roguelikes. Notably:
* having an evolving design document for the game
  * goals/reasons
  * narrative elements
  * game play elements / mechanics
    * fun factor
* having an evolving project plan
* choosing a deployment target (the web / a browser, in this case)
* organizing the project file system
* using the ROT.js library
* implementing various game functionality
  * game state
  * display components
  * command processing
  * feedback / messages to player
  * persistence of game state (i.e. save and load games)
  * avatar
  * map and navigation
  * help system
  * mobs
  * timing / turn-taking
  * combat
  * mob AI
  * items
  * inventory
* explore and implement various relevant programming patterns and concepts
  * functions as values
  * object oriented programming in javascript
  * factories
  * mixins
  * serialization and deserialization
  * procedural content generation
  * event systems; observers and actors
  * asynchronous actions and callbacks
* be a viable, playable game
  * fun
  * relatively intuitive
  * offers some emergent behavior
  
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

