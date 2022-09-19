/**
 * アプリのパーツはこの中に入れる
 * 地図の拡大縮小、ドラッグでの移動を制御する
 */
export class UIContainer {
    constructor(element) {
        this.area = element; // ピンチイン・アウト、ドラッグによる移動対象の要素

        this.baseDistance = Infinity; // ピンチイン・アウトの基準となる指の距離
        this.isMouseDown = false; // マウスのドラッグ中とクリックを区別する

        this.startX = 0; // クリック or タップ時の初期位置
        this.startY = 0;
        this.dX = 0; // マウスまたは指の移動距離
        this.dY = 0;
        this.scale = 1; // 拡大率

        addEventListener('mousedown', this.onMouseDown.bind(this));
        addEventListener('mouseup', this.onMouseUp.bind(this));
        addEventListener('mousemove', this.onMouseMove.bind(this), {passive: false});
        addEventListener('wheel', this.onWheel.bind(this), {passive: false});

        addEventListener('touchstart', this.onTouchStart.bind(this));
        addEventListener('touchend', this.onTouchEnd.bind(this));
        addEventListener('touchmove', this.onTouchMove.bind(this), {passive: false});

        this.initScale();
    }

    update () {
        this.area.style.transform = `scale(${this.scale}) translate(${this.dX}px, ${this.dY}px)`;
    }

    limitX (dX) {
        const maxX = Math.abs(this.area.clientWidth * Math.max(this.scale, 1) - window.innerWidth)/2 + 30;
        const minX = - maxX;
        if (dX < minX) { return minX; }
        if (dX > maxX) { return maxX; }
        return dX;
    }

    limitY (dY) {
        const maxY = Math.abs(this.area.clientHeight * Math.max(this.scale, 1) - window.innerHeight)/2 + 30;
        const minY = - maxY;
        if (dY < minY) { return minY; }
        if (dY > maxY) { return maxY; }
        return dY;
    }

    limitScale (scale) {
        if (scale < 0.9) { return 0.9; }
        if (scale > 3.0) { return 3.0; }
        return scale;
    }

    onMouseDown (event) {
        //event.preventDefault();
        this.isMouseDown = true;
        this.startX = event.clientX;
        this.startY = event.clientY;
    }

    onMouseUp (event)  {
        //event.preventDefault();
        this.isMouseDown = false;
    }

    onMouseMove (event) {
        event.preventDefault();
        if (!this.isMouseDown) { return; }

        const dx = (event.clientX - this.startX)/this.scale;
        const dy = (event.clientY - this.startY)/this.scale;

        const speed = 0.1 * this.scale;

        this.dX = Math.floor(this.limitX(this.dX + dx * speed));
        this.dY = Math.floor(this.limitY(this.dY + dy * speed));

        this.update();
    }

    onWheel (event) {
        event.preventDefault();
        this.scale = this.limitScale(this.scale + event.deltaY * 0.001);
        this.update();
    }

    // 指の間の距離を返す
    calcHypotenuse (touches) {
        const x1 = touches[0].pageX;
        const y1 = touches[0].pageY;
        const x2 = touches[1].pageX;
        const y2 = touches[1].pageY;
        return Math.hypot(x2 - x1, y2- y1);
    }

    onTouchStart (event) {
        //event.preventDefault();
        const touches = event.targetTouches;

        if (touches.length === 2) {
            this.baseDistance = this.calcHypotenuse(touches);
        } else {
            this.startX = touches[0].pageX;
            this.startY = touches[0].pageY;
        }
    }

    onTouchEnd (event) {
        this.baseDistance = Infinity;
    }

    onTouchMove (event) {
        event.preventDefault();
        const touches = event.touches;
        if (touches.length === 2) {
            const distance = this.calcHypotenuse(touches);
            this.scale = this.limitScale(this.scale * distance/this.baseDistance);
    
            this.baseDistance = distance;
        } else {
            const dx = (touches[0].pageX - this.startX)/this.scale;
            const dy = (touches[0].pageY - this.startY)/this.scale;
            this.dX = Math.floor(this.limitX(this.dX + dx));
            this.dY = Math.floor(this.limitY(this.dY + dy));

            this.startX = touches[0].pageX;
            this.startY = touches[0].pageY;
        }
        this.update();
    }

    initScale () {
        const areaWidth = this.area.clientWidth;
        const areaHeight = this.area.clientHeight;
        
        if (window.innerWidth < areaWidth) {
            const marginX = (areaWidth - window.innerWidth)/2;
            this.area.style.marginLeft = `-${marginX}px`;
            this.area.style.marginRight = `-${marginX}px`;
        }

        if (window.innerHeight < areaHeight) {
            const marginY = (areaHeight - window.innerHeight)/2;
            this.area.style.marginTop = `-${marginY}px`;
            this.area.style.marginBottom = `-${marginY}px`;
        }

        console.log(`width  Window: ${window.innerWidth}, 地図: ${areaWidth}`);
        console.log(`height Window: ${window.innerHeight}, 地図: ${areaHeight}`);
        
        this.scale = this.limitScale(Math.max(window.innerWidth/areaWidth, window.innerHeight/areaHeight));
        this.dX = 0;
        this.dY = 0;
        this.update();
        console.log(`X: ${window.innerWidth/areaWidth}, Y: ${window.innerHeight/areaHeight}`)
        console.log(`拡大率： ${this.scale}`);
    }
}