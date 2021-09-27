// ModalEx.ts
import { Dimension } from "./components/Modal";
import { CacheManager, CacheType } from "./CacheManager";

class _ModalEx {

    private contentSelector: string;

    setMetrics(contentSelector: string) {
        this.contentSelector = contentSelector ? `.${contentSelector}` : "div";
        this.getContentDiv((div: any, component: any) => {
            // modal dimension
            let dimension = this.getDimension(component.props.dimension);
            div.style.width = `${dimension.width}px`;
            div.style.height = `${dimension.height}px`;
            component.setState({ clientWidth: dimension.width, clientHeight: dimension.height });
        });
    }

    getContentDiv(callback: (div: any, component: any) => void) {
        setTimeout((): any => {
            let modalList = document.querySelectorAll(".modal.in > .modal-panel");
            if (modalList.length === 0) return;

            let modal = modalList[modalList.length - 1] as HTMLDivElement;
            if (!modal) return;

            modal = modal.querySelector(".modal-content") as HTMLDivElement;
            let reactComponent = window.getReactComponent(modal);
            if (!reactComponent) return;

            if (this.contentSelector === "div") {
                callback(modal.querySelector(this.contentSelector), reactComponent);
            } else {
                let divs = modal.querySelectorAll(this.contentSelector) as NodeListOf<HTMLElement>;
                for (let j = 0; j < divs.length; j++) {
                    let element = divs[j] as HTMLElement;
                    callback(element, reactComponent);
                }
            }
        }, 0);
        return;
    }

    setModalDimension() {
        this.getContentDiv((div: any, component: any) => {
            let dimension = this.getDimension(component.props.dimension);
            this.getScreen((screen: IDimension) => {
                this.setSize(screen.height < dimension.height || screen.width < dimension.width ? screen : dimension, div, component);
            });
        });
    }

    setDimension(screen: IDimension) {
        this.getContentDiv((div: any, component: any) => {
            this.setSize(screen, div, component);
        });
    }

    setSize(screen: IDimension, div: any, component: any) {
        // default values
        div.style.height = `${component.state.clientHeight}px`;
        div.style.width = `${component.state.clientWidth}px`;
        div.style.overflowY = "hidden";
        div.style.overflowX = "hidden";

        if (screen.height < component.state.clientHeight) {
            div.style.height = `${screen.height}px`;
            div.style.overflowY = "auto";
        }
        if (screen.width < component.state.clientWidth) {
            div.style.width = `${screen.width}px`;
            div.style.overflowX = "auto";
        }
    }

    setContentDiv() {
        this.getScreen((screen: IDimension) => {
            this.setDimension(screen);
        });
    }

    getDimension(dimension: Dimension): IDimension {
        switch (dimension) {
            case Dimension.Small: return { width: 400, height: 300 };
            case Dimension.Medium: return { width: 600, height: 450 };
            case Dimension.Large: return { width: 800, height: 600 };
            default: return { width: 600, height: 450 };
        }
    }

    getScreen(callback: (screen: IDimension) => void) {
        setTimeout((): any => {
            const marginsWidth = 45;
            const marginsHeight = 25;
            let iframe = document.getElementsByTagName("iframe")[0];
            let desktopElements = CacheManager.GetValueFromCache<IDesktop>("desktopElements", CacheType.DesktopVariables);
            callback({ width: desktopElements.bottom.clientWidth + desktopElements.side.clientWidth - marginsWidth, height: iframe.clientHeight + desktopElements.bottom.clientHeight - marginsHeight });
        }, 0);
    }
}

export const ModalEx = new _ModalEx();
