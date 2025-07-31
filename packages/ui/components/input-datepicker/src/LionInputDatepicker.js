/* eslint-disable import/no-extraneous-dependencies */
import { LionCalendar } from '@lion/ui/calendar.js';
import { uuid } from '@lion/ui/core.js';
import { html, css } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { LionInputDate } from '@lion/ui/input-date.js';
import { IsDate } from '@lion/ui/form-core.js';
import {
  OverlayMixin,
  withBottomSheetConfig,
  withModalDialogConfig,
  ArrowMixin,
} from '@lion/ui/overlays.js';
import { LocalizeMixin } from '@lion/ui/localize-no-side-effects.js';
import { ScopedElementsMixin } from '../../core/src/ScopedElementsMixin.js';
import { localizeNamespaceLoader } from './localizeNamespaceLoader.js';

/**
 * @typedef {import('../../form-core/src/validate/Validator.js').Validator} Validator
 * @typedef {import('lit').RenderOptions} RenderOptions
 */

/**
 * @customElement lion-input-datepicker
 */
export class LionInputDatepicker extends ScopedElementsMixin(
  ArrowMixin(OverlayMixin(LocalizeMixin(LionInputDate))),
) {
  static get scopedElements() {
    return {
      ...super.scopedElements,
      'lion-calendar': LionCalendar,
    };
  }

  static get styles() {
    return [
      ...super.styles,
      css`
        .noto-sans-400 {
          font-family: 'Noto Sans', sans-serif;
          font-optical-sizing: auto;
          font-weight: 400;
          font-style: normal;
          font-variation-settings: 'wdth' 100;
        }

        .calendar__overlay-frame {
          display: inline-block;
          position: relative;
        }

        .calendar-overlay__header {
          display: flex;
        }

        .calendar-overlay__heading {
          padding: 16px 16px 8px;
          flex: 1;
        }

        .calendar-overlay__heading > .calendar-overlay__close-button {
          flex: none;
        }

        .calendar-overlay__close-button {
          min-width: 40px;
          min-height: 32px;
          border-width: 0;
          padding: 0;
          font-size: 24px;
        }
        .calendar-overlay__footer {
          display: flex;
          justify-content: flex-end;
          padding: 12px 16px;
          background-color: #ebebeb;
          border-radius: 0 0 16px 16px;
        }

        .calendar-overlay__cancel-button {
          background: transparent;
          border: 0;
          padding: 6px 12px;
          cursor: pointer;
          font: inherit;
          font-size: 14px;
          line-height: 20px;
          color: #3b608f;
        }
      `,
    ];
  }

  /** @type {any} */
  static get properties() {
    return {
      /**
       * The heading to be added on top of the calendar overlay.
       * Naming chosen from an Application Developer perspective.
       * For a Subclasser 'calendarOverlayHeading' would be more appropriate.
       */
      calendarHeading: {
        type: String,
        attribute: 'calendar-heading',
      },
      /**
       * The slot to put the invoker button in. Can be 'prefix', 'suffix', 'before' and 'after'.
       * Default will be 'suffix'.
       */
      _calendarInvokerSlot: {
        attribute: false,
      },

      __calendarMinDate: {
        attribute: false,
      },

      __calendarMaxDate: {
        attribute: false,
      },

      __calendarDisableDates: {
        attribute: false,
        type: Array,
      },
    };
  }

  get slots() {
    return {
      ...super.slots,
      [this._calendarInvokerSlot]: () => this._invokerTemplate(),
    };
  }

  static get localizeNamespaces() {
    return [{ 'lion-input-datepicker': localizeNamespaceLoader }, ...super.localizeNamespaces];
  }

  /**
   * @protected
   */
  get _invokerNode() {
    return /** @type {HTMLElement} */ (this.querySelector(`#${this.__invokerId}`));
  }

  /**
   * @type {LionCalendar}
   * @protected
   */
  get _calendarNode() {
    return /** @type {LionCalendar} */ (
      this._overlayCtrl.contentNode.querySelector('[slot="content"]')
    );
  }

  constructor() {
    super();
    /** @private */
    this.__invokerId = uuid(this.localName);
    /** @protected */
    this._calendarInvokerSlot = 'suffix';

    // Configuration flags for subclassers
    /** @protected */
    this._focusCentralDateOnCalendarOpen = true;
    /** @protected */
    this._hideOnUserSelect = true;
    /** @protected */
    this._syncOnUserSelect = true;
    /** @protected */
    this._isHandlingCalendarUserInput = false;

    /** @private */
    this.__openCalendarOverlay = this.__openCalendarOverlay.bind(this);
    /** @protected */
    this._onCalendarUserSelectedChanged = this._onCalendarUserSelectedChanged.bind(this);
  }

  /**
   * @param {string} [name]
   * @param {unknown} [oldValue]
   * @param {import('lit').PropertyDeclaration} [options]
   * @returns {void}
   */
  requestUpdate(name, oldValue, options) {
    super.requestUpdate(name, oldValue, options);

    if (name === 'disabled' || name === 'readOnly') {
      this.__toggleInvokerDisabled();
    }
  }

  /** @private */
  __toggleInvokerDisabled() {
    if (this._invokerNode) {
      const invokerNode = /** @type {HTMLElement & {disabled: boolean}} */ (this._invokerNode);
      invokerNode.disabled = this.disabled || this.readOnly;
    }
  }

  /** @param {import('lit').PropertyValues } changedProperties */
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    this.__toggleInvokerDisabled();
  }

  /** @param {import('lit').PropertyValues } changedProperties */
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('validators')) {
      const validators = [...(this.validators || [])];
      this.__syncDisabledDates(validators);
    }
    if (changedProperties.has('label')) {
      this.calendarHeading = this.calendarHeading || this.label;
    }
  }

  /**
   * Defining this overlay as a templates from OverlayMixin
   * this is our source to give as .contentNode to OverlayController.
   * Important: do not change the name of this method.
   * @protected
   */
  _overlayTemplate() {
    // TODO: add performance optimization to only render the calendar if needed
    // When not opened (usually on init), it does not need to be rendered.
    // This would make first paint quicker
    return html`
      <div id="overlay-content-node-wrapper">
        ${this._overlayFrameTemplate()} ${this._arrowNodeTemplate()}
      </div>
    `;
  }

  _overlayFrameTemplate() {
    return html`
      <div class="calendar__overlay-frame noto-sans-400">
        <div class="calendar-overlay">
          <div>${this._calendarTemplate()}</div>
          <div class="calendar-overlay__footer">
            <button class="calendar-overlay__cancel-button" @click="${this._onCancelClick}">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _onCancelClick() {
    this._overlayCtrl.hide();
    this.dispatchEvent(
      new CustomEvent('calendar-cancelled', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    return html`
      <div class="form-field__group-one">${this._groupOneTemplate()}</div>
      <div class="form-field__group-two">
        ${this._groupTwoTemplate()} ${this._overlayTemplate()}
      </div>
    `;
  }

  /**
   * Subclassers can replace this with their custom extension of
   * LionCalendar, like `<my-calendar id="calendar"></my-calendar>`
   */
  // eslint-disable-next-line class-methods-use-this
  _calendarTemplate() {
    return html`
      <lion-calendar
        slot="content"
        .selectedDate="${
          /** @type {typeof LionInputDatepicker} */ (this.constructor).__getSyncDownValue(
            this.modelValue,
          )
        }"
        .minDate="${this.__calendarMinDate}"
        .maxDate="${this.__calendarMaxDate}"
        .disableDates="${ifDefined(this.__calendarDisableDates)}"
        @user-selected-date-changed="${this._onCalendarUserSelectedChanged}"
      ></lion-calendar>
    `;
  }

  /**
   * Subclassers can replace this with their custom extension invoker,
   * like `<my-button><calendar-icon></calendar-icon></my-button>`
   */
  // eslint-disable-next-line class-methods-use-this
  _invokerTemplate() {
    return html`
      <button
        type="button"
        @click="${this.__openCalendarOverlay}"
        id="${this.__invokerId}"
        aria-label="${this.msgLit('lion-input-datepicker:openDatepickerLabel')}"
        title="${this.msgLit('lion-input-datepicker:openDatepickerLabel')}"
      >
        ${this._invokerIconTemplate()}
      </button>
    `;
  }

  /**
   * Subclassers can replace this with their custom extension invoker icon
   */
  // eslint-disable-next-line class-methods-use-this
  _invokerIconTemplate() {
    return html`<svg
      width="18"
      height="20"
      viewBox="0 0 18 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M16 2H15V0H13V2H5V0H3V2H2C0.89 2 0 2.9 0 4V18C0 19.1 0.89 20 2 20H16C17.1 20 18 19.1 18 18V4C18 2.9 17.1 2 16 2ZM16 18H2V7H16V18ZM3.5 11C3.5 9.62 4.62 8.5 6 8.5C7.38 8.5 8.5 9.62 8.5 11C8.5 12.38 7.38 13.5 6 13.5C4.62 13.5 3.5 12.38 3.5 11Z"
        fill="#43474E"
      />
    </svg> `;
  }

  _setupOverlayCtrl() {
    super._setupOverlayCtrl();

    this.__datepickerBeforeShow = () => {
      this._overlayCtrl.updateConfig(this._defineOverlayConfig());
    };
    this._overlayCtrl.addEventListener('before-show', this.__datepickerBeforeShow);
  }

  /**
   * @override Configures OverlayMixin
   * @desc overrides default configuration options for this component
   * @returns {Object}
   */
  // eslint-disable-next-line class-methods-use-this
  _defineOverlayConfig() {
    if (window.innerWidth >= 600) {
      this.hasArrow = true;
      return {
        ...withModalDialogConfig(),
        hidesOnOutsideClick: true,
        visibilityTriggerFunction: undefined,
        ...super._defineOverlayConfig(),
        popperConfig: {
          ...super._defineOverlayConfig().popperConfig,
          placement: 'bottom',
        },
      };
    }
    this.hasArrow = false;
    return withBottomSheetConfig();
  }

  async __openCalendarOverlay() {
    await this._overlayCtrl.show();
    await Promise.all([
      /** @type {import('lit').LitElement} */ (this._overlayCtrl.contentNode).updateComplete,
      this._calendarNode.updateComplete,
    ]);
    this._onCalendarOverlayOpened();
  }

  /**
   * Lifecycle callback for subclassers
   * @overridable
   */
  _onCalendarOverlayOpened() {
    if (this._focusCentralDateOnCalendarOpen) {
      this._calendarNode.initCentralDate();
    }
  }

  /**
   * Triggered when a user selects a date from the calendar overlay
   * @param {{ target: { selectedDate: Date }}} opts
   */
  _onCalendarUserSelectedChanged({ target: { selectedDate } }) {
    if (this._hideOnUserSelect) {
      this._overlayCtrl.hide();
    }
    if (this._syncOnUserSelect) {
      // Synchronize new selectedDate value to input
      this._isHandlingUserInput = true;
      this._isHandlingCalendarUserInput = true;

      if (
        Array.isArray(this.__calendarDisableDates) &&
        this.__calendarDisableDates.includes(selectedDate)
      ) {
        // If the selected date is disabled, reset the values
        this.modelValue = undefined;
      } else {
        this.modelValue = selectedDate;
      }

      this._isHandlingUserInput = false;
      this._isHandlingCalendarUserInput = false;
    }
  }

  /**
   * @enhance FormatMixin: sync to view value after handling calendar user input
   * @protected
   */
  _reflectBackOn() {
    return super._reflectBackOn() || this._isHandlingCalendarUserInput;
  }

  /**
   * The LionCalendar shouldn't know anything about the modelValue;
   * it can't handle Unparseable dates, but does handle 'undefined'
   * @param {?} modelValue
   * @returns {Date | undefined} a 'guarded' modelValue
   */
  static __getSyncDownValue(modelValue) {
    const isDate = new IsDate();
    const hasError = isDate.execute(modelValue);
    return hasError ? undefined : modelValue;
  }

  /**
   * Validators contain the information to synchronize the input with
   * the min, max and enabled dates of the calendar.
   * @param {Validator[]} validators - errorValidators or warningValidators array
   */
  __syncDisabledDates(validators) {
    // On every validator change, synchronize disabled dates: this means
    // we need to extract minDate, maxDate, minMaxDate and disabledDates validators
    validators.forEach(v => {
      const vctor = /** @type {typeof import('@lion/ui/form-core.js').Validator} */ (v.constructor);
      if (vctor.validatorName === 'MinDate' && v.type === 'error') {
        this.__calendarMinDate = v.param;
      } else if (vctor.validatorName === 'MaxDate' && v.type === 'error') {
        this.__calendarMaxDate = v.param;
      } else if (vctor.validatorName === 'MinMaxDate' && v.type === 'error') {
        this.__calendarMinDate = v.param.min;
        this.__calendarMaxDate = v.param.max;
      } else if (vctor.validatorName === 'IsDateDisabled' && v.type === 'error') {
        this.__calendarDisableDates = v.param;
      }
    });
  }

  /**
   * Responsible for listening param change event and
   * sync the calendar dates with the updated validator params
   * @param {Event|CustomEvent} e
   * @param {{validator: Validator}} metaData
   * @protected
   */
  // @ts-ignore Binding element 'any' implicitly has an 'any' type.
  _onValidatorUpdated(e, metaData) {
    // @ts-ignore
    super._onValidatorUpdated(e, metaData);
    if (e.type === 'param-changed') {
      this.__syncDisabledDates([metaData.validator]);
    }
  }

  /**
   * @override Configures OverlayMixin
   */
  get _overlayInvokerNode() {
    return this._invokerNode;
  }

  /**
   * @override Configures OverlayMixin
   */
  get _overlayContentNode() {
    if (this._cachedOverlayContentNode) {
      return this._cachedOverlayContentNode;
    }
    this._cachedOverlayContentNode = /** @type {HTMLElement} */ (
      /** @type {ShadowRoot} */ (this.shadowRoot).querySelector('.calendar__overlay-frame')
    );

    return this._cachedOverlayContentNode;
  }
}
