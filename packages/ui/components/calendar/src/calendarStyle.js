import { css } from 'lit';

export const calendarStyle = css`
  :host {
    display: block;
  }

  :host([hidden]) {
    display: none;
  }

  .calendar {
    display: block;
    background-color: #ebebeb;
    border-radius: 16px 16px 0 0;
  }

  .calendar__navigation {
    padding: 12px 0;
    display: flex;
  }

  .calendar__navigation__month,
  .calendar__navigation__year {
    display: flex;
    flex: 1;
    justify-content: space-between;
    align-items: center;
    padding: 0 8px;
    box-sizing: border-box;
  }

  .calendar__navigation-heading {
    margin: 0.5em 0;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
  }

  .calendar__previous-button,
  .calendar__next-button {
    border: 0;
    padding: 0;
    min-width: 40px;
    min-height: 40px;
    background-color: transparent;
    color: #43474e;
  }

  .calendar__previous-button[disabled],
  .calendar__next-button[disabled] {
    color: rgba(16, 16, 16, 0.3);
  }

  .calendar__grid {
    width: 100%;
    padding: 8px 8px;
  }

  .calendar__weekday-header {
    font-weight: 400;
  }

  .calendar__day-cell {
    text-align: center;
  }

  .calendar__day-button {
    border: 0;
    color: black;
    padding: 0;
    min-width: 40px;
    min-height: 40px;
    /** give div[role=button][aria-disabled] same display type as native btn */
    display: inline-flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    border-radius: 100%;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.5px;
  }

  .calendar__day-button:focus {
    // border: 1px solid blue;
    outline: none;
    bacckground-color: rgba(27, 27, 31, 0.12);
  }

  .calendar__day-button:hover {
    background-color: rgba(27, 27, 31, 0.08);
  }

  .calendat__day-button:active {
    background-color: rgba(27, 27, 31, 0.12);
  }

  .calendar__day-button__text {
    pointer-events: none;
  }

  .calendar__day-button[today] {
    border: solid 1px rgba(59, 96, 143, 1);
  }

  .calendar__day-button[selected] {
    background: rgba(59, 96, 143, 1);
    color: #fff;
    border-radius: 100%;
  }

  .calendar__day-button[previous-month],
  .calendar__day-button[next-month] {
    color: rgb(115, 115, 115);
  }

  .calendar__day-button:hover {
    // border: 1px solid #3B608F;
  }

  .calendar__day-button[aria-disabled='true'] {
    color: #a2a2a3;
    outline: none;
  }

  .calendar__footer {
    display: flex;
    justify-content: flex-end;
    padding: 1rem;
    border-top: 1px solid #eee;
    gap: 0.5rem;
  }

  .u-sr-only {
    position: absolute;
    top: 0;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(100%);
    clip: rect(1px, 1px, 1px, 1px);
    white-space: nowrap;
    border: 0;
    margin: 0;
    padding: 0;
  }
`;
