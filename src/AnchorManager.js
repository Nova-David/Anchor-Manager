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
        this.x = vector.x ? vector.x : 0;
        this.y = vector.y ? vector.y : 0;
        this.z = vector.z ? vector.z : 0;
        return this;
    }

    clone() {
        const clone = new Vector();
        clone.copy(this);
        return clone;
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
        this.lastPosition = new Vector();
        this.position = new Vector();
        this.lastSize = new Vector();
        this.size = null;
        this.relativePosition = new Vector();
    }

    updatePosition() {
        this.position.copy(this.object.position);
    }

    moved() {
        if (!this.position.equals(this.object.position)) {
            this.lastPosition.copy(this.position);
            this.position.copy(this.object.position);
            return true;
        }

        return false;
    }

    getPositionDisplacement() {
        const displacement = new Vector();
        displacement.copy(this.position);

        return displacement.subVec(this.lastPosition);
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
z   
    resized() {
        const currentSize = this.getSize();
        if (!this.size.equals(currentSize)) {
            this.lastSize.copy(this.size);
            this.size.copy(currentSize);
            return true;
        }
        
        return false;
    }

    getPointDisplacement(point, reversed=1) {
        const displacement = this.getPoint(point, this.lastSize);
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
        this.anchorPoint = null;
        this.originPoint = null;
        this.lastPosition = null;
        this.relativePosition = null;
        this.scale;

        this.elem.updatePosition();
        this.elem.updateSize();
        this.scale = obj.scale;
    }

    placeObj() {
        const childDisplacement = new Vector();
        childDisplacement.copy(this.elem.position);
        this.elem.to(this.parent.object.position);

        const displacement = this.parent.getPoint(this.anchorPoint);
        displacement.subVec(this.elem.getPoint(this.originPoint));
        this.elem.moveBy(displacement.offset())
        this.elem.updatePosition();
        childDisplacement.subVec(this.elem.position).negate();
        this.refill();
        this.updateChildren(childDisplacement);
        this.elem.updateSize();
    }

    getRelativePosition() {
        const displacement = this.parent.getPoint(this.anchorPoint);
        displacement.subVec(this.elem.getPoint(this.originPoint));

        return displacement;
    }

    displace(displacement) {
        this.elem.moveBy(displacement);
    }

    updateChildren(displacement = null) {
        for (const child of this.children) {
            // console.log(child.elem.object.name, "UPDATING")
            child.update();
            // if (displacement) child.update(displacement.clone())
            // else child.update(displacement);
        }
    }

    addParent(parent, params) { 
        const anchorPoint = params.anchor ? 
            (new Vector()).copy(params.anchor) :
            new Vector();
        const originPoint = params.origin ? 
            (new Vector()).copy(params.origin) : 
            new Vector();

        this.fill = new Vector();
        for (const k of Object.keys(this.fill)) {
            if (anchorPoint[k] == FILL) {
                this.fill[k] = true;
                anchorPoint[k] = CENTER;
                originPoint[k] = CENTER;
                console.log(this.fill, anchorPoint, originPoint)
            }
        }

        this.padding = new Vector()
        if (params.padding) this.padding.copy(params.padding);

        this.parent = parent;
        this.relativePosition = new Vector();
        this.lastPosition = new Vector();
        this.setAttr(anchorPoint, originPoint)
        this.placeObj();
    }

    addChild(obj) { this.children.push(obj) }

    setAttr(anchorPoint, point) {
        this.anchorPoint = anchorPoint;
        this.originPoint = point;
    }

    attach(obj, params) {
        const child = new Anchor(obj);
        child.addParent(this.elem, params);
        this.children.push(child);

        return child;
    }

    attachAnchor(anchor, points) {
        anchor.addParent(this.elem, params);
        this.children.push(anchor);

        return anchor;
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

    refill() {
        if (this.fill.x)
            this.elem.object.scale.x = (this.parent.object.scale.x - this.padding.x*2) + 0.003;
        if (this.fill.y)
            this.elem.object.scale.y = (this.parent.object.scale.y - this.padding.y*2) + 0.003;
        if (this.fill.z)
            this.elem.object.scale.z = (this.parent.object.scale.z - this.padding.z*2) + 0.003;

        this.elem.resized();
    }

    update(displacement = null) {
        // if (displacement) {
        //     // console.log("Parent moved", displacement);
        //     if (this.parent.buffer) {
        //         displacement.addVec(this.parent.getPointDisplacement(this.anchorPoint));
        //         this.refill();
        //     }

        //     this.displace(displacement);
        //     this.updateChildren(displacement);
        //     this.elem.updateSize();

        //     return;
        // }

        if (this.padding)
            this.refill();

        if (this.parent && this.parent.moved()) {
            const displacement = this.parent.getPositionDisplacement();
            this.displace(displacement);
        } else if (this.parent && this.parent.resized()) {
            console.log("Parent resized");
            const displacement = this.getPosition();
            console.log(displacement);
            this.elem.to(this.parent.position);
            this.elem.moveBy(displacement);

        } else if (this.elem.resized()) {
            console.log("I RESIZED");


        }

        this.updateChildren();

        // if (this.elem.moved()) {
        //     displacement = this.elem.getPositionDisplacement();
        //     this.elem.updatePosition();
        //     this.updateChildren(displacement);
        // } else if (this.elem.resized()) {
        //     if (this.parent) {
        //         displacement = this.elem.getPointDisplacement(this.originPoint, -1);
        //         this.displace(displacement);
        //     } else
        //         displacement = new Vector();

        //     this.updateChildren(displacement);
        //     this.elem.updateSize();
        // } else
        //     this.updateChildren();
    }

    findAnchor(object) {
        if (object.uuid == this.elem.object.uuid) return this;
        else {
            let anchor = null;

            for(const child of this.children) {
                anchor = child.findAnchor(object);
                if (anchor) break;
            }

            return anchor;
        }
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

    attach(object, params) {
        this.buffer = { object, params, anchor: null };

        for (const anchor of this.tracking) {
            if (anchor.elem.object.uuid == object.uuid) {
                this.buffer.anchor = anchor;
                break;
            }
        }

        return this;
    }

    to(object) {
        let parent;

        for (const anchor of this.tracking) {
            if (!parent) parent = anchor.findAnchor(object);
            if (parent) break;
        }

        if (!parent) parent = this.new(object);
        
        const anchor = this.buffer.anchor ? 
            parent.attachAnchor(this.buffer.anchor, this.buffer.params) :
            parent.attach(this.buffer.object, this.buffer.params);
            
        this.buffer = null;

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
export const FILL = 100;