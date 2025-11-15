import { Entity } from './Entity.js';

export class EntityManager {
  constructor() {
    this.entities = [];
    this.activeId = 0;
  }

  initDefault() {
    this.entities = [
      new Entity({
        id: 0,
        x: 0,
        y: 0,
        type: 'drone',
        hat: 'Straw_Hat'
      })
    ];
    this.activeId = 0;
  }

  fromPlain(list = []) {
    if (!list.length) return this.initDefault();
    this.entities = list.map(e => new Entity(e));
    this.activeId = this.entities[0].id;
  }

  getAll() { return this.entities; }
  getById(id) { return this.entities.find(e => e.id === id) || null; }
  getActive() { return this.getById(this.activeId); }

  setActive(id) {
    if (this.getById(id)) {
      this.activeId = id;
      return true;
    }
    return false;
  }

  getEntity(id) {
    return id != null ? (this.getById(id) || this.getActive()) : this.getActive();
  }

  move(direction, worldSize, id) {
    const e = this.getEntity(id);
    if (e) e.move(direction, worldSize);
  }

  spawn(refId) {
    const maxId = this.entities.reduce((m, e) => Math.max(m, e.id), -1);
    const newId = maxId + 1;
    const ref = this.getEntity(refId);

    const ent = new Entity({
      id: newId,
      x: ref?.x ?? 0,
      y: ref?.y ?? 0,
      type: ref?.type ?? 'drone',
      hat: ref?.hat ?? 'Straw_Hat'
    });

    this.entities.push(ent);
    return ent;
  }

  despawn(id) {
    const idx = this.entities.findIndex(e => e.id === id);
    if (idx < 0) return;

    this.entities.splice(idx, 1);

    if (!this.entities.length) {
      this.initDefault();
    }

    if (this.activeId === id) {
      this.activeId = this.entities[0].id;
    }
  }

  reset() {
    this.initDefault();
  }

  toPlain() {
    return this.entities.map(e => e.toPlain());
  }
}
