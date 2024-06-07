import { Box3 } from 'three/src/math/Box3.js';

class Vector {
    constructor(x = 0, y = 0, z = 0) {
        this.precision = 4;
        this.set(x, y, z);
    }

    set(x, y, z) {
        this.x = round(x, this.precision);
        this.y = round(y, this.precision);
        this.z = round(z, this.precision);
    }

    isZero() {
        return (
            this.x == 0.0000 &&
            this.y == 0.0000 &&
            this.z == 0.0000
        )
    }

    copy(vector) {
        this.x = vector.x;
        this.y = vector.y;
        this.z = vector.z;
    }

    addLocal(x, y, z) {
        this.x += x;
        this.y += y;
        this.z += z
        return this;
    }

    subLocal(x, y, z) {
        this.x -= x;
        this.y -= y;
        this.z -= z
        return this;
    }

    addVec(vector) {
        this.x += vector.x,
        this.y += vector.y,
        this.z += vector.z
        return this;
    }
    
    subVec(vector) {
        this.x -= vector.x,
        this.y -= vector.y,
        this.z -= vector.z
        return this;
    }

    add(vector) {
        return new Vector(
            this.x + vector.x,
            this.y + vector.y,
            this.z + vector.z
        )
    }

    sub(vector) {
        return new Vector(
            this.x - vector.x,
            this.y - vector.y,
            this.z - vector.z
        )
    }

    equals(vector) {
        return (
            Math.abs(this.x - vector.x) <= 0.0001 &&
            Math.abs(this.y - vector.y) <= 0.0001 &&
            Math.abs(this.z - vector.z) <= 0.0001
        );
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }

    offset() {
        this.x -= 0.001;
        this.y += 0.001;
        this.z += 0.001;

        return this;
    }

    negate() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    }

    negative() {
        return new Vector(-this.x, -this.y, -this.z)
    }
}

class Element {
    constructor(object) {
        this.object = object;
        this.buffer = null;
        this.size = null;
        this.position = null;
        this.relativePosition = new Vector();
    }

    updatePosition() {
        if (!this.position)
            this.position = new Vector();
        
        this.position.copy(this.object.position);
    }

    moved() {
        if (!this.position) return false;
        return !this.position.equals(this.object.position)
    }

    getPositionDisplacement() {
        const displacement = new Vector();
        displacement.copy(this.object.position);

        return displacement.subVec(this.position);
    }

    getSize() {
        const box = new Box3();
        box.setFromObject(this.object);
        
        const w = box.max.x - box.min.x;
        const h = box.max.y - box.min.y;
        const d = box.max.z - box.min.z;

        return new Vector(w, h, d);
    }

    updateSize(buffer = null) {
        if (!buffer) {
            this.size = this.getSize();
        } else {
            this.size = buffer;
            buffer = null;
        }
    }

    resized() {
        this.buffer = this.getSize();
        if (this.size.equals(this.buffer)) {
            this.buffer = null;
            return false
        }
        
        return true;
    }

    getPointDisplacement(point, reversed=1) {
        const displacement = this.getPoint(point, this.buffer);
        // console.log("To", displacement, this.buffer);

        displacement.subVec(this.getPoint(point));
        // console.log("Moved", displacement, this.size);
        return reversed > 0 ? displacement : displacement.negate();
    }

    getPoint(point, object = this.size) {
        return new Vector(
            object.x/2 * point.x,
            object.y/2 * point.y,
            object.z/2 * point.z,
        );
    }

    set(x, y, z) {
        const vec = new Vector(x, y, z);
        vec.subVec(this.relativePosition);
        this.relativePosition.set(x, y, z);
        this.moveBy(vec);
    }

    setX(x) { this.set(x, 0, 0); }
    setY(y) { this.set(0, y, 0); }
    setZ(z) { this.set(0, 0, z); }

    add(x, y, z) {
        const vec = new Vector(x, y, z);
        this.relativePosition.addVec(vec);
        this.moveBy(vec);
    }

    addX(x) { this.add(x, 0, 0); }
    addY(y) { this.add(0, y, 0); }
    addZ(z) { this.add(0, 0, z); }

    to(vector) {
        this.object.position.x = vector.x;
        this.object.position.y = vector.y;
        this.object.position.z = vector.z; 
    }

    moveBy(vector) {
        this.object.position.x += vector.x;
        this.object.position.y += vector.y;
        this.object.position.z += vector.z; 
    }
}

class Anchor {
    constructor(obj) {
        this.parent = null;
        this.children = [];
        this.displacement = 0;
        this.elem = new Element(obj);
        this.parentPoint = null;
        this.point = null;
        this.lastPosition = null;
        this.relativePosition = null;
        this.scale;

        this.elem.updatePosition();
        this.elem.updateSize();
        this.scale = obj.scale;
    }

    placeObj() {
        this.elem.to(this.parent.object.position);

        const displacement = this.parent.getPoint(this.parentPoint);
        displacement.subVec(this.elem.getPoint(this.point));
        this.elem.moveBy(displacement.offset())
        this.elem.updatePosition();
    }

    displace(displacement) {
        this.elem.moveBy(displacement);
        this.elem.updatePosition();
    }

    updateChildren(displacement = null) {
        for (const child of this.children) {
            child.update(displacement);
        }
    }

    addParent(obj) { this.parent = obj }
    addChild(obj) { this.children.push(obj) }

    setAttr(parentPoint, point) {
        this.parentPoint = parentPoint;
        this.point = point;
    }

    attach(obj, points) {
        const parentPoint = new Vector(points.parent[0], points.parent[1], points.parent[2]);
        const point = new Vector(points.child[0], points.child[1], points.child[2]);

        const child = new Anchor(obj);
        child.addParent(this.elem);
        child.relativePosition = new Vector();
        child.lastPosition = new Vector();
        child.setAttr(parentPoint, point);
        child.placeObj();
        this.children.push(child);

        return child;
    }

    add(x, y, z) {
        const delta = new Vector(x, y, z);
        if (!delta.isZero()) {
            this.relativePosition.addVec(delta);
            this.elem.moveBy(delta);
            this.updateChildren(delta);
            this.elem.updatePosition();
        }
    }

    addX(x) { this.add(x, 0, 0); }
    addY(y) { this.add(0, y, 0); }
    addZ(z) { this.add(0, 0, z); }

    update(displacement = null) {
        if (displacement) {
            console.log("Parent moved", displacement);
            if (this.parent.buffer) {
                displacement.addVec(this.parent.getPointDisplacement(this.parentPoint));
            }

            this.displace(displacement);
            this.updateChildren(displacement);

            return;
        }

        if (this.elem.moved()) {
            displacement = this.elem.getPositionDisplacement();
            this.elem.updatePosition();
            console.log("I MOVED");
            this.updateChildren(displacement);
        } else if (this.elem.resized()) {
            if (this.parent) {
                displacement = this.elem.getPointDisplacement(this.point, -1);
                this.displace(displacement);
            } else
                displacement = new Vector();

            this.updateChildren(displacement);
            this.elem.updateSize();
        } else
            this.updateChildren();
    }
}

class AnchorManager {
    constructor() {
        this.tracking = [];
        this.buffer = null;
        this.debug = {
            changed: false
        }
    }

    new(obj) {
        const anchor = new Anchor(obj);
        this.tracking.push(anchor);
        return anchor;
    }

    update() {
        for(const anchor of this.tracking) {
            anchor.update();
        }
    }

}

const round = (x, decimals) => {
    return Math.round(x * (10 ** decimals)) / (10 ** decimals)
}

export { AnchorManager, Vector }

export const CENTER = 0;
export const TOP = 1;
export const BOTTOM = -1;
export const LEFT = -1;
export const RIGHT = 1;
export const BACK = -1;
export const FRONT = 1;
