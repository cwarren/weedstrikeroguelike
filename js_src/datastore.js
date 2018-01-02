// a generally accessible datastore object
// NOTE: this holds the objects the game uses, keyed by object ID (and subgroupd - e.g. all maps are in a MAPS sub-namespace). Relationships between game objects (e.g. UI mode play's current map) are tracked via id rather than fully embedding related objects, which greatly eases persistence headaches (among other things).
export let DATASTORE = {};

export function initializeDatastore() {
  DATASTORE = {
    ID_SEQ: 0,
    GAME: {},
    MAPS: {},
    ENTITIES: {}
  };
}