import PrintcartDesigner from "./printcartDesigner";
import "./main.css";

declare global {
  interface Window {
    __printcartWixLegacyHotfixInstalled?: boolean;
  }
}

function installStorefrontHotfixes() {
  if (window.__printcartWixLegacyHotfixInstalled) return;
  window.__printcartWixLegacyHotfixInstalled = true;

  let printcartProductIdPromise: Promise<string | null> | null = null;
  let lastHandledAt = 0;

  const getUnauthToken = () => {
    const script = document.querySelector(
      "script#pc-wix-integration-sdk"
    ) as HTMLScriptElement | null;
    if (!script?.src) return null;

    return new URL(script.src).searchParams.get("shopT");
  };

  const getPrintcartProductId = async () => {
    if (printcartProductIdPromise) return printcartProductIdPromise;

    printcartProductIdPromise = (async () => {
      const token = getUnauthToken();
      const productEl = document.querySelector("printcart-pod[product-id]");
      const wixProductId = productEl?.getAttribute("product-id");
      if (!token || !wixProductId) return null;

      const response = await fetch(
        `https://api.printcart.com/v1/integration/wix/products/${wixProductId}`,
        { headers: { "X-PrintCart-Unauth-Token": token } }
      );
      if (!response.ok) return null;

      const product = await response.json();
      return product?.data?.id ?? null;
    })();

    return printcartProductIdPromise;
  };

  const loadingMarkup = `
    <span class="pc-wix-loading-action pc-wix-loading-primary">
      <span class="pc-wix-loading-icon"></span>
      <span class="pc-wix-loading-copy">
        <span class="pc-wix-loading-label">Customize Online</span>
        <span class="pc-wix-loading-subtitle">Use the online designer</span>
      </span>
    </span>
    <span class="pc-wix-loading-action pc-wix-loading-secondary">
      <span class="pc-wix-loading-icon"></span>
      <span class="pc-wix-loading-copy">
        <span class="pc-wix-loading-label">Upload Artwork</span>
        <span class="pc-wix-loading-subtitle">Send a print-ready file</span>
      </span>
    </span>
    <span class="pc-wix-loading-action pc-wix-loading-outline">
      <span class="pc-wix-loading-icon"></span>
      <span class="pc-wix-loading-copy">
        <span class="pc-wix-loading-label">Request a Quote</span>
        <span class="pc-wix-loading-subtitle">Get a custom price</span>
      </span>
    </span>
  `;

  const enhanceLoadingButtons = () => {
    if (!document.querySelector("printcart-pod[product-id]")) return;

    document.querySelectorAll("button").forEach((button) => {
      if (button.getAttribute("data-pc-loading-placeholder") === "1") return;
      const text = (button.textContent ?? "").trim();
      if (!/^Loading\.?\.?\.?$/i.test(text)) return;

      button.setAttribute("data-pc-loading-placeholder", "1");
      button.setAttribute("aria-label", "Loading Printcart design options");
      button.classList.add("pc-wix-loading-actions");
      button.innerHTML = loadingMarkup;
    });
  };

  const ensureToolFrame = (wrapperId: string, iframeId: string) => {
    let wrapper = document.getElementById(wrapperId) as HTMLDivElement | null;
    let iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;

    if (!wrapper || !iframe) {
      wrapper = document.createElement("div");
      wrapper.id = wrapperId;
      iframe = document.createElement("iframe");
      iframe.id = iframeId;
      iframe.width = "100%";
      iframe.height = "100%";
      iframe.style.borderWidth = "0";
      wrapper.appendChild(iframe);
      document.body.appendChild(wrapper);
    }

    wrapper.style.cssText =
      "position:fixed;top:0;left:0;width:100vw;height:100vh;opacity:1;visibility:visible;z-index:1000000;background:#fff;";
    iframe.style.visibility = "visible";
    return iframe;
  };

  const openDesigner = async () => {
    const token = getUnauthToken();
    const productId = await getPrintcartProductId();
    if (!token || !productId) return;

    const url = new URL("https://customizer.printcart.com");
    url.searchParams.set("api_key", token);
    url.searchParams.set("product_id", productId);
    url.searchParams.set("parentUrl", window.location.href);
    ensureToolFrame("pc-designer-iframe-wrapper", "pc-designer-iframe").src =
      url.href;
  };

  const openUploader = async () => {
    const token = getUnauthToken();
    const productId = await getPrintcartProductId();
    if (!token || !productId) return;

    const url = new URL("https://upload-tool.pages.dev");
    url.searchParams.set("token", token);
    url.searchParams.set("productId", productId);
    url.searchParams.set("parentUrl", window.location.href);
    ensureToolFrame("pc-uploader-iframe-wrapper", "pc-uploader-iframe").src =
      url.href;
  };

  const findPrintcartAction = (event: Event): "designer" | "uploader" | null => {
    const path =
      typeof event.composedPath === "function" ? event.composedPath() : [];
    const candidates = [
      ...path,
      event.target,
    ].filter((node): node is Element => node instanceof Element);

    for (const node of candidates) {
      const button =
        node instanceof HTMLButtonElement ? node : node.closest?.("button");
      if (!button) continue;
      if (button.getAttribute("data-pc-loading-placeholder") === "1") continue;

      const text = button.textContent ?? "";
      if (/Customize Online/i.test(text)) return "designer";
      if (/Upload Artwork/i.test(text)) return "uploader";
    }

    return null;
  };

  const handleBuyerAction = (event: Event) => {
    const action = findPrintcartAction(event);
    if (!action) return;

    const now = Date.now();
    if (now - lastHandledAt < 1200) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    lastHandledAt = now;

    event.preventDefault();
    event.stopImmediatePropagation();
    void (action === "designer" ? openDesigner() : openUploader());
  };

  ["pointerdown", "mousedown", "touchstart", "click"].forEach((eventName) => {
    document.addEventListener(eventName, handleBuyerAction, true);
  });

  const bindVisibleButtons = () => {
    document.querySelectorAll("button").forEach((button) => {
      if (button.getAttribute("data-pc-loading-placeholder") === "1") return;
      const text = button.textContent ?? "";
      if (!/Customize Online|Upload Artwork/i.test(text)) return;
      if (button.getAttribute("data-pc-hotfix-bound") === "1") return;

      button.setAttribute("data-pc-hotfix-bound", "1");
      button.addEventListener("click", handleBuyerAction, true);
      button.addEventListener("pointerdown", handleBuyerAction, true);
    });
  };

  bindVisibleButtons();
  enhanceLoadingButtons();
  window.setTimeout(bindVisibleButtons, 500);
  window.setTimeout(bindVisibleButtons, 1500);
  window.setTimeout(bindVisibleButtons, 3000);
  window.setTimeout(enhanceLoadingButtons, 500);
  window.setTimeout(enhanceLoadingButtons, 1500);
  window.setTimeout(enhanceLoadingButtons, 3000);
  new MutationObserver(() => {
    bindVisibleButtons();
    enhanceLoadingButtons();
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
        ? input.href
        : input.url;

    try {
      const response = await nativeFetch(input, init);
      if (!response.ok && url.includes("/functions/usage/track")) {
        console.warn("Printcart: usage tracking failed; continuing buyer flow.");
        return new Response(JSON.stringify({ ok: true, skipped: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return response;
    } catch (error) {
      if (url.includes("/functions/usage/track")) {
        console.warn("Printcart: usage tracking unavailable; continuing buyer flow.", error);
        return new Response(JSON.stringify({ ok: true, skipped: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      throw error;
    }
  };

  const style = document.createElement("style");
  style.id = "pc-wix-storefront-hotfixes";
  style.textContent = `
    [class*="_pcDrModalBody_"] {
      background: #ffffff !important;
      border: 1px solid #dfe5f2 !important;
      border-radius: 8px !important;
      box-shadow: 0 16px 44px rgba(18, 31, 67, 0.18) !important;
      padding: 24px !important;
      max-width: 560px !important;
      width: min(560px, calc(100vw - 32px)) !important;
      margin: auto !important;
    }

    [class*="_pcDrModalBody_"] form {
      background: #ffffff !important;
    }

    .pc-wix-loading-actions {
      align-items: stretch !important;
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
      color: inherit !important;
      cursor: wait !important;
      display: grid !important;
      gap: 10px !important;
      height: auto !important;
      min-height: 0 !important;
      min-width: 0 !important;
      padding: 0 !important;
      pointer-events: none !important;
      text-align: left !important;
      width: 100% !important;
    }

    .pc-wix-loading-action {
      align-items: center !important;
      border-radius: 8px !important;
      box-sizing: border-box !important;
      display: flex !important;
      gap: 12px !important;
      min-height: 54px !important;
      overflow: hidden !important;
      padding: 10px 14px !important;
      position: relative !important;
      width: 100% !important;
    }

    .pc-wix-loading-action::after {
      animation: pc-wix-loading-sweep 1.25s ease-in-out infinite !important;
      background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.18), transparent) !important;
      content: "" !important;
      inset: 0 !important;
      position: absolute !important;
      transform: translateX(-100%) !important;
    }

    .pc-wix-loading-primary {
      background: #116dff !important;
      border: 1px solid #116dff !important;
      color: #ffffff !important;
    }

    .pc-wix-loading-secondary {
      background: #111827 !important;
      border: 1px solid #111827 !important;
      color: #ffffff !important;
    }

    .pc-wix-loading-outline {
      background: #ffffff !important;
      border: 1px solid #cbd5e1 !important;
      color: #111827 !important;
    }

    .pc-wix-loading-outline::after {
      background: linear-gradient(90deg, transparent, rgb(17 109 255 / 0.08), transparent) !important;
    }

    .pc-wix-loading-icon {
      align-items: center !important;
      background: rgb(255 255 255 / 0.16) !important;
      border-radius: 8px !important;
      display: flex !important;
      flex: 0 0 34px !important;
      height: 34px !important;
      justify-content: center !important;
      width: 34px !important;
    }

    .pc-wix-loading-outline .pc-wix-loading-icon {
      background: #eff6ff !important;
    }

    .pc-wix-loading-icon::before {
      background: currentColor !important;
      border-radius: 4px !important;
      content: "" !important;
      display: block !important;
      height: 16px !important;
      opacity: 0.28 !important;
      width: 16px !important;
    }

    .pc-wix-loading-copy {
      display: grid !important;
      gap: 2px !important;
      min-width: 0 !important;
    }

    .pc-wix-loading-label {
      display: block !important;
      font-size: 14px !important;
      font-weight: 800 !important;
      line-height: 1.15 !important;
    }

    .pc-wix-loading-subtitle {
      display: block !important;
      font-size: 12px !important;
      line-height: 1.25 !important;
      opacity: 0.76 !important;
    }

    @keyframes pc-wix-loading-sweep {
      to {
        transform: translateX(100%);
      }
    }
  `;
  document.head.appendChild(style);
}

installStorefrontHotfixes();

const printcartDesigner = new PrintcartDesigner();

interface IOptions {
  buttonId?: string;
  designBtnText?: string;
  designClassName?: string;
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
  appID: string;
  productIdPC: string | null;
  orderIdWix: string | null;
  orderNumberWix: string | null;
  options?: IOptions;
  #designerUrl: string;
  #designerInstance: any;
  #uploaderInstance: any;
  #productForm: HTMLFormElement | null;
  registerListener: any;
  textReplace: any;

  constructor() {
    this.token = this.#getUnauthToken();
    this.productIdPC = null;
    this.appID = "325c68a5-64c2-440d-b093-8cea369df06b";
    this.orderIdWix = null;
    this.orderNumberWix = null;
    this.#productForm = null;
    this.textReplace = {
      start_design: "Start Design",
      pc_select_header: "Choose a way to design this product",
      upload_a_full_design: "Upload a full design",
      upload_design_file: "Upload Design file",
      have_a_complete_design: "Have a complete design",
      have_your_own_design: "Have your own designer",
      design_here_online: "Design here online",
      already_have_a_design: "Already have your concept",
      customize_every_details: "Customize every details",
    };

    // @ts-ignore
    this.options = window.PrintcartDesignerShopifyOptions;

    this.#apiUrl = "https://api.printcart.com/v1";

    this.#designerUrl = "https://customizer.printcart.com";
  }

  init() {
    const wd = window as any;
    const self = this;

    wd?.wixDevelopersAnalytics
      ? this.#registerListener("first")
      : wd.addEventListener("wixDevelopersAnalyticsReady", function () {
          self.#registerListener("second");
        });
  }

  async #getStoreDetail() {
    try {
      const printcartApiUrl = `${this.#apiUrl}/stores/store-details`;

      const token = this.token;
      if (!token) {
        throw new Error("Missing Printcart Unauth Token");
      }

      const printcartPromise = await fetch(printcartApiUrl, {
        headers: {
          "X-PrintCart-Unauth-Token": token,
        },
      });

      const storeDetail: any = await printcartPromise.json();

      const cssString = storeDetail?.data?.setting_defaults?.customCss.value;
      const textReplace = storeDetail?.data?.setting_defaults?.textReplace;

      this.textReplace = {
        start_design: textReplace?.start_design
          ? textReplace.start_design
          : "Start Design",
        pc_select_header: textReplace?.pc_select_header
          ? textReplace.pc_select_header
          : "Choose a way to design this product",
        upload_a_full_design: textReplace?.upload_a_full_design
          ? textReplace.upload_a_full_design
          : "Upload a full design",
        upload_design_file: textReplace?.upload_design_file
          ? textReplace.upload_design_file
          : "Upload Design file",
        have_a_complete_design: textReplace?.have_a_complete_design
          ? textReplace.have_a_complete_design
          : "Have a complete design",
        have_your_own_design: textReplace?.have_your_own_design
          ? textReplace.have_your_own_design
          : "Have your own designer",
        design_here_online: textReplace?.design_here_online
          ? textReplace.design_here_online
          : "Design here online",
        already_have_a_design: textReplace?.already_have_a_design
          ? textReplace.already_have_a_design
          : "Already have your concept",
        customize_every_details: textReplace?.customize_every_details
          ? textReplace.customize_every_details
          : "Customize every details",
      };

      if (cssString) {
        const styleElement = document.createElement("style");

        styleElement.textContent = cssString;
        styleElement.type = "text/css";

        document.head.appendChild(styleElement);
      }

      return storeDetail;
    } catch (error) {
      //@ts-ignore
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    }
  }

  #registerListener(par: string) {
    const self = this;
    // Log to check
    console.log("Printcart start App " + par);

    window?.wixDevelopersAnalytics.register(
      this.appID,
      function report(eventName: any, data: any) {
        switch (eventName) {
          case "ViewContent":
            if (localStorage.getItem("pc-product")) {
              localStorage.removeItem("pc-product");
            }
            break;
          case "productPageLoaded":
            // Log to check
            console.log("Printcart: productPageLoaded", data);
            if (data.variants && data.variants.length > 1) {
              return;
            }
            self.#initializeProductTools(data?.productId);
            break;
          case "CustomizeProduct":
            if (data.variants && data.variants.length < 1) {
              return;
            }
            self.#initializeProductTools(data?.variantId);
            break;
          case "Purchase":
            if (!localStorage.getItem("pc-design-ids")) {
              return;
            }
            const designIds = localStorage.getItem("pc-design-ids");
            self.orderIdWix = data?.orderId;
            self.orderNumberWix = data?.id;
            if (!self.orderIdWix) {
              throw new Error("Can not find order ID WIX");
            }
            if (!self.orderNumberWix) {
              throw new Error("Can not find order number WIX");
            }
            if (!designIds) {
              throw new Error("Can not find design Ids");
            }
            self.#createProjectPrintcart(
              self.orderNumberWix,
              self.orderIdWix,
              JSON.parse(designIds)
            );
            break;
        }
      }
    );
  }

  #initializeProductTools(productIdWix: string | null) {
    this.#productForm = document.querySelector("[data-hook='product-options']");

    this.#getStoreDetail();

    if (!this.#productForm) {
      throw new Error(
        "This script can only be used inside a Wix Product Page."
      );
    }

    if (!productIdWix) {
      throw new Error("Can not find product ID WIX");
    }

    this.#getPrintcartProduct(productIdWix).then((res) => {
      this.productIdPC = res?.data?.id;

      if (!this.productIdPC) {
        throw new Error("Can not find product ID Printcart");
      }

      this.#addStyle();
      this.#createBtn();
      this.#openSelectModal();
      this.#registerCloseModal();
      this.#modalTrap();

      const btn = document.querySelector("button#pc-btn");

      const isDesignEnabled = res.data.enable_design;
      const isUploadEnabled = res.data.enable_upload;

      if (isDesignEnabled) {
        this.#designerInstance = printcartDesigner.initDesignTool({
          token: this.token,
          productId: this.productIdPC,
          options: {
            ...this.options?.designerOptions,
            designerUrl: this.#designerUrl,
          },
        });

        this.#registerDesignerEvents();

        if (btn && btn instanceof HTMLButtonElement) {
          btn.disabled = false;
        }
      }

      if (isUploadEnabled) {
        this.#uploaderInstance = printcartDesigner.initUploader({
          token: this.token,
          productId: this.productIdPC,
        });

        this.#registerUploaderEvents();

        if (btn && btn instanceof HTMLButtonElement) {
          btn.disabled = false;
        }
      }

      const handleClick = (e: any) => {
        e.preventDefault();
        if (this.#designerInstance && !this.#uploaderInstance) {
          this.#designerInstance.render();
        }

        if (!this.#designerInstance && this.#uploaderInstance) {
          this.#uploaderInstance.open();
        }

        if (this.#designerInstance && this.#uploaderInstance) {
          this.#openModal();
        }
      };

      if (btn && btn instanceof HTMLButtonElement) {
        btn.onclick = handleClick;
      }
    });
  }

  #openSelectModal() {
    const uploadImgSrc = "https://files.printcart.com/common/upload.svg";
    const designImgSrc = "https://files.printcart.com/common/design.svg";

    const inner = `<button aria-label="Close" id="pc-select_close-btn"><span data-modal-x></span></button><div class="pc-select-wrap" id="pc-content-overlay"><div class="pc-select-inner"><div id="pc-select_header">${this.textReplace.pc_select_header}</div><div id="pc-select_container"><button class="pc-select_btn" id="pc-select_btn_upload"><div aria-hidden="true" class="pc-select_btn_wrap"><div class="pc-select_btn_img"><div class="pc-select_btn_img_inner"><img src="${uploadImgSrc}" alt="Printcart Uploader"></div></div><div class="pc-select_btn_content"><div class="pc-select_btn_content_inner"><h2 class="pc-title">${this.textReplace.upload_a_full_design}</h2><ul><li>${this.textReplace.have_a_complete_design}</li><li>${this.textReplace.have_your_own_design}</li></ul></div></div></div><div class="visually-hidden">${this.textReplace.upload_design_file}</div></button><button class="pc-select_btn" id="pc-select_btn_design"><div aria-hidden="true" class="pc-select_btn_wrap"><div class="pc-select_btn_img"><div class="pc-select_btn_img_inner"><img src="${designImgSrc}" alt="Printcart Designer"></div></div><div class="pc-select_btn_content"><div class="pc-select_btn_content_inner"><h2 class="pc-title">${this.textReplace.design_here_online}</h2><ul><li>${this.textReplace.already_have_a_design}</li><li>${this.textReplace.customize_every_details}</li></ul></div></div></div><div class="visually-hidden">${this.textReplace.upload_design_file}</div></button></div></div></div>`;

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
        document.body.classList.add("pc-overflow");
      }
    };

    const upload = () => {
      if (this.#uploaderInstance) {
        this.#closeModal();
        this.#uploaderInstance.open();
        document.body.classList.add("pc-overflow");
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
      document.body.classList.add("pc-overflow");
    }

    const closeBtn = modal?.querySelector("#pc-select_close-btn");
    if (closeBtn && closeBtn instanceof HTMLButtonElement) closeBtn.focus();
  }

  #closeModal() {
    const modal = document.getElementById("pc-select_wrap");

    if (modal) {
      modal.style.display = "none";
    }

    document.body.classList.remove("pc-overflow");
  }

  #registerCloseModal() {
    const closeModalBtn = document.getElementById("pc-select_close-btn");
    const backdropCloseModal = document.getElementById("pc-content-overlay");

    const handleClose = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        this.#closeModal();
      }
    };

    window.addEventListener("keydown", handleClose);
    closeModalBtn?.addEventListener("click", () => this.#closeModal());
    backdropCloseModal?.addEventListener("click", () => {
      const iframeWrap = document.getElementById("pc-designer-iframe-wrapper");
      if (iframeWrap?.style.visibility !== "visible") {
        this.#closeModal();
      }
    });
  }

  #modalTrap() {
    const modal = document.getElementById("pc-select_wrap");

    const focusableEls = modal?.querySelectorAll("button");

    const firstFocusableEl = focusableEls && focusableEls[0];
    const lastFocusableEl =
      focusableEls && focusableEls[focusableEls.length - 1];

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

    let input = <HTMLInputElement>(
      document.querySelector('input[name="properties[_pcDesignIds]"]')
    );

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
    const previewWrap =
      document.querySelector(".pc-preview-wrap") ||
      document.createElement("div");

    previewWrap.className = "pc-preview-wrap";

    if (localStorage.getItem("pc-design-ids")) {
      localStorage.removeItem("pc-design-ids");
    }

    localStorage.setItem("pc-design-ids", JSON.stringify(ids));

    data.forEach((design) => {
      if (!design.data.design_image.url) return;

      const preview = document.createElement("div");
      preview.className = "pc-preview";
      preview.setAttribute("data-pc-design-id", design.data.id);

      const btn = document.createElement("button");
      btn.className = "pc-btn pc-danger-btn";
      btn.innerHTML = this.options?.removeUploaderBtnText
        ? this.options.removeUploaderBtnText
        : "Remove";
      btn.onclick = (e) => {
        e.preventDefault();

        const newIds = input.value
          .split(",")
          .filter((id) => id !== design.data.id);

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

    let input = <HTMLInputElement>(
      document.querySelector('input[name="properties[_pcDesignIds]"]')
    );

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

    const previewWrap =
      document.querySelector(".pc-preview-wrap") ||
      document.createElement("div");

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
      editBtn.onclick = (e) => {
        e.preventDefault();

        self.#designerInstance.editDesign(design.id);
      };

      const removeBtn = document.createElement("button");
      removeBtn.className = "pc-btn pc-danger-btn";
      removeBtn.style.borderRadius = "5px";
      removeBtn.innerHTML = "Remove";
      removeBtn.onclick = (e) => {
        e.preventDefault();

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
      this.#uploaderInstance.on("close", () => {
        document.body.classList.remove("pc-overflow");
      });
    }
  }

  #registerDesignerEvents() {
    if (this.#designerInstance) {
      this.#designerInstance.on("upload-success", (data: [Data]) => {
        this.#handleDesignSuccess(data);
        this.#designerInstance.close();
      });

      this.#designerInstance.on("closed", () => {
        document.body.classList.remove("pc-overflow");
      });

      this.#designerInstance.on("edit-success", (data: Data) => {
        if (!data.design_image.url) return;

        const img = document.querySelector(
          `[data-pc-design-id="${data.id}"] img`
        );

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
    const src = (
      document.querySelector(
        "[id='pc-wix-integration-sdk']"
      ) as HTMLScriptElement
    ).src;
    return src;
  }

  #addStyle() {
    const sdkUrl = "https://unpkg.com/@printcart/wix-integration/dist";
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `${sdkUrl}/style.css`;

    document.head.appendChild(link);
  }

  async #getPrintcartProduct(productIdWix: string) {
    try {
      const printcartApiUrl = `${
        this.#apiUrl
      }/integration/wix/products/${productIdWix}`;

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
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );

      return;
    }
  }

  #createBtn() {
    const cartForm = this.#productForm;

    if (!cartForm?.parentNode) {
      console.log("Can not find cart form");

      return;
    }

    if (document.getElementById("pc-designer_wrap") !== null) {
      return;
    }

    const wrap = document.createElement("div");
    wrap.id = "pc-designer_wrap";

    const button = document.createElement("button");
    button.id = "pc-btn";
    button.className = this.options?.designClassName
      ? this.options?.designClassName
      : "";

    button.innerHTML = this.options?.designBtnText
      ? this.options.designBtnText
      : this.textReplace.start_design;
    button.disabled = true;

    wrap.appendChild(button);

    cartForm.appendChild(wrap);
  }

  async #createProjectPrintcart(
    _orderNumber: string,
    _orderId: string,
    _designIds: []
  ) {
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
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );

      return;
    }
  }
}

const printcartDesignerWix = new PrintcartDesignerWix();
printcartDesignerWix.init();
