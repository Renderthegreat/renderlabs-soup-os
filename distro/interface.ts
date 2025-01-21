namespace XInterface {
    export class Window {
        title: string;
        protected elements: StyledElement[] = [];
        protected selected: number = 0;
        private maxWidth: number = screen.width;
        private maxHeight: number = screen.height;
        private scrollOffsetY: number = 0;

        constructor(title: string) {
            this.title = title || "Untitled Window";
            controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
                if (!this.elements[this.selected]) {
                    this.selected = 0;
                    return;
                }
                const input = this.elements[this.selected].getInput();
                this.elements[this.selected].onClick(input, this.elements[this.selected].textSprite);
                music.playMelody("G#", 360);
            });
            controller.anyButton.onEvent(ControllerButtonEvent.Pressed, () => {
                for (let e of this.elements) {
                    e.update();
                };
            });
        };

        /**
         * Automatically determine the next available position for an element.
         */
        private getNextPosition(style: ElementStyle): { x: number; y: number } {
            if (this.elements.length === 0) {
                // For the first element
                return { x: style.margin, y: style.margin };
            };
        
            const lastElement = this.elements[this.elements.length - 1];
        
            let nextX = lastElement.sprite.x + lastElement.style.width + style.margin;
            let nextY = lastElement.sprite.y + lastElement.style.height + style.margin;
        
            if (nextX + style.width > this.maxWidth) {
                return { x: style.margin, y: nextY };
            };
        
            return { x: lastElement.sprite.x, y: nextY };
        };
        
        /**
         * Add styled text to the window.
         */
        addText(label: string, style: TextStyle) {
            const position = this.getNextPosition(style);
        
            const textSprite = textsprite.create(label, style.fgColor, style.bgColor);
            textSprite.setPosition(
                position.x + textSprite.width / 2,
                position.y + style.margin + style.height
            );
        
            const index = this.elements.length;
            const updateHighlight = () => {
                if (this.elements[this.selected].sprite == textSprite) {
                    textSprite.setOutline(1, style.hlColor);
                } else {
                    textSprite.setOutline(1, style.fgColor);
                };
            };
            this.elements.push({ sprite: textSprite, textSprite, style, onClick: () => undefined, update: updateHighlight, getInput: () => "" });
            updateHighlight();
        };

        /**
         * Add a styled button to the window.
         */
        addButton(label: string, style: ButtonStyle, onClick: () => void) {
            const position = this.getNextPosition(style);
            const buttonSprite = sprites.create(style.background, SpriteKind.MiniMenu);
            buttonSprite.setPosition(position.x, position.y);
        
            const textSprite = textsprite.create(label, style.fgColor, style.bgColor);
            textSprite.setPosition(
                position.x + textSprite.width / 2,
                position.y + style.margin + style.height
            );
        
            const index = this.elements.length;
            const updateHighlight = () => {
                if (this.elements[this.selected].sprite == buttonSprite) {
                    textSprite.setOutline(1, style.hlColor);
                } else {
                    textSprite.setOutline(1, style.fgColor);
                };
            };
            this.elements.push({ sprite: buttonSprite, textSprite, style, onClick, update: updateHighlight, getInput: () => "" });
            updateHighlight();
        };    

        /**
         * Add a styled input to the window.
         */
        addInput(label: string, style: InputStyle, onClick: (text: string, textSprite: TextSprite) => void) {
            const position = this.getNextPosition(style);
            const inputSprite = sprites.create(style.background, SpriteKind.MiniMenu);
            inputSprite.setPosition(position.x, position.y);
        
            const textSprite = textsprite.create(label, style.fgColor, style.bgColor);
            textSprite.setPosition(
                position.x + textSprite.width / 2,
                position.y + style.margin + style.height
            );
        
            const index = this.elements.length;
            const updateHighlight = () => {
                if (this.elements[this.selected].sprite == inputSprite) {
                    textSprite.setOutline(1, style.hlColor);
                } else {
                    textSprite.setOutline(1, style.fgColor);
                };
            };
            this.elements.push({ sprite: inputSprite, textSprite, style, onClick, update: updateHighlight, getInput: () => game.askForString(label, 24) });
            updateHighlight();
        };

        /**
         * Add a div container to group elements.
         */
        addDiv(style: DivStyle, onRender?: (div: StyledElement) => void) {
            const position = this.getNextPosition(style);
            const divSprite = sprites.create(style.background, SpriteKind.Player);
            divSprite.setPosition(position.x, position.y);
        
            const div: StyledElement = { sprite: divSprite, textSprite: textsprite.create(""), style };
            this.elements.push(div);
        
            if (onRender) {
                onRender(div);
            };
        };        

        /**
         * Handle scrolling if elements exceed screen bounds.
         */
        private handleScrolling() {
            let totalHeight = 0;
            const update = () => {
                totalHeight = 0;
                for (let e of this.elements) {
                    totalHeight += e.sprite.height + e.style.height;
                };
            };

            controller.down.onEvent(ControllerButtonEvent.Pressed, () => {
                update();
                const scrollHeight = this.scrollOffsetY + this.maxHeight;
                if (scrollHeight < totalHeight) {
                    this.scrollOffsetY -= 10;
                    this.updateScroll();
                };
                if (this.selected + 1 < this.elements.length) {
                    this.selected++;
                };
            });

            controller.up.onEvent(ControllerButtonEvent.Pressed, () => {
                update();
                if (this.scrollOffsetY < 0) {
                    this.scrollOffsetY += 10;
                    if (this.scrollOffsetY > 0) {
                        this.scrollOffsetY = 0;
                    };
                    this.updateScroll();
                };
                if (this.selected > 0) {
                    this.selected--;
                };
            });
            /*controller.left.onEvent(ControllerButtonEvent.Pressed, () => {
                refresh();
                this.elements[this.selected].textSprite.x -= 10;
            });

            controller.right.onEvent(ControllerButtonEvent.Pressed, () => {
                refresh();
                this.elements[this.selected].textSprite.x += 10;
            });*/
        };

        /**
         * Update element positions based on the scroll offset.
         */
        private updateScroll() {
            for (const element of this.elements) {
                element.sprite.y += this.scrollOffsetY;
            };
        };

        /**
         * Render the window and its components.
         */
        render() {
            this.handleScrolling();
        };

        /**
         * Refresh the GUI, removing everything from the screen.
         */
        refresh() {
            for (const element of this.elements) {
                element.sprite.destroy();
                element.textSprite.destroy();
            };
            this.elements = [];
            this.scrollOffsetY = 0;
            this.handleScrolling();
        };
    };

    /**
     * Interface for styled elements.
     */
    interface StyledElement {
        sprite: Sprite;
        textSprite: TextSprite;
        style: ElementStyle;
        onClick?: (t: any, textSprite: TextSprite) => void;
        update?: () => void;
        getInput?: () => string;
    };

    /**
     * Base style for all elements.
     */
    interface ElementStyle {
        background: Image;
        width: number;
        height: number;
        margin: number;
    };

    /**
     * Style for text.
     */
    export interface TextStyle extends ElementStyle {
        fgColor: number;
        bgColor: number;
        hlColor: number;
    };
    
    /**
     * Style for buttons.
     */
    export interface ButtonStyle extends ElementStyle {
        fgColor: number;
        bgColor: number;
        hlColor: number;
    };

    /**
     * Style for Inputs.
     */
    export interface InputStyle extends ElementStyle {
        fgColor: number;
        bgColor: number;
        hlColor: number;
    };

    /**
     * Style for divs.
     */
    export interface DivStyle extends ElementStyle { };
    
    /**
     * Remove the given window to the screen.
     * @param windowInstance The window instance to remove.
     */
    export function display(windowInstance: Window) {
        windowInstance.render();
    };

    /**
     * Remove the given window on the screen.
     * @param windowInstance The window instance to remove.
     */
    export function remove(windowInstance: Window) {
        windowInstance.refresh();
    };
};
