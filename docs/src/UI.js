/**
 * アプリのパーツはこの中に入れる
 * 地図の拡大縮小、ドラッグでの移動を制御する
 */
export class UIContainer {
    constructor(element) {
        this.area = element; // ピンチイン・アウト、ドラッグによる移動対象の要素

        this.baseDistance = -1; // ピンチイン・アウトの基準となる指の距離
        this.isMouseDown = false; // マウスのドラッグ中とクリックを区別する

        this.startX = 0; // クリック or タップ時の初期位置
        this.startY = 0;
        this.dX = 0; // マウスまたは指の移動距離
        this.dY = 0;

        this.scale = 0.9; // 拡大率
        this.minScale = Math.min(window.innerWidth/(this.area.clientWidth + 30), window.innerHeight/(this.area.clientHeight + 30));
        this.baseScale = 0.9;

        this.pinchInOutAt = 0; // ピンチイン・アウトしたときのタイムスタンプ

        this.components = []; // 拡大縮小ボタンを格納する

        addEventListener('mousedown', this.onMouseDown.bind(this));
        addEventListener('mouseup', this.onMouseUp.bind(this));
        addEventListener('mousemove', this.onMouseMove.bind(this), {passive: false});
        addEventListener('wheel', this.onWheel.bind(this), {passive: false});

        addEventListener('touchstart', this.onTouchStart.bind(this));
        addEventListener('touchend', this.onTouchEnd.bind(this));
        addEventListener('touchmove', this.onTouchMove.bind(this), {passive: false});

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

        this.update();
    }

    update () {
        this.area.style.transform = `scale(${this.scale}) translate(${this.dX}px, ${this.dY}px)`;
        this.btnCange();
        console.log(`拡大率：${this.scale}`);
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
        if (scale < this.minScale) { return this.minScale; }
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
        this.baseDistance = -1;
    }

    onTouchMove (event) {
        event.preventDefault();
        const touches = event.touches;
        if (touches.length === 2) {
            const distance = this.calcHypotenuse(touches);
            if (this.baseDistance > 0) {
                this.scale = this.limitScale(this.scale * distance/this.baseDistance);
            }
            this.baseDistance = distance;
            this.pinchInOutAt = performance.now();
        } else {
            // ピンチイン・アウト直後はスクロールが動かないようにする
            const elapsed = performance.now() - this.pinchInOutAt;
            if (elapsed < 200) { return; }

            const dx = (touches[0].pageX - this.startX)/this.scale;
            const dy = (touches[0].pageY - this.startY)/this.scale;
            this.dX = Math.floor(this.limitX(this.dX + dx));
            this.dY = Math.floor(this.limitY(this.dY + dy));

            this.startX = touches[0].pageX;
            this.startY = touches[0].pageY;
        }
        this.update();
    }
    
    

    add (component, func) {
        this.components.push(component);
        component.addEventListener('click', func);
    }

    initScale () {
        const id = requestAnimationFrame(() => {
            this.scale = Math.round(this.scale * 10)/10;
            if (this.scale > this.baseScale + 0.4) { this.scale -= 0.2;} else if (this.scale > this.baseScale) { this.scale -= 0.1;}
            if (this.scale < this.baseScale - 0.4) { this.scale += 0.2;} else if (this.scale < this.baseScale) { this.scale += 0.1}

            if (this.dX > 20) { this.dX -= 20; } else if (this.dX > 0) { this.dX -= 1; }
            if (this.dX < -20) { this.dX += 20; } else if (this.dX < 0) { this.dX += 1; }

            if (this.dY > 20) { this.dY -= 20; } else if (this.dY > 0) { this.dY -= 1; }
            if (this.dY < -20) { this.dY += 20; } else if (this.dY < 0) { this.dY += 1; }

            if (this.scale != this.baseScale || this.dX != 0 || this.dY != 0) {
                this.update();
                this.initScale();
            } else {
                this.btnCange();
                cancelAnimationFrame(id);
            }
        });
    }

    btnCange () {
        const expandBtn = document.querySelector('.expand');
        const contractBtn = document.querySelector('.contract');
        if (this.scale > this.baseScale) {
            expandBtn.classList.add('hidden');
            contractBtn.classList.remove('hidden');

            const addSaleDown = () => {
                contractBtn.classList.add('scale-down');
                setTimeout(() => {
                    contractBtn.classList.remove('scale-down');
                    contractBtn.removeEventListener('click', addSaleDown);
                }, 100);
            }
            contractBtn.addEventListener('click', addSaleDown);
        }

        if (this.scale < this.baseScale) {
            expandBtn.classList.remove('hidden');
            contractBtn.classList.add('hidden');

            const addScaleUp = () => {
                expandBtn.classList.add('scale-up');
                setTimeout(() => {
                    expandBtn.classList.remove('scale-up');
                    expandBtn.removeEventListener('click', addScaleUp);
                }, 100);
            }
            expandBtn.addEventListener('click', addScaleUp);
        }

        if (this.scale === this.baseScale) {
            expandBtn.classList.add('disabled');
            contractBtn.classList.add('disabled');
        } else {
            expandBtn.classList.remove('disabled');
            contractBtn.classList.remove('disabled');
        }
    }

    
}