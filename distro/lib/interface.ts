/*
 * LIB Interface PXT
 */

namespace Lib.Interface {
    type Styles = { [key: string]: string };
    export enum PromptType {  
        STRING,
        NUMBER,
        YESNO
    };

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
                "red": Colors.Red,
                "orange": Colors.Orange,
                "yellow": Colors.Yellow,
                "green": Colors.Green,
                "blue": Colors.Blue,
                "purple": Colors.Purple,
                "pink": Colors.Pink,
            };
            if (colorString[0] == '#') {
                const hex = colorString.replace('#', '');
                let r = parseInt(hex.slice(0, 2), 16);
                let g = parseInt(hex.slice(2, 4), 16);
                let b = parseInt(hex.slice(4, 6), 16);
                return color.rgb(r, g, b);
            };
            if (parseInt(colorString)) {
                return parseInt(colorString) * 4;
            };
            if (colorMap[colorString.toLowerCase()]) {
                return colorMap[colorString.toLowerCase()] * 4;
            };
            return 0;
        };

        public static parseBorder(borderString: string): any {
            const borderParts = borderString.split("\s");
        
            if (borderParts.length !== 3) {
                return null;
            };

            const width = borderParts[0];

            const style = borderParts[1];
            const validStyles = ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'];

            const color = Style.color(borderParts[2]);
        
            return {
                width: parseFloat(width),
                style,
                color
            };
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
        public wantsToRender: boolean = false;

        constructor(tagName: string) {
            this.tagName = tagName;
            /*control.setInterval(() => {
                for (const child of this.children) {
                    if (child.wantsToRender) {
                        child.wantsToRender = false;
                        this.wantsToRender = true;
                    };
                };
            }, 500, control.IntervalMode.Interval);*/ // Very unstable! 
        };

        /**
         * Set an attribute on the element
         * @param name The attribute name
         * @param value The value for that attribute
         */
        public setAttribute(name: string, value: string): void {
            this.attributes[name] = value;
        };

        /**
         * Gets an attribute
         * @param name The name of the attribute
         * @returns { string | undefined }
         */
        public getAttribute(name: string): string | undefined {
            return this.attributes[name];
        };

        /**
         * Set a style
         * @param property The style to set 
         * @param value The value to set that style to
         */
        public setStyle(property: string, value: string): void {
            this.styles.set(property, value);
        };

        /**
         * Get a style
         * @param property The style to get
         * @returns { string | undefined }
         */
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
            this.requestRender();
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

        public clear() {
            this.children = [];
        };

        private requestRender() {
            this.wantsToRender = true;
        };

        public render(screen: Screen, parentX: number = 0, parentY: number = 0): number {
            const posX = parentX + (parseInt(this.getStyle("left") || "0", 10) || this.x);
            const posY = parentY + (parseInt(this.getStyle("top") || "0", 10) || this.y);
            const width = parseInt(this.getStyle("width") || "50", 10);
            const height = parseInt(this.getStyle("height") || "20", 10);
        
            // Parse padding for all directions
            const paddingTop = parseInt(this.getStyle("padding-top") || this.getStyle("padding") || "0", 10);
            const paddingRight = parseInt(this.getStyle("padding-right") || this.getStyle("padding") || "0", 10);
            const paddingBottom = parseInt(this.getStyle("padding-bottom") || this.getStyle("padding") || "0", 10);
            const paddingLeft = parseInt(this.getStyle("padding-left") || this.getStyle("padding") || "0", 10);
        
            // Parse margin for all directions
            const marginTop = parseInt(this.getStyle("margin-top") || this.getStyle("margin") || "0", 10);
            const marginRight = parseInt(this.getStyle("margin-right") || this.getStyle("margin") || "0", 10);
            const marginBottom = parseInt(this.getStyle("margin-bottom") || this.getStyle("margin") || "0", 10);
            const marginLeft = parseInt(this.getStyle("margin-left") || this.getStyle("margin") || "0", 10);

            // Gap of children
            const gapY = parseInt(this.getStyle("gap-y") || this.getStyle("gap") || "0", 10);
            const gapX = parseInt(this.getStyle("gap-x") || this.getStyle("gap") || "0", 10); 
        
            const backgroundColor = this.getStyle("background-color");
            const color = this.getStyle("color");
            const cornerRadius = this.getStyle("corner-radius");
            const border = Style.parseBorder(this.getStyle("border"));
            const borderTop = Style.parseBorder(this.getStyle("border-top"));
            const borderBottom = Style.parseBorder(this.getStyle("border-bottom"));
            const borderLeft = Style.parseBorder(this.getStyle("border-left"));
            const borderRight = Style.parseBorder(this.getStyle("border-right"));
        
            // Adjust position based on margin
            const finalPosX = posX + marginLeft;
            const finalPosY = posY + marginTop;
        
            if (border) {
                screen.fillRect(
                    finalPosX - border.width,
                    finalPosY - border.width,
                    width + paddingLeft + paddingRight + border.width,
                    height + paddingTop + paddingBottom + border.width,
                    border.color
                );
            };
        
            if (cornerRadius) {
                screen.fillRoundRect(
                    finalPosX,
                    finalPosY,
                    width + paddingLeft + paddingRight,
                    height + paddingTop + paddingBottom,
                    Style.color(backgroundColor),
                    parseFloat(cornerRadius) || 0
                );
            } else {
                screen.fillRect(
                    finalPosX,
                    finalPosY,
                    width + paddingLeft + paddingRight,
                    height + paddingTop + paddingBottom,
                    Style.color(backgroundColor)
                );
            };
        
            let i = 0;
            for (const child of this.children) {
                child.render(screen, finalPosX + paddingLeft + gapX * i, finalPosY + paddingTop + gapY * i);
                i++;
            };
        
            if (this.textContent) {
                const textColor = Style.color(color);
                screen.drawText(
                    finalPosX + paddingLeft,
                    finalPosY + paddingTop,
                    this.textContent,
                    textColor
                );
            };
        
            return paddingTop + paddingBottom + marginTop + marginBottom;
        }
    };

    export class Div extends Element {
        constructor() {
            super("div");
        };
    };

    export class List extends Element {
        constructor() {
            super("list");
        };
    };

    export class ListItem extends Element {
        constructor() {
            super("list-item");
        };
    };

    export class Text extends Element {
        constructor() {
            super("text");
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
            Distro.addDrawContents(() => {
                screen.fillRect(x, y, width, height, color);
            });
        };

        public fillRoundRect(x: number, y: number, width: number, height: number, color: number, cornerRadius: number): void {
            Distro.addDrawContents(() => { 
                this.fillRect(x, y, cornerRadius, cornerRadius, color);
                this.fillRect(x + width - cornerRadius, y, cornerRadius, cornerRadius, color);
                this.fillRect(x, y + height - cornerRadius, cornerRadius, cornerRadius, color);
                this.fillRect(x + width - cornerRadius, y + height - cornerRadius, cornerRadius, cornerRadius, color);
                this.fillRect(x + cornerRadius, y, width - cornerRadius * 2, cornerRadius, color);
                this.fillRect(x + cornerRadius, y + height - cornerRadius, width - cornerRadius * 2, cornerRadius, color);
                this.fillRect(x, y + cornerRadius, cornerRadius, height - cornerRadius * 2, color);
                this.fillRect(x + width - cornerRadius, y + cornerRadius, cornerRadius, height - cornerRadius * 2, color);
            });
        };

        public drawLine(x1: number, y1: number, x2: number, y2: number, color: number): void {
            Distro.addDrawContents(() => { 
                screen.drawLine(x1, y1, x2, y2, color);
            });
        };

        public drawText(x: number, y: number, text: string, color: number): void {
            Distro.addDrawContents(() => {
                screen.print(text, x, y, color);
            });
        };
    };

    export class Document {
        constructor() { };
        protected root: Element | null = null;
        private navigator: Navigator | null = null;
        private screen: Screen | null = null;

        /**
         * Create a div
         * @returns { Div }
         */
        public createDiv(): Div {
            return new Div();
        };

        /**
         * Create a button
         * @returns { Div }
         */
        public createButton(): Button {
            return new Button();
        };

        /**
         * Create a list
         * @returns { Div }
         */
        public createList(): List {
            return new List();
        };

        /**
         * Create a list item
         * @returns { Div }
         */
        public createListItem(): ListItem {
            return new ListItem;
        };

        /**
         * Create a text
         * @returns { Div }
         */
        public createText(): Text {
            return new Text;
        };

        /**
         * Create a element
         * @returns { Div }
         */
        public createElement(tagName: string): Element {
            return new Element(tagName);
        };

        /**
         * Set the root element
         * @param root The element
         */
        public setRootElement(root: Element): void {
            this.root = root;
        };

        /**
         * Get the root element
         * @returns { Element }
         */
        public getRootElement(): Element {
            return this.root;
        };

        /**
         * Finds an element by an attribute
         * @param attribute The specific attribute to look for
         * @param value The value for that attribute
         * @returns 
         */
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

        /**
         * Render the document
         */
        public render(): void {
            Distro.clearDrawContents();
            if (this.root && this.screen) {
                this.root.render(this.screen);
            };
            control.setInterval(() => {
                // if (this.root.wantsToRender && this.screen) {
                this.root.render(this.screen);
                //     OS.Debug.run("Rendering DOM");
                // }; // Fuck this. I just want to render a freaking DOM.
            }, 500, control.IntervalMode.Interval);
        };

        /**
         * Sets the screen instance to use
         * @param screen The screen instance
         */
        public setScreen(screen: Screen) {
            this.screen = screen;
        };
        
        /**
         * Sets the navigator instance to use
         * @param navigator The navigator to use
         */
        public setNavigator(navigator: Navigator) {
            this.navigator = navigator;
        };

        /**
         * Shows an alert to the screen
         * @param title The title
         * @param subtitle The subtitle
         */
        public alert(title: string, subtitle?: string) {
            game.splash(title, subtitle);
        };

        /**
         * Ask for a user input
         * @param question The question to ask
         * @param type The type of data you are asking for
         * @param length The expected length
         * @returns { string }
         */
        public prompt(question: string, type: PromptType, length?: number): string {
            switch (type) {
                case PromptType.NUMBER: {
                    return game.askForNumber(question, length || 6).toString();
                };
                case PromptType.STRING: {
                    return game.askForString(question, length || 20);
                };
                case PromptType.YESNO: {
                    return game.ask(question).toString();
                };
                default: {
                    return '';
                };
            };
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