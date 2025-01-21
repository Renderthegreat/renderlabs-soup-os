/*
 * LIB Interface PXT
 */

namespace Lib.Interface {
    type Styles = { [key: string]: string };

    export class Style {
        constructor() { };
        private properties: Styles = {};

        public set(property: string, value: string): void {
            this.properties[property] = value;
        };

        public get(property: string): string | undefined {
            return this.properties[property];
        };

        public parse(styleString: string): void {
            const styles = styleString.split(";");
            for (const style of styles) {
                const [property, value] = style.split(":").map(s => s.trim());
                if (property && value) {
                    this.set(property, value);
                };
            };
        };

        public applyTo(): Styles {
            return this.properties;
        };

        public validate(): boolean {
            return true;
        };

        public static color(colorString: string): number {
            const colorMap: any = {
                "red": ColorHues.Red,
                "orange": ColorHues.Orange,
                "yellow": ColorHues.Yellow,
                "green": ColorHues.Green,
                "aqua": ColorHues.Aqua,
                "blue": ColorHues.Blue,
                "purple": ColorHues.Purple,
                "pink": ColorHues.Pink,
            };
            if (colorString[0] == '#') {
                const hex = colorString.replace('#', '');
                let r = parseInt(hex.slice(0, 2), 16) / 255;
                let g = parseInt(hex.slice(2, 4), 16) / 255;
                let b = parseInt(hex.slice(4, 6), 16) / 255;

                let max = Math.max(Math.max(r, g), Math.max(g, b));
                let min = Math.min(Math.min(r, g), Math.min(g, b));
                let delta = max - min;

                let hue = 0;
                if (delta != 0) {
                    if (max == r) {
                        hue = (g - b) / delta;
                    } else if (max == g) {
                        hue = (b - r) / delta + 2;
                    } else {
                        hue = (r - g) / delta + 4;
                    };
                    hue = hue * 60;
                    if (hue < 0) hue += 360;
                };
                return hue;
            };
            if (parseInt(colorString)) {
                return parseInt(colorString);
            };
            if (colorString.toLowerCase() in colorMap) {
                return colorMap[colorString.toLowerCase()];
            };
            return 0;
        };

        public static parseBorder(borderString: string): any {
            /*const borderRegex = /^(\d+px|\d+em|\d+rem|thin|medium|thick)\s+(solid|dashed|dotted|double|groove|ridge|inset|outset)\s+(#[a-fA-F0-9]{3,6}|rgb\(\d{1,3},\d{1,3},\d{1,3}\)|[a-zA-Z]+)$/;
            let match = OS.rexec(borderRegex, borderString);
            if (!match) {
                return null;
            };
            
            const width = parseFloat(match[1]);
            const style = match[2];
            const color = Style.color(match[3]);
            
            return {
                width: width,
                style: style,
                color: color
            };*/
            return null;
        };
    };

    export class Element {
        private children: Element[] = [];
        private attributes: { [key: string]: string } = {};
        private styles: Style = new Style();
        private textContent: string = "";
        private tagName: string;
        public x: number = 0;
        public y: number = 0;

        constructor(tagName: string) {
            this.tagName = tagName;
        };

        public setAttribute(name: string, value: string): void {
            this.attributes[name] = value;
        };

        public getAttribute(name: string): string | undefined {
            return this.attributes[name];
        };

        public setStyle(property: string, value: string): void {
            this.styles.set(property, value);
        };

        public getStyle(property: string): string | undefined {
            return this.styles.get(property);
        };

        public parseStyles(styleString: string): void {
            this.styles.parse(styleString);
        };

        public setTextContent(text: string): void {
            this.textContent = text;
        };

        public getTextContent(): string {
            return this.textContent;
        };

        public click(): void {

        };

        public appendChild(child: Element): void {
            this.children.push(child);
        };

        public getChildren(): Element[] {
            return this.children;
        };

        public removeChild(child: Element): void {
            const index = this.children.indexOf(child);
            if (index > -1) {
                this.children.splice(index, 1);
            };
        };

        public render(screen: Screen, parentX: number = 0, parentY: number = 0): number {
            const posX = parentX + (parseInt(this.getStyle("left") || "0", 10) || this.x);
            const posY = parentY + (parseInt(this.getStyle("top") || "0", 10) || this.y);
            const width = parseInt(this.getStyle("width") || "50", 10);
            const height = parseInt(this.getStyle("height") || "20", 10);
            let padding = parseInt(this.getStyle("padding") || "0");
            const backgroundColor = this.getStyle("background-color");
            const color = this.getStyle("color");
            const cornerRadius = this.getStyle("corner-radius");
            const border = Style.parseBorder(this.getStyle("border"));
            const borderTop = Style.parseBorder(this.getStyle("border-top"));
            const borderBottom = Style.parseBorder(this.getStyle("border-bottom"));
            const borderLeft = Style.parseBorder(this.getStyle("border-left"));
            const borderRight = Style.parseBorder(this.getStyle("border-right"));

            if (border) {
                screen.fillRect(posX - border.width, posY - border.width, width + border.width, height + border.width, border.color);
            };
            
            if (cornerRadius) {
                screen.fillRoundRect(posX, posY, width + padding * 2, height + padding * 2, Style.color(backgroundColor), parseFloat(cornerRadius) || 0);
            } else {
                screen.fillRect(posX, posY, width + padding * 2, height + padding * 2, Style.color(backgroundColor));
            };
            
            for (const child of this.children) {
                padding += child.render(screen, posX + padding, posY + padding);
            };

            if (this.textContent) {
                const textColor = parseInt(color || "7");
                screen.drawText(posX + padding, posY + padding, this.textContent, textColor);
            };

            return padding;
        };
    };

    export class Div extends Element {
        constructor() {
            super("div");
        };
    };

    export class Button extends Element {
        private onClickHandler?: () => void;

        constructor() {
            super("button");
        };

        public setOnClick(handler: () => void): void {
            this.onClickHandler = handler;
        };

        public click(): void {
            if (this.onClickHandler) {
                this.onClickHandler();
            };
        };

        public render(screen: Screen, parentX: number = 0, parentY: number = 0): number {
            super.render(screen, parentX, parentY);
            return 0;
        };
    };

    export class Screen {
        constructor() {
            // OS.IO.Display.hide();
        };

        public fillRect(x: number, y: number, width: number, height: number, color: number): void {
            Distro.addDrawContents(() => { screen.fillRect(x, y, width, height, color); });
        };

        public fillRoundRect(x: number, y: number, width: number, height: number, color: number, cornerRadius: number): void {
            Distro.addDrawContents(() => { 
                screen.fillRect(x, y, cornerRadius, cornerRadius, color);
                screen.fillRect(x + width - cornerRadius, y, cornerRadius, cornerRadius, color);
                screen.fillRect(x, y + height - cornerRadius, cornerRadius, cornerRadius, color);
                screen.fillRect(x + width - cornerRadius, y + height - cornerRadius, cornerRadius, cornerRadius, color);
                screen.fillRect(x + cornerRadius, y, width - cornerRadius * 2, cornerRadius, color);
                screen.fillRect(x + cornerRadius, y + height - cornerRadius, width - cornerRadius * 2, cornerRadius, color);
                screen.fillRect(x, y + cornerRadius, cornerRadius, height - cornerRadius * 2, color);
                screen.fillRect(x + width - cornerRadius, y + cornerRadius, cornerRadius, height - cornerRadius * 2, color);
            });
        };

        public drawLine(x1: number, y1: number, x2: number, y2: number, color: number): void {
            Distro.addDrawContents(() => { 
                screen.drawLine(x1, y1, x2, y2, color)
            });
        };

        public drawText(x: number, y: number, text: string, color: number): void {
            Distro.addDrawContents(() => { screen.print(text, x, y, color) });
        };
    };

    export class Document {
        constructor() { };
        protected root: Element | null = null;
        private navigator: Navigator | null = null;
        private screen: Screen | null = null;

        public createDiv(): Div {
            return new Div();
        };

        public createButton(): Button {
            return new Button();
        };

        public createElement(tagName: string): Element {
            return new Element(tagName);
        };

        public setRootElement(root: Element): void {
            this.root = root;
        };

        public getRootElement(): Element {
            return this.root;
        };

        public querySelector(attribute: string, value: string): Element | null {
            if (!this.root) return null;

            const search = (element: Element): Element | null => {
                if (element.getAttribute(attribute) === value) return element;
                for (const child of element.getChildren() || []) {
                    const result = search(child);
                    if (result) return result;
                }
                return null;
            };

            return search(this.root);
        };


        public render(): void {
            Distro.clearDrawContents();
            if (this.root && this.screen) {
                this.root.render(this.screen);
            };
        };

        public setScreen(screen: Screen) {
            this.screen = screen;
        };

        public setNavigator(navigator: Navigator) {
            this.navigator = navigator;
        };
    };
    
    export class Navigator {
        private document: Document;
        private selected: number = 0;
        private navigableElements: Element[] = [];
    
        constructor(document: Document) {
            this.document = document;
            this.updateNavigableElements();
            this.registerControllerEvents();
        };
    
        private updateNavigableElements(): void {
            this.navigableElements = [];
            if (!this.document.getRootElement()) return;

            this.collectNavigable(this.document.getRootElement());
            /*this.navigableElements.sort((a, b) => {
                const indexA = parseInt(a.getStyle("nav-index") || "0");
                const indexB = parseInt(b.getStyle("nav-index") || "0");
                return indexA - indexB;
            });*/
        };

        private collectNavigable(element: Element): void {
            this.navigableElements.push(element);
            for (const child of element.getChildren()) {
                this.collectNavigable(child);
            };
        };

        private moveSelection(delta: number): void {
            if (this.navigableElements.length === 0) return;
            this.selected = (this.selected + delta + this.navigableElements.length) % this.navigableElements.length;
    
            this.highlightSelectedElement();
            this.document.render();
        };
    
        private highlightSelectedElement(): void {
            for (let i = 0; i < this.navigableElements.length; i++) {
                const element = this.navigableElements[i];
                if (i === this.selected) {
                    element.setStyle("border", "2px solid yellow");
                } else {
                    element.setStyle("border", "none");
                };
            };
        };
    
        private registerControllerEvents(): void {
            controller.up.onEvent(ControllerButtonEvent.Pressed, () => this.moveSelection(-1));
            controller.down.onEvent(ControllerButtonEvent.Pressed, () => this.moveSelection(1));
            controller.A.onEvent(ControllerButtonEvent.Pressed, () => this.activateSelectedElement());
        };
    
        private activateSelectedElement(): void {
            if (this.navigableElements.length === 0) return;
            const selectedElement = this.navigableElements[this.selected];
            selectedElement.click();
        };
    };
};