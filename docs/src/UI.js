/**
 * アプリのパーツはこの中に入れる
 * 地図の拡大縮小、ドラッグでの移動を制御する
 */
export class UIContainer {
    constructor(element) {
        this.area = element; // ピンチイン・アウト、ドラッグによる移動対象の要素
        
        this.baseDistance = 0; // ピンチイン・アウトの基準となる指の距離
        this.isMouseDown = false; // マウスのドラッグ中とクリックを区別する
        //this.isZooming = false; // ピンチイン・アウトとドラッグを区別する

        this.startX = 0; // クリック or タップ時の初期位置
        this.startY = 0;
        this.dX = 0; // マウスまたは指の移動距離
        this.dY = 0;
        this.scale = 1; // 拡大率

        this.components = []; // 地図の拡大縮小・移動に伴い、位置の再設定が必要となるUI部品を保持する

        addEventListener('mousedown', this.onMouseDown, false);
        addEventListener('mouseup', this.onMouseUp, false);
        addEventListener('mousemove', this.onMouseMove, false);
        addEventListener('wheel', this.onWheel, false);
        
        addEventListener('touchstart', this.onTouchStart, false);
        addEventListener('touchend', this.onTouchEnd, false);
        addEventListener('touchmove', this.onTouchMove, false);
        addEventListener('touchmove', this.onPinchInOut, false);

        this.initScale();
    }

    

    update = () => {
        this.area.style.transform = `scale(${this.scale}) translate(${this.dX}px, ${this.dY}px)`;
        if (this.components.length) {
            this.components.forEach(components => components.update());
        }
        //console.log(`拡大率： ${this.scale}`);
    }

    limitX = (dX) => {
        const maxX = Math.abs(this.area.clientWidth * Math.max(this.scale, 1) - window.innerWidth)/2 + 30;
        const minX = - maxX;
        if (dX < minX) { return minX; }
        if (dX > maxX) { return maxX; }
        return dX;
    }

    limitY = (dY) => {
        const maxY = Math.abs(this.area.clientHeight * Math.max(this.scale, 1) - window.innerHeight)/2 + 30;
        const minY = - maxY;
        if (dY < minY) { return minY; }
        if (dY > maxY) { return maxY; }
        return dY;
    }

    limitScale = (scale) => {
        if (scale < 0.9) { return 0.9; }
        if (scale > 3.0) { return 3.0; }
        return scale;
    }

    onMouseDown = (event) => {
        event.preventDefault();
        this.isMouseDown = true;
        this.startX = event.clientX;
        this.startY = event.clientY;
    }

    onMouseUp = (event) => {
        event.preventDefault();
        this.isMouseDown = false;
        this.update();
    }

    onMouseMove = (event) => {
        //event.preventDefault();
        if (!this.isMouseDown) { return; }

        const dx = (event.clientX - this.startX)/this.scale;
        const dy = (event.clientY - this.startY)/this.scale;

        const speed = 0.1 * this.scale;

        this.dX = Math.floor(this.limitX(this.dX + dx * speed));
        this.dY = Math.floor(this.limitY(this.dY + dy * speed));

        this.update();
    }

    onWheel = (event) => {
        //event.preventDefault();
        this.scale = this.limitScale(this.scale + event.deltaY * 0.001);
        this.update();
    }

    // 指の間の距離を返す
    calcHypotenuse = (touches) => {
        const x1 = touches[0].pageX;
        const y1 = touches[0].pageY;
        const x2 = touches[1].pageX;
        const y2 = touches[1].pageY;
        return Math.hypot(x2 - x1, y2- y1)/this.scale;
    }

    onTouchStart = (event) => {
        //event.preventDefault();
        const touches = event.changedTouches;
        
        if (touches.length < 2) { // 指１本のタッチのとき、指の初期位置をセット
            this.startX = touches[0].pageX;
            this.startY = touches[0].pageY;
        } else { // マルチタッチのとき、指の距離の初期値をセット
            this.baseDistance = this.calcHypotenuse(touches);
        }
    }

    onTouchEnd = (event) => {
        this.baseDistance = 0;
        this.update();
    }

    onTouchMove = (event) => {
        //event.preventDefault();
        const touches = event.changedTouches;
        if (touches.length > 1) { return; }

        const dx = (touches[0].pageX - this.startX)/this.scale;
        const dy = (touches[0].pageY - this.startY)/this.scale;

        this.dX = Math.floor(this.limitX(this.dX + dx));
        this.dY = Math.floor(this.limitY(this.dY + dy));

        this.update();

        this.startX = touches[0].pageX;
        this.startY = touches[0].pageY;
    }

    onPinchInOut = (event) => {
        //event.preventDefault();
        const touches = event.changedTouches;
        if (touches.length < 2) { return }

        const distance = this.calcHypotenuse(touches);
        this.scale = this.limitScale(this.scale * distance/this.baseDistance);
        this.update();

        this.baseDistance = distance;
    }

    initScale = () => {
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

    add = (UIComponent) => {
        this.components.push(UIComponent);
    }
}


/**
 * UIContainer内に追加するコンポーネント
 */
export class UIComponent {
    constructor(element, positionX, positionY ) {
        this.element = element;
        this.positionX = positionX; // 'left' or 'right'
        this.positionY = positionY; // 'top' or 'bottom'

        this.offsetX = 20;
        this.offsetY = 20;
    }

    update = () => {
        this.resize();
        this.position();
    }

    resize = () => {
        const scale = document.body.clientWidth / window.innerWidth; // iOSでの拡大率

        this.element.style.fontSize = `${2.5/scale}vh`;
    }

    position = () => {
        switch (this.positionX) {
            case 'left':
                this.element.style.left = `${Math.max(window.pageXOffset, 0) + this.offsetX}px`;
                break;
            case 'right':
                this.element.style.right = `${Math.abs(window.innerWidth - document.body.clientWidth) - Math.max(window.pageXOffset, 0) + this.offsetX}px`;
                break;
        }

        switch (this.positionY) {
            case 'top':
                this.element.style.top = `${Math.max(window.pageYOffset, 0) + this.offsetY}px`;
                break;
            case 'bottom':
                this.element.style.bottom = `${Math.abs(window.innerHeight - document.body.clientHeight) - Math.max(window.pageYOffset, 0) + this.ffsetY}px`
                break;
        }
    }
}