//@ts-ignore
import PrintcartDesigner from "@printcart/design-tool-sdk";
//@ts-ignore
import PrintcartUploader from "@printcart/uploader-sdk";
import "./main.css";

// TODO: on error events
interface IOptions {
  buttonId?: string;
  designBtnText?: string;
  editBtnText?: string;
  removeUploaderBtnText?: string;
  onUploadSuccess?: (data: [DataWrap] | [Data], ctx: any) => void;
  onDesignCreateSuccess?: (data: [DataWrap] | [Data], ctx: any) => void;
  onDesignEditSuccess?: (data: Data, ctx: any) => void;
  designerOptions: {};
}

type DataWrap = {
  data: Data;
};

type Data = {
  id: string;
  design_image: {
    url?: string;
  };
  preview_image: {
    url?: string;
  };
};

class PrintcartDesignerWix {
  #apiUrl: string;
  token: string | null;
  productIdPrintcart: string | null;
  productIdWix: string | null;
  orderIdWix: string | null;
  orderNumberWix: string | null;
  options?: IOptions;
  #designerUrl: string;
  #designerInstance: any;
  #uploaderInstance: any;
  #productForm: HTMLFormElement | null;

  constructor() {
    this.token = this.#getUnauthToken();
    this.productIdPrintcart = null;
    this.productIdWix = null;
    this.orderIdWix = null;
    this.orderNumberWix = null;

    // @ts-ignore
    // this.options = window.PrintcartDesignerShopifyOptions;

    this.#apiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : "https://api.printcart.com/v1";

    this.#designerUrl = import.meta.env.VITE_CUSTOMIZER_URL ? import.meta.env.VITE_CUSTOMIZER_URL : "https://customizer.printcart.com";

    this.#productForm = document.querySelector("[data-hook='product-options']"); // TODO: add-to-cart

    if (!this.#productForm) {
      throw new Error("This script can only be used inside a Wix Product Page.");
    }

    const self = this;

    window.wixDevelopersAnalytics.register(import.meta.env.APP_ID, function report(eventName, data) {
      switch (eventName) {
        case "ViewContent":
          if (localStorage.getItem("pc-product")) {
            localStorage.removeItem("pc-product");
          }

          if (data.variants && data.variants.length > 1) {
            localStorage.setItem("pc-product", "variants");
          } else {
            localStorage.setItem("pc-product", "simple");
          }

          break;
        case "productPageLoaded":
          if (localStorage.getItem("pc-product") !== "simple") {
            return;
          }

          self.productIdWix = data?.productId;

          if (!self.productIdWix) {
            throw new Error("Can not find product ID WIX");
          }

          self.#getPrintcartProduct().then((res) => {
            self.productIdPrintcart = res?.data?.id;

            if (!self.productIdPrintcart) {
              throw new Error("Can not find product ID Printcart");
            }

            self.#addStyle();
            self.#createBtn();
            self.#openSelectModal();
            self.#registerCloseModal();
            self.#modalTrap();

            const btn = document.querySelector("button#pc-btn");

            const isDesignEnabled = res.data.enable_design;
            const isUploadEnabled = res.data.enable_upload;

            if (isDesignEnabled) {
              self.#designerInstance = new PrintcartDesigner({
                token: self.token,
                productId: self.productIdPrintcart,
                options: {
                  ...self.options?.designerOptions,
                  designerUrl: self.#designerUrl,
                },
              });

              self.#registerDesignerEvents();

              if (btn && btn instanceof HTMLButtonElement) {
                btn.disabled = false;
              }
            }

            if (isUploadEnabled) {
              self.#uploaderInstance = new PrintcartUploader({
                token: self.token,
                productId: self.productIdPrintcart,
              });

              self.#registerUploaderEvents();

              if (btn && btn instanceof HTMLButtonElement) {
                btn.disabled = false;
              }
            }

            const handleClick = () => {
              if (self.#designerInstance && !self.#uploaderInstance) {
                self.#designerInstance.render();
              }

              if (!self.#designerInstance && self.#uploaderInstance) {
                self.#uploaderInstance.open();
              }

              if (self.#designerInstance && self.#uploaderInstance) {
                self.#openModal();
              }
            };

            if (btn && btn instanceof HTMLButtonElement) {
              btn.onclick = handleClick;
            }
          });

          break;
        case "CustomizeProduct":
          if (localStorage.getItem("pc-product") !== "variants") {
            return;
          }

          self.productIdWix = data?.variantId;

          if (!self.productIdWix) {
            throw new Error("Can not find product variant ID WIX");
          }

          self.#getPrintcartProduct().then((res) => {
            self.productIdPrintcart = res.data.id;

            if (!self.productIdPrintcart) {
              throw new Error("Can not find product ID Printcart");
            }

            self.#addStyle();
            self.#createBtn();
            self.#openSelectModal();
            self.#registerCloseModal();
            self.#modalTrap();

            const btn = document.querySelector("button#pc-btn");

            const isDesignEnabled = res.data.enable_design;
            const isUploadEnabled = res.data.enable_upload;

            if (isDesignEnabled) {
              self.#designerInstance = new PrintcartDesigner({
                token: self.token,
                productId: self.productIdPrintcart,
                options: {
                  ...self.options?.designerOptions,
                  designerUrl: self.#designerUrl,
                },
              });

              self.#registerDesignerEvents();

              if (btn && btn instanceof HTMLButtonElement) {
                btn.disabled = false;
              }
            }

            if (isUploadEnabled) {
              self.#uploaderInstance = new PrintcartUploader({
                token: self.token,
                productId: self.productIdPrintcart,
              });

              self.#registerUploaderEvents();

              if (btn && btn instanceof HTMLButtonElement) {
                btn.disabled = false;
              }
            }

            const handleClick = () => {
              if (self.#designerInstance && !self.#uploaderInstance) {
                self.#designerInstance.render();
              }

              if (!self.#designerInstance && self.#uploaderInstance) {
                self.#uploaderInstance.open();
              }

              if (self.#designerInstance && self.#uploaderInstance) {
                self.#openModal();
              }
            };

            if (btn && btn instanceof HTMLButtonElement) {
              btn.onclick = handleClick;
            }
          });

          break;
        case "Purchase":
          if (!localStorage.getItem("pc-design-ids")) {
            return;
          }

          const designIds = localStorage.getItem("pc-design-ids");
          self.orderIdWix = data?.orderId;
          self.orderNumberWix = data?.id;

          if (!self.orderIdWix || !self.orderNumberWix) {
            throw new Error("Can not find order ID WIX or order number WIX");
          }

          if (!designIds) {
            throw new Error("Can not find design Ids");
          }

          self.#createProjectPrintcart(self.orderNumberWix, self.orderIdWix, JSON.parse(designIds));

          break;
      }
    });
  }

  #openSelectModal() {
    const uploadImgSrc = "https://files.printcart.com/common/upload.svg";
    const designImgSrc = "https://files.printcart.com/common/design.svg";

    const inner = `
      <button aria-label="Close" id="pc-select_close-btn"><span data-modal-x></span></button>
      <div id="pc-select_header">Choose a way to design this product</div>
      <div id="pc-select_container">
        <button class="pc-select_btn" id="pc-select_btn_upload">
          <div aria-hidden="true" class="pc-select_btn_wrap">
            <div class="pc-select_btn_img">
              <img src="${uploadImgSrc}" alt="Printcart Uploader" />
            </div>
            <div class="pc-select_btn_content">
              <h2>Upload a full design</h2>
              <ul>
                <li>Have a complete design</li>
                <li>Have your own designer</li>
              </ul>
            </div>
          </div>
          <div class="visually-hidden">Upload Design file</div>
        </button>
        <button class="pc-select_btn" id="pc-select_btn_design">
          <div aria-hidden="true" class="pc-select_btn_wrap">
            <div class="pc-select_btn_img">
              <img src="${designImgSrc}" alt="Printcart Designer" />
            </div>
            <div class="pc-select_btn_content">
              <h2>Design here online</h2>
              <ul>
                <li>Already have your concept</li>
                <li>Customize every details</li>
              </ul>
            </div>
          </div>
          <div class="visually-hidden">Upload Design file</div>
        </button>
      </div>
    `;

    const wrap = document.createElement("div");
    wrap.id = "pc-select_wrap";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("tabIndex", "-1");
    wrap.innerHTML = inner;

    document.body.appendChild(wrap);

    const design = () => {
      if (this.#designerInstance) {
        this.#closeModal();

        this.#designerInstance.render();
      }
    };

    const upload = () => {
      if (this.#uploaderInstance) {
        this.#closeModal();

        this.#uploaderInstance.open();
      }
    };

    const uploadBtn = document.getElementById("pc-select_btn_upload");
    const designBtn = document.getElementById("pc-select_btn_design");

    if (uploadBtn) uploadBtn?.addEventListener("click", upload);
    if (designBtn) designBtn?.addEventListener("click", design);
  }

  #openModal() {
    const modal = document.getElementById("pc-select_wrap");

    if (modal) {
      modal.style.display = "flex";
      document.body.classList.toggle("pc-overflow");
    }

    const closeBtn = modal?.querySelector("#pc-select_close-btn");
    if (closeBtn && closeBtn instanceof HTMLButtonElement) closeBtn.focus();
  }

  #closeModal() {
    const modal = document.getElementById("pc-select_wrap");

    if (modal) {
      modal.style.display = "none";
      document.body.classList.toggle("pc-overflow");
    }
  }

  #registerCloseModal() {
    const closeModalBtn = document.getElementById("pc-select_close-btn");

    const handleClose = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        this.#closeModal();
      }
    };

    window.addEventListener("keydown", handleClose);
    closeModalBtn?.addEventListener("click", () => this.#closeModal());
  }

  #modalTrap() {
    const modal = document.getElementById("pc-select_wrap");

    const focusableEls = modal?.querySelectorAll("button");

    const firstFocusableEl = focusableEls && focusableEls[0];
    const lastFocusableEl = focusableEls && focusableEls[focusableEls.length - 1];

    const handleModalTrap = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (lastFocusableEl && document.activeElement === firstFocusableEl) {
            lastFocusableEl.focus();
            e.preventDefault();
          }
        } else {
          if (firstFocusableEl && document.activeElement === lastFocusableEl) {
            firstFocusableEl.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleModalTrap);
  }

  #handleUploadSuccess(data: [DataWrap]) {
    const ids = data.map((design) => design.data.id);

    let input = <HTMLInputElement>document.querySelector('input[name="properties[_pcDesignIds]"]');

    if (input) {
      input.value += `,${ids.join()}`;
    } else {
      input = <HTMLInputElement>document.createElement("input");
      input.type = "hidden";
      input.name = "properties[_pcDesignIds]";
      input.className = "pc-designer_input";
      input.value = ids.join();

      this.#productForm?.appendChild(input);
    }

    // Show design image list on product page
    const previewWrap = document.querySelector(".pc-preview-wrap") || document.createElement("div");

    previewWrap.className = "pc-preview-wrap";

    data.forEach((design) => {
      if (!design.data.design_image.url) return;

      const preview = document.createElement("div");
      preview.className = "pc-preview";
      preview.setAttribute("data-pc-design-id", design.data.id);

      const btn = document.createElement("button");
      btn.className = "pc-btn pc-danger-btn";
      btn.innerHTML = this.options?.removeUploaderBtnText ? this.options.removeUploaderBtnText : "Remove";
      btn.onclick = () => {
        const newIds = input.value.split(",").filter((id) => id !== design.data.id);

        input.value = newIds.join();

        preview.remove();
      };

      const image = document.createElement("img");
      image.src = design.data.design_image.url;
      image.className = "pc-uploader-image";

      const overlay = document.createElement("div");
      overlay.className = "pc-preview-overlay";

      overlay.appendChild(btn);
      preview.appendChild(overlay);
      preview.appendChild(image);
      previewWrap.appendChild(preview);
    });

    const wrap = document.querySelector("div#pc-designer_wrap");

    if (!document.querySelector(".princart-preview-heading")) {
      const heading = document.createElement("h5");
      heading.className = "princart-preview-heading";
      heading.innerHTML = "Your artworks";

      wrap?.appendChild(heading);
    }

    wrap?.appendChild(previewWrap);

    const callback = this.options?.onUploadSuccess;

    if (callback) callback(data, this.#uploaderInstance);
  }

  #handleDesignSuccess(data: [Data]) {
    const self = this;
    const ids = data.map((design) => design.id);

    let input = <HTMLInputElement>document.querySelector('input[name="properties[_pcDesignIds]"]');

    if (input) {
      input.value += `,${ids.join()}`;
    } else {
      input = <HTMLInputElement>document.createElement("input");
      input.type = "hidden";
      input.name = "properties[_pcDesignIds]";
      input.className = "pc-designer_input";
      input.value = ids.join();

      this.#productForm?.appendChild(input);
    }

    const previewWrap = document.querySelector(".pc-preview-wrap") || document.createElement("div");

    previewWrap.className = "pc-preview-wrap";

    if (localStorage.getItem("pc-design-ids")) {
      localStorage.removeItem("pc-design-ids");
    }

    localStorage.setItem("pc-design-ids", JSON.stringify(ids));

    data.forEach((design) => {
      if (!design.design_image.url) return;

      const preview = document.createElement("div");
      preview.className = "pc-preview";
      preview.setAttribute("data-pc-design-id", design.id);

      const editBtn = document.createElement("button");
      editBtn.className = "pc-btn pc-primary-btn";
      editBtn.style.borderRadius = "5px";
      editBtn.innerHTML = "Edit";
      editBtn.onclick = () => {
        self.#designerInstance.editDesign(design.id);
      };

      const removeBtn = document.createElement("button");
      removeBtn.className = "pc-btn pc-danger-btn";
      removeBtn.style.borderRadius = "5px";
      removeBtn.innerHTML = "Remove";
      removeBtn.onclick = () => {
        const newIds = input.value.split(",").filter((id) => id !== design.id);

        input.value = newIds.join();

        preview.remove();
      };

      const image = document.createElement("img");
      image.src = design.preview_image?.url || design.design_image.url;
      image.className = "pc-uploader-image";

      const overlay = document.createElement("div");
      overlay.className = "pc-preview-overlay";

      overlay.appendChild(editBtn);
      overlay.appendChild(removeBtn);
      preview.appendChild(overlay);
      preview.appendChild(image);
      previewWrap.appendChild(preview);
    });

    const wrap = document.querySelector("div#pc-designer_wrap");

    wrap?.appendChild(previewWrap);

    const callback = this.options?.onDesignCreateSuccess;

    if (callback) callback(data, this.#designerInstance);
  }

  #registerUploaderEvents() {
    if (this.#uploaderInstance) {
      this.#uploaderInstance.on("upload-success", (data: [DataWrap]) => {
        this.#handleUploadSuccess(data);
        this.#uploaderInstance.close();
      });
    }
  }

  #registerDesignerEvents() {
    if (this.#designerInstance) {
      this.#designerInstance.on("upload-success", (data: [Data]) => {
        this.#handleDesignSuccess(data);
        this.#designerInstance.close();
      });

      this.#designerInstance.on("edit-success", (data: Data) => {
        if (!data.design_image.url) return;

        const img = document.querySelector(`[data-pc-design-id="${data.id}"] img`);

        if (!img || !(img instanceof HTMLImageElement)) {
          throw new Error("Can't find image element");
        }

        img.src = data.design_image.url;

        const callback = this.options?.onDesignEditSuccess;

        this.#designerInstance.close();

        if (callback) callback(data, this.#designerInstance);
      });
    }
  }

  #getUnauthToken() {
    const src = this.#getScriptSrc();

    const url = new URL(src);

    const params = new URLSearchParams(url.search);

    const token = params.get("shopT");

    return token;
  }

  #getScriptSrc() {
    const isDev = import.meta.env.MODE === "development";

    const src = isDev ? import.meta.url : (document.currentScript as HTMLScriptElement).src;

    return src;
  }

  #addStyle() {
    const sdkUrl = import.meta.env.VITE_SDK_URL ? import.meta.env.VITE_SDK_URL : "https://unpkg.com/@printcart/shopify-integration/dist";

    const link = document.createElement("link");

    link.rel = "stylesheet";
    link.href = `${sdkUrl}/style.css`;

    document.head.appendChild(link);
  }

  async #getPrintcartProduct() {
    try {
      const printcartApiUrl = `${this.#apiUrl}/integration/wix/products/${this.productIdWix}`;

      const token = this.token;

      if (!token) {
        throw new Error("Missing Printcart Unauth Token");
      }

      const printcartPromise = await fetch(printcartApiUrl, {
        headers: {
          "X-PrintCart-Unauth-Token": token,
        },
      });

      const product = await printcartPromise.json();

      return product;
    } catch (error) {
      //@ts-ignore
      console.error("There has been a problem with your fetch operation:", error);

      return;
    }
  }

  #createBtn() {
    const cartForm = this.#productForm;

    if (!cartForm?.parentNode) {
      console.log("Can not find cart form");

      return;
    }

    const wrap = document.createElement("div");
    wrap.id = "pc-designer_wrap";

    const button = document.createElement("button");
    button.id = "pc-btn";
    button.className = "button CoreButtonNext3690398815__root Focusable4066241217__root Button3176414074__root StatesButton3612784068__root _36nLbs";
    button.innerHTML = this.options?.designBtnText ? this.options.designBtnText : "Start Design";
    button.style.marginTop = "1.8rem";
    button.disabled = true;

    wrap.appendChild(button);

    cartForm.appendChild(wrap);
  }

  async #createProjectPrintcart(_orderNumber: string, _orderId: string, _designIds: []) {
    try {
      const createProjectApiUrl = `${this.#apiUrl}/projects`;

      const token = this.token;

      if (!token) {
        throw new Error("Missing Printcart Unauth Token");
      }

      const dataProject = {
        name: `${_orderNumber}`,
        status: "processing",
        design_ids: _designIds,
        order_detail: {
          id: _orderId,
        },
      };

      await fetch(createProjectApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-PrintCart-Unauth-Token": token,
        },
        body: JSON.stringify(dataProject),
      });
    } catch (error) {
      //@ts-ignore
      console.error("There has been a problem with your fetch operation:", error);

      return;
    }
  }
}

const prepare = async () => {
  if (import.meta.env.DEV) {
    // const { worker } = require("./mocks/browser");
    //@ts-ignore
    const { worker } = await import("../mocks/browser");
    worker.start();
  }
};

prepare().then(() => new PrintcartDesignerWix());

// new PrintcartDesignerWix();
