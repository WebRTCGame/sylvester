const Sylvester = {
  version: "0.1.3",
  precision: 1e-6
};

export class Vector {
  constructor(a) {
    this.setElements(a);
    Object.seal(this);
    Object.freeze(this);

  }

  dimensions() {
    return this.elements.length;
  }

  e(a) {
    return 1 > a || a > this.elements.length ? null : this.elements[a - 1];
  }

  modulus() {
    return Math.sqrt(this.dot(this));
  }

  eql(a) {
    let b = this.elements.length;
    a = a.elements || a;
    if (b != a.length) return !1;

    do {
      if (Math.abs(this.elements[b - 1] - a[b - 1]) > Sylvester.precision) {
        return !1;
      }
    } while (--b);
    return !0;
  }

  dup() {
    return new Vector(this.elements);
  }

  map(a) {
    const b = [];
    this.each((c, d) => {
      b.push(a(c, d));
    });
    return new Vector(b);
  }

  each(a) {
    let b = this.elements.length;
    const c = b;
    do {
      const d = c - b;
      a(this.elements[d], d + 1);
    } while (--b);
  }

  toUnitVector() {
    const a = this.modulus();
    return 0 === a ? this.dup() : this.map(b => b / a);
  }

  angleFrom(a) {
    const b = a.elements || a;
    if (this.elements.length != b.length) return null;

    let c = 0;
    let d = 0;
    let e = 0;
    this.each((a, g) => {
      c += a * b[g - 1];
      d += a * a;
      e += b[g - 1] * b[g - 1];
    });
    d = Math.sqrt(d);
    e = Math.sqrt(e);
    if (0 === d * e) return null;

    a = c / (d * e);
    -1 > a && (a = -1);
    1 < a && (a = 1);
    return Math.acos(a);
  }

  isParallelTo(a) {
    a = this.angleFrom(a);
    return null === a ? null : a <= Sylvester.precision;
  }

  isAntiparallelTo(a) {
    a = this.angleFrom(a);
    return null === a ? null : Math.abs(a - Math.PI) <= Sylvester.precision;
  }

  isPerpendicularTo(a) {
    a = this.dot(a);
    return null === a ? null : Math.abs(a) <= Sylvester.precision;
  }

  add(a) {
    const b = a.elements || a;
    return this.elements.length != b.length
      ? null
      : this.map((a, d) => a + b[d - 1]);
  }

  subtract(a) {
    const b = a.elements || a;
    return this.elements.length != b.length
      ? null
      : this.map((a, d) => a - b[d - 1]);
  }

  multiply(a) {
    return this.map(b => b * a);
  }

  x(a) {
    return this.multiply(a);
  }

  dot(a) {
    a = a.elements || a;
    let b = 0;
    let c = this.elements.length;
    if (c != a.length) return null;

    do {
      b += this.elements[c - 1] * a[c - 1];
    } while (--c);
    return b;
  }

  cross(a) {
    a = a.elements || a;
    if (3 != this.elements.length || 3 != a.length) return null;

    const b = this.elements;
    return new Vector([
      b[1] * a[2] - b[2] * a[1],
      b[2] * a[0] - b[0] * a[2],
      b[0] * a[1] - b[1] * a[0]
    ]);
  }

  max() {
    let a = 0;
    let b = this.elements.length;
    const c = b;
    do {
      const d = c - b;
      Math.abs(this.elements[d]) > Math.abs(a) && (a = this.elements[d]);
    } while (--b);
    return a;
  }


  indexOf(a) {
    let b = null;
    let c = this.elements.length;
    const d = c;
    do {
      const e = d - c;
      null === b && this.elements[e] == a && (b = e + 1);
    } while (--c);
    return b;
  }

  toDiagonalMatrix() {
    return Matrix.Diagonal(this.elements);
  }

  round() {
    return this.map(a => Math.round(a));
  }

  snapTo(a) {
    return this.map(b => (Math.abs(b - a) <= Sylvester.precision ? a : b));
  }

  distanceFrom(a) {
    if (a.anchor) return a.distanceFrom(this);

    const b = a.elements || a;
    if (b.length != this.elements.length) return null;

    let c = 0;
    let d;
    this.each((a, f) => {
      d = a - b[f - 1];
      c += d * d;
    });
    return Math.sqrt(c);
  }

  liesOn(a) {
    return a.contains(this);
  }

  liesIn(a) {
    return a.contains(this);
  }

  rotate(a, b) {
    switch (this.elements.length) {
      case 2:
        let c = b.elements || b;
        if (2 != c.length) return null;

        let d = Matrix.Rotation(a).elements;
        let e = this.elements[0] - c[0];
        let f = this.elements[1] - c[1];
        return new Vector([
          c[0] + d[0][0] * e + d[0][1] * f,
          c[1] + d[1][0] * e + d[1][1] * f
        ]);
      case 3:
        if (!b.direction) return null;

        const g = b.pointClosestTo(this).elements;
        d = Matrix.Rotation(a, b.direction).elements;
        e = this.elements[0] - g[0];
        f = this.elements[1] - g[1];
        c = this.elements[2] - g[2];
        return new Vector([
          g[0] + d[0][0] * e + d[0][1] * f + d[0][2] * c,
          g[1] + d[1][0] * e + d[1][1] * f + d[1][2] * c,
          g[2] + d[2][0] * e + d[2][1] * f + d[2][2] * c
        ]);
      default:
        return null;
    }
  }

  reflectionIn(a) {
    if (a.anchor) {
      const b = [...this.elements];
      a = a.pointClosestTo(b).elements;
      return new Vector([
        a[0] + (a[0] - b[0]),
        a[1] + (a[1] - b[1]),
        a[2] + (a[2] - (b[2] || 0))
      ]);
    }
    const c = a.elements || a;
    return this.elements.length != c.length
      ? null
      : this.map((a, b) => c[b - 1] + (c[b - 1] - a));
  }

  to3D() {
    const a = this.dup();
    switch (a.elements.length) {
      case 3:
        break;
      case 2:
        a.elements.push(0);
        break;
      default:
        return null;
    }
    return a;
  }

  inspect() {
    return `[${this.elements.join(", ")}]`;
  }

  setElements(a) {
    this.elements = [...(a.elements || a)];
    return this;
  }

  static create(a) {
    return new Vector(a);
  }

  static Random(a) {
    const b = [];
    do {
      b.push(Math.random());
    } while (--a);
    return new Vector(b);
  }

  static Zero(a) {
    const b = [];
    do {
      b.push(0);
    } while (--a);
    return new Vector(b);
  }
}

Vector.i = new Vector([1, 0, 0]);
Vector.j = new Vector([0, 1, 0]);
Vector.k = new Vector([0, 0, 1]);

export class Matrix {
  constructor(a) {
    this.setElements(a);
    Object.seal(this);
    Object.freeze(this);
  }
  e(a, b) {
    return 1 > a ||
      a > this.elements.length ||
      1 > b ||
      b > this.elements[0].length
      ? null
      : this.elements[a - 1][b - 1];
  }

  row(a) {
    return a > this.elements.length ? null : new Vector(this.elements[a - 1]);
  }

  col(a) {
    if (a > this.elements[0].length) return null;

    const b = [];
    let c = this.elements.length;
    const d = c;
    do {
      const e = d - c;
      b.push(this.elements[e][a - 1]);
    } while (--c);
    return new Vector(b);
  }

  rows() {
    return this.elements.length;
  }

  cols() {
    return this.elements[0].length;
  }

  dimensions() {
    return {
      rows: this.elements.length,
      cols: this.elements[0].length
    };
  }





  eql(a) {
    a = a.elements || a;
    "undefined" == typeof a[0][0] && (a = new Matrix(a).elements);
    if (
      this.elements.length != a.length ||
      this.elements[0].length != a[0].length
    ) {
      return !1;
    }

    let b = this.elements.length;
    const c = b;
    const d = this.elements[0].length;
    do {
      const e = c - b;
      let f = d;
      do {
        const g = d - f;
        if (Math.abs(this.elements[e][g] - a[e][g]) > Sylvester.precision)
          return !1;
      } while (--f);
    } while (--b);
    return !0;
  }

  dup() {
    return new Matrix(this.elements);
  }

  map(a) {
    const b = [];
    let c = this.elements.length;
    const d = c;
    const e = this.elements[0].length;
    do {
      const f = d - c;
      let g = e;
      b[f] = [];
      do {
        const h = e - g;
        b[f][h] = a(this.elements[f][h], f + 1, h + 1);
      } while (--g);
    } while (--c);
    return new Matrix(b);
  }

  isSameSizeAs(a) {
    a = a.elements || a;
    "undefined" == typeof a[0][0] && (a = new Matrix(a).elements);
    return (
      this.elements.length == a.length && this.elements[0].length == a[0].length
    );
  }

  add(a) {
    let b = a.elements || a;
    "undefined" == typeof b[0][0] && (b = new Matrix(b).elements);
    return this.isSameSizeAs(b)
      ? this.map((a, d, e) => a + b[d - 1][e - 1])
      : null;
  }

  subtract(a) {
    let b = a.elements || a;
    "undefined" == typeof b[0][0] && (b = new Matrix(b).elements);
    return this.isSameSizeAs(b)
      ? this.map((a, d, e) => a - b[d - 1][e - 1])
      : null;
  }

  canMultiplyFromLeft(a) {
    a = a.elements || a;
    "undefined" == typeof a[0][0] && (a = new Matrix(a).elements);
    return this.elements[0].length == a.length;
  }

  multiply(a) {
    if (!a.elements) return this.map(b => b * a);

    const b = a.modulus ? !0 : !1;
    let c = a.elements || a;
    "undefined" == typeof c[0][0] && (c = new Matrix(c).elements);
    if (!this.canMultiplyFromLeft(c)) return null;

    let d = this.elements.length;
    const e = d;
    const f = c[0].length;
    const g = this.elements[0].length;
    const h = [];
    do {
      const k = e - d;
      h[k] = [];
      let l = f;
      do {
        const m = f - l;
        let n = 0;
        let p = g;
        do {
          const q = g - p;
          n += this.elements[k][q] * c[q][m];
        } while (--p);
        h[k][m] = n;
      } while (--l);
    } while (--d);
    c = new Matrix(h);
    return b ? c.col(1) : c;
  }

  x(a) {
    return this.multiply(a);
  }

  minor(a, b, c, d) {
    const e = [];
    let f = c;
    const g = this.elements.length;
    const h = this.elements[0].length;
    do {
      const k = c - f;
      e[k] = [];
      let l = d;
      do {
        const m = d - l;
        e[k][m] = this.elements[(a + k - 1) % g][(b + m - 1) % h];
      } while (--l);
    } while (--f);
    return new Matrix(e);
  }

  transpose() {
    const a = this.elements.length;
    const b = this.elements[0].length;
    const c = [];
    let d = b;
    do {
      const e = b - d;
      c[e] = [];
      let f = a;
      do {
        const g = a - f;
        c[e][g] = this.elements[g][e];
      } while (--f);
    } while (--d);
    return new Matrix(c);
  }

  isSquare() {
    return this.elements.length == this.elements[0].length;
  }

  max() {
    let a = 0;
    let b = this.elements.length;
    const c = b;
    const d = this.elements[0].length;
    do {
      const e = c - b;
      let f = d;
      do {
        const g = d - f;
        Math.abs(this.elements[e][g]) > Math.abs(a) &&
          (a = this.elements[e][g]);
      } while (--f);
    } while (--b);
    return a;
  }

  indexOf(a) {
    let b = this.elements.length;
    const c = b;
    const d = this.elements[0].length;
    do {
      const e = c - b;
      let f = d;
      do {
        const g = d - f;
        if (this.elements[e][g] == a) {
          return {
            i: e + 1,
            j: g + 1
          };
        }
      } while (--f);
    } while (--b);
    return null;
  }

  diagonal() {
    if (!this.isSquare) return null;

    const a = [];
    let b = this.elements.length;
    const c = b;
    do {
      const d = c - b;
      a.push(this.elements[d][d]);
    } while (--b);
    return new Vector(a);
  }

  toRightTriangular() {
    const a = this.dup();
    let b = this.elements.length;
    const c = b;
    const d = this.elements[0].length;
    do {
      const e = c - b;
      if (0 == a.elements[e][e]) {
        for (j = e + 1; j < c; j++) {
          if (0 != a.elements[j][e]) {
            var f = [];
            var g = d;
            do {
              var h = d - g;
              f.push(a.elements[e][h] + a.elements[j][h]);
            } while (--g);
            a.elements[e] = f;
            break;
          }
        }
      }
      if (0 != a.elements[e][e]) {
        for (j = e + 1; j < c; j++) {
          const k = a.elements[j][e] / a.elements[e][e];
          f = [];
          g = d;
          do {
            (h = d - g),
              f.push(h <= e ? 0 : a.elements[j][h] - a.elements[e][h] * k);
          } while (--g);
          a.elements[j] = f;
        }
      }
    } while (--b);
    return a;
  }

  toUpperTriangular() {
    return this.toRightTriangular();
  }

  determinant() {
    if (!this.isSquare()) return null;

    const a = this.toRightTriangular();
    let b = a.elements[0][0];
    let c = a.elements.length - 1;
    const d = c;
    do {
      const e = d - c + 1;
      b *= a.elements[e][e];
    } while (--c);
    return b;
  }

  det() {
    return this.determinant();
  }

  isSingular() {
    return this.isSquare() && 0 === this.determinant();
  }

  trace() {
    if (!this.isSquare()) return null;

    let a = this.elements[0][0];
    let b = this.elements.length - 1;
    const c = b;
    do {
      const d = c - b + 1;
      a += this.elements[d][d];
    } while (--b);
    return a;
  }

  tr() {
    return this.trace();
  }

  rank() {
    const a = this.toRightTriangular();
    let b = 0;
    let c = this.elements.length;
    const d = c;
    const e = this.elements[0].length;
    do {
      const f = d - c;
      let g = e;
      do {
        const h = e - g;
        if (Math.abs(a.elements[f][h]) > Sylvester.precision) {
          b++;
          break;
        }
      } while (--g);
    } while (--c);
    return b;
  }

  rk() {
    return this.rank();
  }

  augment(a) {
    a = a.elements || a;
    "undefined" == typeof a[0][0] && (a = new Matrix(a).elements);
    const b = this.dup();
    const c = b.elements[0].length;
    let d = b.elements.length;
    const e = d;
    const f = a[0].length;
    if (d != a.length) return null;

    do {
      const g = e - d;
      let h = f;
      do {
        const k = f - h;
        b.elements[g][c + k] = a[g][k];
      } while (--h);
    } while (--d);
    return b;
  }

  inverse() {
    if (!this.isSquare() || this.isSingular()) return null;

    let a = this.elements.length;
    const b = a;
    const c = this.augment(Matrix.I(a)).toRightTriangular();
    const d = c.elements[0].length;
    const e = [];
    do {
      const f = a - 1;
      let g = [];
      let h = d;
      e[f] = [];
      let k = c.elements[f][f];
      do {
        var l = d - h;
        const m = c.elements[f][l] / k;
        g.push(m);
        l >= b && e[f].push(m);
      } while (--h);
      c.elements[f] = g;
      for (k = 0; k < f; k++) {
        g = [];
        h = d;
        do {
          (l = d - h),
            g.push(c.elements[k][l] - c.elements[f][l] * c.elements[k][f]);
        } while (--h);
        c.elements[k] = g;
      }
    } while (--a);
    return new Matrix(e);
  }

  inv() {
    return this.inverse();
  }

  round() {
    return this.map(a => Math.round(a));
  }

  snapTo(a) {
    return this.map(b => (Math.abs(b - a) <= Sylvester.precision ? a : b));
  }

  inspect() {
    const a = [];
    let b = this.elements.length;
    const c = b;
    do {
      const d = c - b;
      a.push(new Vector(this.elements[d]).inspect());
    } while (--b);
    return a.join("\n");
  }

  setElements(a) {
    const b = a.elements || a;
    if ("undefined" != typeof b[0][0]) {
      var c = b.length;
      var d = c;
      let e;
      this.elements = [];
      do {
        a = d - c;
        const f = (e = b[a].length);
        this.elements[a] = [];
        do {
          const g = f - e;
          this.elements[a][g] = b[a][g];
        } while (--e);
      } while (--c);
      return this;
    }
    d = c = b.length;
    this.elements = [];
    do {
      (a = d - c), this.elements.push([b[a]]);
    } while (--c);
    return this;
  }

  static create(a) {
    return new Matrix(a);
  }

  static I(a) {
    const b = [];
    const c = a;
    do {
      const d = c - a;
      b[d] = [];
      let e = c;
      do {
        const f = c - e;
        b[d][f] = d == f ? 1 : 0;
      } while (--e);
    } while (--a);
    return new Matrix(b);
  }

  static Diagonal(a) {
    let b = a.length;
    const c = b;
    const d = Matrix.I(b);
    do {
      const e = c - b;
      d.elements[e][e] = a[e];
    } while (--b);
    return d;
  }

  static Rotation(a, b) {
    if (!b) {
      return new Matrix([
        [Math.cos(a), -Math.sin(a)],
        [Math.sin(a), Math.cos(a)]
      ]);
    }
    let c = b.dup();
    if (3 != c.elements.length) return null;

    let d = c.modulus();
    const e = c.elements[0] / d;
    const f = c.elements[1] / d;
    c = c.elements[2] / d;
    d = Math.sin(a);
    const g = Math.cos(a);
    const h = 1 - g;
    return new Matrix([
      [h * e * e + g, h * e * f - d * c, h * e * c + d * f],
      [h * e * f + d * c, h * f * f + g, h * f * c - d * e],
      [h * e * c - d * f, h * f * c + d * e, h * c * c + g]
    ]);
  }

  static RotationX(a) {
    const b = Math.cos(a);
    a = Math.sin(a);
    return new Matrix([[1, 0, 0], [0, b, -a], [0, a, b]]);
  }

  static RotationY(a) {
    const b = Math.cos(a);
    a = Math.sin(a);
    return new Matrix([[b, 0, a], [0, 1, 0], [-a, 0, b]]);
  }

  static RotationZ(a) {
    const b = Math.cos(a);
    a = Math.sin(a);
    return new Matrix([[b, -a, 0], [a, b, 0], [0, 0, 1]]);
  }

  static Random(a, b) {
    return Matrix.Zero(a, b).map(() => Math.random());
  }

  static Zero(a, b) {
    const c = [];
    let d = a;
    do {
      const e = a - d;
      c[e] = [];
      let f = b;
      do {
        const g = b - f;
        c[e][g] = 0;
      } while (--f);
    } while (--d);
    return new Matrix(c);
  }
}

export class Line {
  constructor(a, b) {
    this.setVectors(a, b);
    Object.seal(this);
    Object.freeze(this);
  }
  eql(a) {
    return this.isParallelTo(a) && this.contains(a.anchor);
  }

  dup() {
    return new Line(this.anchor, this.direction);
  }

  translate(a) {
    a = a.elements || a;
    return new Line(
      [
        this.anchor.elements[0] + a[0],
        this.anchor.elements[1] + a[1],
        this.anchor.elements[2] + (a[2] || 0)
      ],
      this.direction
    );
  }

  isParallelTo(a) {
    if (a.normal) {
      return a.isParallelTo(this);
    }
    a = this.direction.angleFrom(a.direction);
    return (
      Math.abs(a) <= Sylvester.precision ||
      Math.abs(a - Math.PI) <= Sylvester.precision
    );
  }

  distanceFrom(a) {
    if (a.normal) {
      return a.distanceFrom(this);
    }
    if (a.direction) {
      if (this.isParallelTo(a)) {
        return this.distanceFrom(a.anchor);
      }
      var b = this.direction.cross(a.direction).toUnitVector().elements;
      var c = this.anchor.elements;
      a = a.anchor.elements;
      return Math.abs(
        (c[0] - a[0]) * b[0] + (c[1] - a[1]) * b[1] + (c[2] - a[2]) * b[2]
      );
    }
    let d = a.elements || a;
    c = this.anchor.elements;
    b = this.direction.elements;
    a = d[0] - c[0];
    const e = d[1] - c[1];
    d = (d[2] || 0) - c[2];
    c = Math.sqrt(a * a + e * e + d * d);
    if (0 === c) {
      return 0;
    }
    b = (a * b[0] + e * b[1] + d * b[2]) / c;
    b = 1 - b * b;
    return Math.abs(c * Math.sqrt(0 > b ? 0 : b));
  }

  contains(a) {
    a = this.distanceFrom(a);
    return null !== a && a <= Sylvester.precision;
  }

  liesIn(a) {
    return a.contains(this);
  }

  intersects(a) {
    return a.normal
      ? a.intersects(this)
      : !this.isParallelTo(a) && this.distanceFrom(a) <= Sylvester.precision;
  }

  intersectionWith(a) {
    if (a.normal) {
      return a.intersectionWith(this);
    }
    if (!this.intersects(a)) return null;

    const b = this.anchor.elements;
    let c = this.direction.elements;
    let d = a.anchor.elements;
    let e = a.direction.elements;
    a = c[0];
    const f = c[1];
    c = c[2];
    let g = e[0];
    const h = e[1];
    e = e[2];
    const k = b[0] - d[0];
    const l = b[1] - d[1];
    d = b[2] - d[2];
    const m = g * g + h * h + e * e;
    const n = a * g + f * h + c * e;
    g =
      ((-a * k - f * l - c * d) * m / (a * a + f * f + c * c) +
        n * (g * k + h * l + e * d)) /
      (m - n * n);
    return new Vector([b[0] + g * a, b[1] + g * f, b[2] + g * c]);
  }

  pointClosestTo(a) {
    if (a.direction) {
      if (this.intersects(a)) {
        return this.intersectionWith(a);
      }
      if (this.isParallelTo(a)) return null;

      var b = this.direction.elements;
      var c = a.direction.elements;
      var d = b[0];
      var e = b[1];
      b = b[2];
      var f = c[0];
      var g = c[1];
      const h = c[2];
      c = b * f - d * h;
      var k = d * g - e * f;
      var l = e * h - b * g;
      d = new Vector([c * h - k * g, k * f - l * h, l * g - c * f]);
      a = new Plane(a.anchor, d);
      return a.intersectionWith(this);
    }
    a = a.elements || a;
    if (this.contains(a)) {
      return new Vector(a);
    }
    c = this.anchor.elements;
    b = this.direction.elements;
    d = b[0];
    e = b[1];
    b = b[2];
    f = c[0];
    k = c[1];
    g = c[2];
    c = d * (a[1] - k) - e * (a[0] - f);
    k = e * ((a[2] || 0) - g) - b * (a[1] - k);
    l = b * (a[0] - f) - d * ((a[2] || 0) - g);
    d = new Vector([e * c - b * l, b * k - d * c, d * l - e * k]);
    e = this.distanceFrom(a) / d.modulus();
    return new Vector([
      a[0] + d.elements[0] * e,
      a[1] + d.elements[1] * e,
      (a[2] || 0) + d.elements[2] * e
    ]);
  }

  rotate(a, b) {
    "undefined" == typeof b.direction && (b = new Line(b.to3D(), Vector.k));
    const c = Matrix.Rotation(a, b.direction).elements;
    let d = b.pointClosestTo(this.anchor).elements;
    let e = this.anchor.elements;
    const f = this.direction.elements;
    const g = d[0];
    const h = d[1];
    d = d[2];
    const k = e[0] - g;
    const l = e[1] - h;
    e = e[2] - d;
    return new Line(
      [
        g + c[0][0] * k + c[0][1] * l + c[0][2] * e,
        h + c[1][0] * k + c[1][1] * l + c[1][2] * e,
        d + c[2][0] * k + c[2][1] * l + c[2][2] * e
      ],
      [
        c[0][0] * f[0] + c[0][1] * f[1] + c[0][2] * f[2],
        c[1][0] * f[0] + c[1][1] * f[1] + c[1][2] * f[2],
        c[2][0] * f[0] + c[2][1] * f[1] + c[2][2] * f[2]
      ]
    );
  }

  reflectionIn(a) {
    if (a.normal) {
      let b = this.anchor.elements;
      let c = this.direction.elements;
      let d = b[0];
      let e = b[1];
      b = b[2];
      const f = c[0];
      const g = c[1];
      const h = c[2];
      c = this.anchor.reflectionIn(a).elements;
      d += f;
      e += g;
      b += h;
      a = a.pointClosestTo([d, e, b]).elements;
      return new Line(c, [
        a[0] + (a[0] - d) - c[0],
        a[1] + (a[1] - e) - c[1],
        a[2] + (a[2] - b) - c[2]
      ]);
    }
    if (a.direction) {
      return this.rotate(Math.PI, a);
    }
    a = a.elements || a;
    return new Line(
      this.anchor.reflectionIn([a[0], a[1], a[2] || 0]),
      this.direction
    );
  }

  setVectors(a, b) {
    a = new Vector(a);
    b = new Vector(b);
    2 == a.elements.length && a.elements.push(0);
    2 == b.elements.length && b.elements.push(0);
    if (3 < a.elements.length || 3 < b.elements.length) return null;

    const c = b.modulus();
    if (0 === c) return null;

    this.anchor = a;
    this.direction = new Vector([
      b.elements[0] / c,
      b.elements[1] / c,
      b.elements[2] / c
    ]);
    return this;
  }

  static create(a, b) {
    return new Line().setVectors(a, b);
  }
}

Line.X = new Line(Vector.Zero(3), Vector.i);
Line.Y = new Line(Vector.Zero(3), Vector.j);
Line.Z = new Line(Vector.Zero(3), Vector.k);

export class Plane {
  constructor(a, b, c) {
    this.setVectors(a, b, c);
    Object.seal(this);
    Object.freeze(this);
  }
  eql(a) {
    return this.contains(a.anchor) && this.isParallelTo(a);
  }

  dup() {
    return new Plane(this.anchor, this.normal);
  }

  translate(a) {
    a = a.elements || a;
    return new Plane(
      [
        this.anchor.elements[0] + a[0],
        this.anchor.elements[1] + a[1],
        this.anchor.elements[2] + (a[2] || 0)
      ],
      this.normal
    );
  }

  isParallelTo(a) {
    return a.normal
      ? ((a = this.normal.angleFrom(a.normal)),
        Math.abs(a) <= Sylvester.precision ||
        Math.abs(Math.PI - a) <= Sylvester.precision)
      : a.direction
        ? this.normal.isPerpendicularTo(a.direction)
        : null;
  }

  isPerpendicularTo(a) {
    a = this.normal.angleFrom(a.normal);
    return Math.abs(Math.PI / 2 - a) <= Sylvester.precision;
  }

  distanceFrom(a) {
    if (this.intersects(a) || this.contains(a)) {
      return 0;
    }
    if (a.anchor) {
      var b = this.anchor.elements;
      var c = a.anchor.elements;
      a = this.normal.elements;
      return Math.abs(
        (b[0] - c[0]) * a[0] + (b[1] - c[1]) * a[1] + (b[2] - c[2]) * a[2]
      );
    }
    c = a.elements || a;
    b = this.anchor.elements;
    a = this.normal.elements;
    return Math.abs(
      (b[0] - c[0]) * a[0] + (b[1] - c[1]) * a[1] + (b[2] - (c[2] || 0)) * a[2]
    );
  }

  contains(a) {
    if (a.normal) return null;

    if (a.direction) {
      return (
        this.contains(a.anchor) && this.contains(a.anchor.add(a.direction))
      );
    }
    a = a.elements || a;
    const b = this.anchor.elements;
    const c = this.normal.elements;
    return (
      Math.abs(
        c[0] * (b[0] - a[0]) +
        c[1] * (b[1] - a[1]) +
        c[2] * (b[2] - (a[2] || 0))
      ) <= Sylvester.precision
    );
  }

  intersects(a) {
    return "undefined" == typeof a.direction && "undefined" == typeof a.normal
      ? null
      : !this.isParallelTo(a);
  }

  intersectionWith(a) {
    if (!this.intersects(a)) return null;

    if (a.direction) {
      var b = a.anchor.elements;
      var c = a.direction.elements;
      a = this.anchor.elements;
      var d = this.normal.elements;
      a =
        (d[0] * (a[0] - b[0]) + d[1] * (a[1] - b[1]) + d[2] * (a[2] - b[2])) /
        (d[0] * c[0] + d[1] * c[1] + d[2] * c[2]);
      return new Vector([b[0] + c[0] * a, b[1] + c[1] * a, b[2] + c[2] * a]);
    }
    if (a.normal) {
      c = this.normal.cross(a.normal).toUnitVector();
      d = this.normal.elements;
      b = this.anchor.elements;
      let e = a.normal.elements;
      const f = a.anchor.elements;
      let g = Matrix.Zero(2, 2);
      for (a = 0; g.isSingular();) {
        a++ ,
          (g = new Matrix([
            [d[a % 3], d[(a + 1) % 3]],
            [e[a % 3], e[(a + 1) % 3]]
          ]));
      }
      g = g.inverse().elements;
      b = d[0] * b[0] + d[1] * b[1] + d[2] * b[2];
      d = e[0] * f[0] + e[1] * f[1] + e[2] * f[2];
      b = [g[0][0] * b + g[0][1] * d, g[1][0] * b + g[1][1] * d];
      d = [];
      for (e = 1; 3 >= e; e++) {
        d.push(a == e ? 0 : b[(e + (5 - a) % 3) % 3]);
      }
      return new Line(d, c);
    }
  }

  pointClosestTo(a) {
    a = a.elements || a;
    let b = this.anchor.elements;
    const c = this.normal.elements;
    b =
      (b[0] - a[0]) * c[0] + (b[1] - a[1]) * c[1] + (b[2] - (a[2] || 0)) * c[2];
    return new Vector([
      a[0] + c[0] * b,
      a[1] + c[1] * b,
      (a[2] || 0) + c[2] * b
    ]);
  }

  rotate(a, b) {
    const c = Matrix.Rotation(a, b.direction).elements;
    let d = b.pointClosestTo(this.anchor).elements;
    let e = this.anchor.elements;
    const f = this.normal.elements;
    const g = d[0];
    const h = d[1];
    d = d[2];
    const k = e[0] - g;
    const l = e[1] - h;
    e = e[2] - d;
    return new Plane(
      [
        g + c[0][0] * k + c[0][1] * l + c[0][2] * e,
        h + c[1][0] * k + c[1][1] * l + c[1][2] * e,
        d + c[2][0] * k + c[2][1] * l + c[2][2] * e
      ],
      [
        c[0][0] * f[0] + c[0][1] * f[1] + c[0][2] * f[2],
        c[1][0] * f[0] + c[1][1] * f[1] + c[1][2] * f[2],
        c[2][0] * f[0] + c[2][1] * f[1] + c[2][2] * f[2]
      ]
    );
  }

  reflectionIn(a) {
    if (a.normal) {
      let b = this.anchor.elements;
      let c = this.normal.elements;
      let d = b[0];
      let e = b[1];
      b = b[2];
      const f = c[0];
      const g = c[1];
      const h = c[2];
      c = this.anchor.reflectionIn(a).elements;
      d += f;
      e += g;
      b += h;
      a = a.pointClosestTo([d, e, b]).elements;
      return new Plane(c, [
        a[0] + (a[0] - d) - c[0],
        a[1] + (a[1] - e) - c[1],
        a[2] + (a[2] - b) - c[2]
      ]);
    }
    if (a.direction) {
      return this.rotate(Math.PI, a);
    }
    a = a.elements || a;
    return new Plane(
      this.anchor.reflectionIn([a[0], a[1], a[2] || 0]),
      this.normal
    );
  }

  setVectors(a, b, c) {
    a = new Vector(a);
    a = a.to3D();
    if (null === a) return null;

    b = new Vector(b);
    b = b.to3D();
    if (null === b) return null;

    if ("undefined" == typeof c) {
      c = null;
    } else {
      if (((c = new Vector(c)), (c = c.to3D()), null === c)) return null;
    }
    let d = a.elements[0];
    let e = a.elements[1];
    const f = a.elements[2];
    const g = b.elements[0];
    const h = b.elements[1];
    const k = b.elements[2];
    if (null !== c) {
      b = c.elements[0];
      const l = c.elements[1];
      c = c.elements[2];
      e = new Vector([
        (h - e) * (c - f) - (k - f) * (l - e),
        (k - f) * (b - d) - (g - d) * (c - f),
        (g - d) * (l - e) - (h - e) * (b - d)
      ]);
      d = e.modulus();
      if (0 === d) return null;

      e = new Vector([e.elements[0] / d, e.elements[1] / d, e.elements[2] / d]);
    } else {
      d = Math.sqrt(g * g + h * h + k * k);
      if (0 === d) return null;

      e = new Vector([b.elements[0] / d, b.elements[1] / d, b.elements[2] / d]);
    }
    this.anchor = a;
    this.normal = e;
    return this;
  }

  static create(a, b, c) {
    return new Plane(a, b, c);
  }
}

Plane.XY = new Plane(Vector.Zero(3), Vector.k);
Plane.YZ = new Plane(Vector.Zero(3), Vector.i);
Plane.ZX = new Plane(Vector.Zero(3), Vector.j);
Plane.YX = Plane.XY;
Plane.ZY = Plane.YZ;
Plane.XZ = Plane.ZX;
export const $V = Vector.create;
export const $M = Matrix.create;
export const $L = Line.create;
export const $P = Plane.create;
